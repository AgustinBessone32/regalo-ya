import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { projects, insertProjectSchema, contributions, users } from "@db/schema";
import { nanoid } from 'nanoid';
import { eq, and, not, sql, desc, or, exists } from "drizzle-orm";
import { createUploadthingExpressHandler } from "uploadthing/express";
import { ourFileRouter } from "./uploadthing";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  app.use("/api/uploadthing", createUploadthingExpressHandler({
    router: ourFileRouter,
    config: {
      uploadthingId: process.env.UPLOADTHING_APP_ID!,
      uploadthingSecret: process.env.UPLOADTHING_SECRET!,
      isDev: process.env.NODE_ENV === "development",
    },
  }));

  // Get list of projects (strict access control)
  app.get("/api/projects", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = req.user as any;
      if (!user?.id || !user?.email) {
        return res.status(401).json({ error: "Invalid user session" });
      }

      // Get all projects where user is either owner or contributor
      const accessibleProjects = await db
        .select({
          id: projects.id,
          title: projects.title,
          description: projects.description,
          image_url: projects.image_url,
          target_amount: projects.target_amount,
          current_amount: projects.current_amount,
          event_date: projects.event_date,
          location: projects.location,
          creator_id: projects.creator_id,
          is_public: projects.is_public,
          invitation_token: projects.invitation_token,
          payment_method: projects.payment_method,
          payment_details: projects.payment_details,
          created_at: projects.created_at,
          contribution_count: sql<number>`COUNT(DISTINCT ${contributions.id})::int`,
          is_owner: sql<boolean>`CASE WHEN ${projects.creator_id} = ${user.id} THEN true ELSE false END`
        })
        .from(projects)
        .leftJoin(
          contributions,
          eq(contributions.project_id, projects.id)
        )
        .where(
          or(
            eq(projects.creator_id, user.id),
            exists(
              db.select()
                .from(contributions)
                .where(
                  and(
                    eq(contributions.project_id, projects.id),
                    eq(contributions.contributor_name, user.email)
                  )
                )
            )
          )
        )
        .groupBy(projects.id)
        .orderBy(desc(projects.created_at));

      return res.json(accessibleProjects.map(project => ({
        ...project,
        isOwner: project.is_owner,
        contribution_count: Number(project.contribution_count)
      })));

    } catch (error: any) {
      console.error("Error fetching projects:", error);
      return res.status(500).json({ error: "Error fetching projects" });
    }
  });

  // Create project (with security checks)
  app.post("/api/projects", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = req.user as any;
      if (!user?.id) {
        return res.status(401).json({ error: "Invalid user session" });
      }

      // Prepare project data with all required fields
      const projectData = {
        ...req.body,
        creator_id: user.id,
        invitation_token: nanoid(),
        event_date: req.body.event_date ? new Date(req.body.event_date) : null,
        target_amount: Number(req.body.target_amount),
        image_url: req.body.image_url || null,
        current_amount: 0,
        is_public: false,
      };

      const validationResult = insertProjectSchema.safeParse(projectData);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid project data",
          details: validationResult.error.errors,
        });
      }

      // Insert project and return complete data
      const [newProject] = await db
        .insert(projects)
        .values(validationResult.data)
        .returning();

      if (!newProject) {
        throw new Error("Failed to create project");
      }

      console.log("Created new project:", newProject.id, "for user:", user.id);

      return res.json({
        ...newProject,
        isOwner: true,
        contribution_count: 0
      });
    } catch (error: any) {
      console.error("Error creating project:", error);
      return res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Get single project (strict access control)
  app.get("/api/projects/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = req.user as any;
      if (!user?.id || !user?.email) {
        return res.status(401).json({ error: "Invalid user session" });
      }

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      // Get project with access check
      const [projectWithAccess] = await db
        .select({
          project: projects,
          isContributor: sql<boolean>`EXISTS (
            SELECT 1 FROM ${contributions}
            WHERE ${contributions.project_id} = ${projectId}
            AND ${contributions.contributor_name} = ${user.email}
          )`
        })
        .from(projects)
        .where(eq(projects.id, projectId));

      if (!projectWithAccess) {
        return res.status(404).json({ error: "Project not found" });
      }

      const { project, isContributor } = projectWithAccess;
      const isOwner = project.creator_id === user.id;

      // Check access rights
      if (!isOwner && !isContributor) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get project details
      const projectContributions = await db
        .select()
        .from(contributions)
        .where(eq(contributions.project_id, projectId))
        .orderBy(desc(contributions.created_at));

      const [creator] = await db
        .select()
        .from(users)
        .where(eq(users.id, project.creator_id));

      return res.json({
        ...project,
        isOwner,
        creator: { email: creator?.email || "Unknown" },
        contributions: projectContributions,
        reactions: [],
        shares: { total: 0, by_platform: [] },
        avg_amount: projectContributions.reduce((sum, c) => sum + c.amount, 0) / projectContributions.length || 0,
        median_amount: 0,
        min_amount: Math.min(...projectContributions.map(c => c.amount), 0),
        max_amount: Math.max(...projectContributions.map(c => c.amount), 0),
        total_contributions: projectContributions.length,
        contribution_history: projectContributions.map(c => c.amount)
      });
    } catch (error: any) {
      console.error("Error fetching project:", error);
      return res.status(500).json({ error: "Error fetching project details" });
    }
  });

  // Create contribution (with security checks)
  app.post("/api/projects/:id/contribute", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = req.user as any;
      if (!user?.id || !user?.email) {
        return res.status(401).json({ error: "Invalid user session" });
      }

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const { amount, message, name } = req.body;
      if (!amount || !name) {
        return res.status(400).json({ error: "Amount and name are required" });
      }

      // Get project and verify access
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId));

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Create contribution and update project amount atomically
      const [contribution] = await db.transaction(async (tx) => {
        const [contribution] = await tx
          .insert(contributions)
          .values({
            amount,
            message,
            contributor_name: name,
            project_id: projectId,
          })
          .returning();

        await tx
          .update(projects)
          .set({
            current_amount: project.current_amount + amount
          })
          .where(eq(projects.id, projectId));

        return [contribution];
      });

      return res.json(contribution);
    } catch (error: any) {
      console.error("Error processing contribution:", error);
      return res.status(500).json({ error: "Failed to process contribution" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
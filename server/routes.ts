import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { projects, insertProjectSchema, contributions, users } from "@db/schema";
import { nanoid } from 'nanoid';
import { eq, and, not } from "drizzle-orm";
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

      // Get owned projects
      const ownedProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.creator_id, user.id));

      // Get contributed projects (where user is not the owner)
      const contributedProjects = await db
        .select()
        .from(projects)
        .innerJoin(
          contributions,
          and(
            eq(contributions.project_id, projects.id),
            eq(contributions.contributor_name, user.email)
          )
        )
        .where(not(eq(projects.creator_id, user.id)));

      // Get contribution counts for all projects
      const contributionCounts = await db
        .select({
          project_id: contributions.project_id,
          count: db.fn.count(contributions.id).as('count'),
        })
        .from(contributions)
        .groupBy(contributions.project_id);

      const countsMap = new Map(
        contributionCounts.map(row => [row.project_id, Number(row.count)])
      );

      // Combine and format projects
      const accessibleProjects = [
        ...ownedProjects.map(project => ({
          ...project,
          isOwner: true,
          contribution_count: countsMap.get(project.id) || 0
        })),
        ...contributedProjects.map(project => ({
          ...project,
          isOwner: false,
          contribution_count: countsMap.get(project.id) || 0
        }))
      ].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return res.json(accessibleProjects);
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

      const projectData = {
        ...req.body,
        creator_id: user.id,
        invitation_token: nanoid(),
        event_date: req.body.event_date ? new Date(req.body.event_date) : null,
        target_amount: Number(req.body.target_amount),
        image_url: req.body.image_url || null,
        current_amount: 0, // Ensure this is set
      };

      const validationResult = insertProjectSchema.safeParse(projectData);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid project data",
          details: validationResult.error.errors,
        });
      }

      const [newProject] = await db
        .insert(projects)
        .values(validationResult.data)
        .returning();

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

      // Get project with strict access control
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId));

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Check if user is owner or contributor
      const isOwner = project.creator_id === user.id;
      if (!isOwner) {
        const [contribution] = await db
          .select()
          .from(contributions)
          .where(
            and(
              eq(contributions.project_id, projectId),
              eq(contributions.contributor_name, user.email)
            )
          );

        if (!contribution) {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      // Get project details
      const projectContributions = await db
        .select()
        .from(contributions)
        .where(eq(contributions.project_id, projectId))
        .orderBy(contributions.created_at);

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

      // Verify project exists
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId));

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Create contribution
      const [contribution] = await db
        .insert(contributions)
        .values({
          amount,
          message,
          contributor_name: name,
          project_id: projectId,
        })
        .returning();

      // Update project amount
      await db
        .update(projects)
        .set({
          current_amount: project.current_amount + amount
        })
        .where(eq(projects.id, projectId));

      return res.json(contribution);
    } catch (error: any) {
      console.error("Error processing contribution:", error);
      return res.status(500).json({ error: "Failed to process contribution" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
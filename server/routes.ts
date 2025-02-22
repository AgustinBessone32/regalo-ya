import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { projects, insertProjectSchema, contributions, users } from "@db/schema";
import { nanoid } from 'nanoid';
import { eq, sql, and, or } from "drizzle-orm";
import { createUploadthingExpressHandler } from "uploadthing/express";
import { ourFileRouter } from "./uploadthing";

export function registerRoutes(app: Express): Server {
  // Setup auth first so session is available for uploadthing
  setupAuth(app);

  // Configure CORS headers for all routes
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  // Configure UploadThing with proper CORS handling
  const uploadthingHandler = createUploadthingExpressHandler({
    router: ourFileRouter,
    config: {
      uploadthingId: process.env.UPLOADTHING_APP_ID!,
      uploadthingSecret: process.env.UPLOADTHING_SECRET!,
      isDev: process.env.NODE_ENV === "development",
    },
  });

  app.use("/api/uploadthing", uploadthingHandler);

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Get list of projects (filtered by user access)
  app.get("/api/projects", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to view projects" });
      }

      const user = req.user as any;
      if (!user?.id || !user?.email) {
        return res.status(401).json({ error: "Invalid user session" });
      }

      // Get all accessible projects for the user using a UNION
      const accessibleProjects = await db.execute(sql`
        -- First select projects owned by the user
        (SELECT 
          p.*,
          COUNT(DISTINCT c.id)::int as contribution_count,
          true as "isOwner"
        FROM ${projects} p
        LEFT JOIN ${contributions} c ON c.project_id = p.id
        WHERE p.creator_id = ${user.id}
        GROUP BY p.id)

        UNION ALL

        -- Then select projects where the user has contributed
        (SELECT 
          p.*,
          COUNT(DISTINCT c.id)::int as contribution_count,
          false as "isOwner"
        FROM ${projects} p
        INNER JOIN ${contributions} c ON c.project_id = p.id
        WHERE c.contributor_name = ${user.email}
        AND p.creator_id != ${user.id}
        GROUP BY p.id)

        ORDER BY created_at DESC
      `);

      // Type check and transform the results
      const projects = accessibleProjects.rows.map(row => ({
        ...row,
        isOwner: row.isOwner === true,
        contribution_count: Number(row.contribution_count)
      }));

      res.json(projects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: error.message || "Error fetching projects" });
    }
  });

  // Get single project (with access control)
  app.get("/api/projects/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to view this project" });
      }

      const user = req.user as any;
      const projectId = parseInt(req.params.id);

      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      // Get project with user access check
      const [project] = await db
        .select({
          project: projects,
          isContributor: sql<boolean>`EXISTS (
            SELECT 1 FROM ${contributions} 
            WHERE ${contributions.project_id} = ${projectId} 
            AND ${contributions.contributor_name} = ${user.email}
          )`,
        })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Check if user has access (owner or contributor)
      const hasAccess = project.project.creator_id === user.id || project.isContributor;
      if (!hasAccess) {
        return res.status(403).json({ error: "You don't have access to this project" });
      }

      // Get project details including contributions
      const projectContributions = await db
        .select()
        .from(contributions)
        .where(eq(contributions.project_id, projectId))
        .orderBy(sql`${contributions.created_at} DESC`);

      // Get creator username
      const [creator] = await db
        .select()
        .from(users)
        .where(eq(users.id, project.project.creator_id))
        .limit(1);

      res.json({
        ...project.project,
        isOwner: project.project.creator_id === user.id,
        creator: { email: creator?.email || "Unknown User" },
        contributions: projectContributions,
        reactions: [],
        shares: {
          total: 0,
          by_platform: []
        },
        avg_amount: projectContributions.reduce((sum, c) => sum + c.amount, 0) / projectContributions.length || 0,
        median_amount: 0,
        min_amount: Math.min(...projectContributions.map(c => c.amount), 0),
        max_amount: Math.max(...projectContributions.map(c => c.amount), 0),
        total_contributions: projectContributions.length,
        contribution_history: projectContributions.map(c => c.amount)
      });
    } catch (error: any) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: error.message || "Error fetching project" });
    }
  });

  // Create project (requires authentication)
  app.post("/api/projects", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("You must be logged in to create a project");
      }

      const user = req.user as any;
      const projectData = {
        ...req.body,
        creator_id: user.id,
        invitation_token: nanoid(),
        event_date: req.body.event_date ? new Date(req.body.event_date) : null,
        target_amount: Number(req.body.target_amount),
        image_url: req.body.image_url || '',
      };

      const validationResult = insertProjectSchema.safeParse(projectData);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid data",
          errors: validationResult.error.errors,
        });
      }

      const [newProject] = await db
        .insert(projects)
        .values(validationResult.data)
        .returning();

      res.json(newProject);
    } catch (error: any) {
      console.error("Error creating project:", error);
      res.status(500).send(error.message || "Error creating project");
    }
  });

  // Contribute to project (requires authentication)
  app.post("/api/projects/:id/contribute", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          error: "You must be logged in to contribute"
        });
      }

      const user = req.user as any;
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const { amount, message, name } = req.body;
      if (!amount) {
        return res.status(400).json({
          error: "Amount is required"
        });
      }

      if (!name) {
        return res.status(400).json({
          error: "Name is required"
        });
      }

      // Create contribution record
      const [contribution] = await db
        .insert(contributions)
        .values({
          amount,
          message,
          contributor_name: name,
          project_id: projectId,
        })
        .returning();

      // Update project's current amount
      const [updatedProject] = await db
        .update(projects)
        .set({
          current_amount: sql`${projects.current_amount} + ${amount}`
        })
        .where(eq(projects.id, projectId))
        .returning();

      if (!updatedProject) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(contribution);
    } catch (error: any) {
      console.error("Error processing contribution:", error);
      res.status(500).json({
        error: error.message || "Error processing contribution"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
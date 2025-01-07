import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { projects, contributions, type User } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

declare module "express-session" {
  interface SessionData {
    passport: { user: number };
  }
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const allProjects = await db.query.projects.findMany({
        orderBy: desc(projects.createdAt),
        with: {
          creator: true,
          contributions: true,
        },
      });
      res.json(allProjects);
    } catch (error) {
      res.status(500).send("Error fetching projects");
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const [project] = await db.query.projects.findMany({
        where: eq(projects.id, parseInt(req.params.id)),
        with: {
          creator: true,
          contributions: true,
        },
      });

      if (!project) {
        return res.status(404).send("Project not found");
      }

      res.json(project);
    } catch (error) {
      res.status(500).send("Error fetching project");
    }
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const user = req.user as User;
      const [project] = await db
        .insert(projects)
        .values({
          ...req.body,
          creatorId: user.id,
          currentAmount: 0,
        })
        .returning();

      res.json(project);
    } catch (error) {
      res.status(500).send("Error creating project");
    }
  });

  // Contribution routes
  app.post("/api/projects/:id/contribute", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const contributionAmount = req.body.amount;

      const [contribution] = await db
        .insert(contributions)
        .values({
          ...req.body,
          projectId,
        })
        .returning();

      // Update project current amount by adding the new contribution
      await db
        .update(projects)
        .set({
          currentAmount: sql`${projects.currentAmount} + ${contributionAmount}`,
        })
        .where(eq(projects.id, projectId));

      res.json(contribution);
    } catch (error) {
      res.status(500).send("Error creating contribution");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
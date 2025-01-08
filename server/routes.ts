import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import type { User } from "@db/schema";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import express from 'express';
import { eq, and, or } from "drizzle-orm";
import { projects, users, userProjects, contributions, reactions, shares } from "@db/schema";
import { randomBytes } from "crypto";

declare module "express-session" {
  interface SessionData {
    passport: { user: number };
  }
}

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniquePrefix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
  }
});

export function registerRoutes(app: Express): Server {
  // Setup auth before other routes
  setupAuth(app);

  // Ensure uploads directory exists
  fs.mkdir('uploads', { recursive: true }).catch(console.error);

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Project routes
  app.get("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const userId = (req.user as User).id;
      const projectsData = await db.query.projects.findMany({
        where: or(
          eq(projects.is_public, true),
          eq(projects.creator_id, userId)
        ),
        with: {
          creator: true,
          contributions: true,
          userProjects: true,
        },
      });

      res.json(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).send("Error fetching projects");
    }
  });

  // Get project details
  app.get("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const userId = (req.user as User).id;
      const projectId = parseInt(req.params.id);

      const project = await db.query.projects.findFirst({
        where: and(
          eq(projects.id, projectId),
          or(
            eq(projects.is_public, true),
            eq(projects.creator_id, userId)
          )
        ),
        with: {
          creator: true,
          contributions: true,
          reactions: true,
          shares: true,
          userProjects: true,
        },
      });

      if (!project) {
        return res.status(404).send("Project not found");
      }

      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).send("Error fetching project");
    }
  });

  // Create new project with image upload
  app.post("/api/projects", upload.single('image'), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const userId = (req.user as User).id;
      const invitationToken = randomBytes(32).toString('hex');

      const [newProject] = await db.insert(projects)
        .values({
          title: req.body.title,
          description: req.body.description,
          target_amount: parseInt(req.body.targetAmount),
          event_date: req.body.eventDate,
          location: req.body.location,
          creator_id: userId,
          current_amount: 0,
          is_public: req.body.isPublic === 'true',
          invitation_token: invitationToken,
          image_url: req.file ? `/uploads/${req.file.filename}` : null,
        })
        .returning();

      await db.insert(userProjects)
        .values({
          user_id: userId,
          project_id: newProject.id,
          role: 'creator',
          status: 'accepted',
        });

      res.json({ ...newProject, invitation_url: `/invite/${invitationToken}` });
    } catch (error) {
      console.error('Error creating project:', error);
      if (req.file) {
        fs.unlink(req.file.path).catch(console.error);
      }
      res.status(500).send("Error creating project");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
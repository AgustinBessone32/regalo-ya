import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import type { User } from "@db/schema";
import { setupAuth } from "./auth";
import { randomBytes } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import express from 'express';
import { eq, and, or } from "drizzle-orm";
import { projects, users, userProjects, contributions, reactions, shares } from "@db/schema";

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
      cb(new Error('Tipo de archivo inválido. Solo se permiten JPEG, PNG y WebP.'));
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
      return res.status(401).send("Se requiere autenticación");
    }

    try {
      const userId = (req.user as User).id;
      const projectsData = await db.query.projects.findMany({
        where: or(
          eq(projects.is_public, true),
          eq(projects.creator_id, userId),
          eq(userProjects.user_id, userId)
        ),
        with: {
          creator: true,
          contributions: true,
          userProjects: true,
        },
      });

      res.json(projectsData);
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
      res.status(500).send("Error al obtener proyectos");
    }
  });

  // Create new project with image upload
  app.post("/api/projects", upload.single('image'), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("No autenticado");
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
      console.error('Error al crear proyecto:', error);
      if (req.file) {
        fs.unlink(req.file.path).catch(console.error);
      }
      res.status(500).send("Error al crear proyecto");
    }
  });

  // Get project details
  app.get("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Se requiere autenticación");
    }

    try {
      const userId = (req.user as User).id;
      const projectId = parseInt(req.params.id);

      const project = await db.query.projects.findFirst({
        where: and(
          eq(projects.id, projectId),
          or(
            eq(projects.is_public, true),
            eq(projects.creator_id, userId),
            eq(userProjects.user_id, userId)
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
        return res.status(404).send("Proyecto no encontrado");
      }

      res.json(project);
    } catch (error) {
      console.error('Error al obtener proyecto:', error);
      res.status(500).send("Error al obtener proyecto");
    }
  });

  // Accept invitation
  app.post("/api/projects/accept-invitation/:token", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Se requiere autenticación");
    }

    try {
      const userId = (req.user as User).id;
      const project = await db.query.projects.findFirst({
        where: eq(projects.invitation_token, req.params.token),
      });

      if (!project) {
        return res.status(404).send("Token de invitación inválido");
      }

      const existingInvite = await db.query.userProjects.findFirst({
        where: and(
          eq(userProjects.user_id, userId),
          eq(userProjects.project_id, project.id)
        ),
      });

      if (!existingInvite) {
        await db.insert(userProjects)
          .values({
            user_id: userId,
            project_id: project.id,
            role: 'invited',
            status: 'accepted',
          });
      } else {
        await db.update(userProjects)
          .set({ status: 'accepted' })
          .where(and(
            eq(userProjects.user_id, userId),
            eq(userProjects.project_id, project.id)
          ));
      }

      res.json({ message: "Invitación aceptada exitosamente" });
    } catch (error) {
      console.error('Error al aceptar invitación:', error);
      res.status(500).send("Error al aceptar invitación");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
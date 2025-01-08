import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { projects, insertProjectSchema } from "@db/schema";
import { nanoid } from 'nanoid';

export function registerRoutes(app: Express): Server {
  // Configurar autenticación
  setupAuth(app);

  // Ruta de estado para verificar que el servidor está funcionando
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Ruta para crear un nuevo proyecto
  app.post("/api/projects", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Debes iniciar sesión para crear un proyecto");
      }

      const user = req.user as any;
      console.log("Datos recibidos:", req.body);

      const projectData = {
        ...req.body,
        creator_id: user.id,
        invitation_token: nanoid(),
      };

      console.log("Datos a validar:", projectData);

      const result = insertProjectSchema.safeParse(projectData);

      if (!result.success) {
        console.log("Errores de validación:", result.error.issues);
        return res.status(400).json({
          message: "Datos inválidos",
          errors: result.error.issues,
        });
      }

      const [newProject] = await db
        .insert(projects)
        .values({
          title: result.data.title,
          description: result.data.description,
          target_amount: result.data.target_amount,
          event_date: result.data.event_date ? new Date(result.data.event_date) : null,
          location: result.data.location || null,
          creator_id: user.id,
          invitation_token: result.data.invitation_token,
          is_public: result.data.is_public ?? false,
        })
        .returning();

      console.log("Proyecto creado:", newProject);
      res.json(newProject);
    } catch (error: any) {
      console.error("Error creating project:", error);
      res.status(500).send(error.message || "Error al crear el proyecto");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
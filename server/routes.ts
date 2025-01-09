import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { projects, insertProjectSchema } from "@db/schema";
import { nanoid } from 'nanoid';
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Configurar autenticación
  setupAuth(app);

  // Ruta de estado para verificar que el servidor está funcionando
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Ruta para obtener los proyectos del usuario
  app.get("/api/projects", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Debes iniciar sesión para ver los proyectos");
      }

      const user = req.user as any;
      const userProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.creator_id, user.id))
        .orderBy(projects.created_at);

      res.json(userProjects);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      res.status(500).send(error.message || "Error al obtener los proyectos");
    }
  });

  // Ruta para obtener un proyecto específico
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).send("ID de proyecto inválido");
      }

      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (!project) {
        return res.status(404).send("Proyecto no encontrado");
      }

      // Por ahora, devolvemos el proyecto sin datos adicionales
      res.json({
        ...project,
        creator: { username: "Usuario" }, // Esto debería obtenerse de la base de datos
        contributions: [],
        reactions: [],
        shares: {
          total: 0,
          by_platform: []
        },
        avg_amount: 0,
        median_amount: 0,
        min_amount: 0,
        max_amount: 0,
        total_contributions: 0,
        contribution_history: []
      });
    } catch (error: any) {
      console.error("Error fetching project:", error);
      res.status(500).send(error.message || "Error al obtener el proyecto");
    }
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
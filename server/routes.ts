import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { projects, insertProjectSchema } from "@db/schema";
import { nanoid } from 'nanoid';
import { eq } from "drizzle-orm";
import { createUploadthingExpressHandler } from "uploadthing/express";
import { ourFileRouter } from "./uploadthing";

export function registerRoutes(app: Express): Server {
  // Configurar autenticación
  setupAuth(app);

  // Configurar UploadThing
  const uploadthingHandler = createUploadthingExpressHandler({
    router: ourFileRouter,
    config: {
      uploadthingId: process.env.UPLOADTHING_APP_ID!,
      uploadthingSecret: process.env.UPLOADTHING_SECRET!,
      isDev: process.env.NODE_ENV === "development",
    },
  });

  app.use("/api/uploadthing", uploadthingHandler);

  // Ruta de estado para verificar que el servidor está funcionando
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Rutas de proyectos
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

  app.post("/api/projects", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Debes iniciar sesión para crear un proyecto");
      }

      const user = req.user as any;
      const projectData = {
        ...req.body,
        creator_id: user.id,
        invitation_token: nanoid(),
        event_date: req.body.event_date ? new Date(req.body.event_date) : null,
        target_amount: Number(req.body.target_amount),
      };

      console.log("Project data before validation:", projectData);

      const validationResult = insertProjectSchema.safeParse(projectData);
      if (!validationResult.success) {
        console.error("Validation errors:", validationResult.error);
        return res.status(400).json({
          message: "Datos inválidos",
          errors: validationResult.error.errors,
        });
      }

      const [newProject] = await db
        .insert(projects)
        .values(validationResult.data)
        .returning();

      console.log("Created project:", newProject);
      res.json(newProject);
    } catch (error: any) {
      console.error("Error creating project:", error);
      res.status(500).send(error.message || "Error al crear el proyecto");
    }
  });

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

      res.json({
        ...project,
        creator: { username: "Usuario" },
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

  const httpServer = createServer(app);
  return httpServer;
}
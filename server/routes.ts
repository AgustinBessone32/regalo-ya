import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express): Server {
  // Configurar autenticación
  setupAuth(app);

  // Ruta de estado para verificar que el servidor está funcionando
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
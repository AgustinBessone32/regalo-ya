import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import express from 'express';
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { db } from "@db";

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

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
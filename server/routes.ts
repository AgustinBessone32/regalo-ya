import type { Express } from "express";
import { createServer, type Server } from "http";
import { pool } from "../db";
import type { User } from "../db/schema";
import { setupAuth } from "./auth";

declare module "express-session" {
  interface SessionData {
    passport: { user: number };
  }
}

export function registerRoutes(app: Express): Server {
  // Setup auth before other routes
  setupAuth(app);

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT p.*, u.username as creator_username,
        COALESCE(json_agg(c.*) FILTER (WHERE c.id IS NOT NULL), '[]') as contributions
        FROM projects p
        LEFT JOIN users u ON p.creator_id = u.id
        LEFT JOIN contributions c ON p.id = c.project_id
        GROUP BY p.id, u.username
        ORDER BY p.created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).send("Error fetching projects");
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT p.*, u.username as creator_username,
        COALESCE(json_agg(c.*) FILTER (WHERE c.id IS NOT NULL), '[]') as contributions
        FROM projects p
        LEFT JOIN users u ON p.creator_id = u.id
        LEFT JOIN contributions c ON p.id = c.project_id
        WHERE p.id = $1
        GROUP BY p.id, u.username
      `, [req.params.id]);

      if (result.rows.length === 0) {
        return res.status(404).send("Project not found");
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).send("Error fetching project");
    }
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const user = req.user as User;
      const result = await pool.query(
        `INSERT INTO projects (
          title, description, target_amount, event_date, 
          location, creator_id, current_amount, is_public
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          req.body.title,
          req.body.description,
          req.body.targetAmount,
          req.body.eventDate,
          req.body.location,
          user.id,
          0,
          req.body.isPublic ?? true,
        ]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).send("Error creating project");
    }
  });

  // Contribution routes
  app.post("/api/projects/:id/contribute", async (req, res) => {
    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insert contribution
        const contributionResult = await client.query(
          `INSERT INTO contributions (
            amount, message, contributor_name, project_id
          ) VALUES ($1, $2, $3, $4) RETURNING *`,
          [
            req.body.amount,
            req.body.message,
            req.body.contributorName,
            req.params.id,
          ]
        );

        // Update project current amount
        await client.query(
          `UPDATE projects 
          SET current_amount = current_amount + $1 
          WHERE id = $2`,
          [req.body.amount, req.params.id]
        );

        await client.query('COMMIT');
        res.json(contributionResult.rows[0]);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating contribution:', error);
      res.status(500).send("Error creating contribution");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
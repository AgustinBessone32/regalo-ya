import type { Express } from "express";
import { createServer, type Server } from "http";
import { pool } from "../db";
import type { User } from "../db/schema";
import { setupAuth } from "./auth";
import { randomBytes } from "crypto";

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
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const result = await pool.query(`
        WITH accessible_projects AS (
          SELECT p.id
          FROM projects p
          LEFT JOIN user_projects up ON p.id = up.project_id
          WHERE p.is_public = true 
             OR p.creator_id = $1
             OR (up.user_id = $1 AND up.status = 'accepted')
        )
        SELECT p.*, u.username as creator_username,
        COALESCE(json_agg(c.*) FILTER (WHERE c.id IS NOT NULL), '[]') as contributions,
        AVG(c.amount) as avg_contribution,
        COUNT(c.id) as contribution_count,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY c.amount) as median_contribution
        FROM projects p
        INNER JOIN accessible_projects ap ON p.id = ap.id
        LEFT JOIN users u ON p.creator_id = u.id
        LEFT JOIN contributions c ON p.id = c.project_id
        GROUP BY p.id, u.username
        ORDER BY p.created_at DESC
      `, [req.user.id]);

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).send("Error fetching projects");
    }
  });

  // Create new project
  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Generate unique invitation token
        const invitationToken = randomBytes(32).toString('hex');

        // Create project
        const projectResult = await client.query(
          `INSERT INTO projects (
            title, description, target_amount, event_date, 
            location, creator_id, current_amount, is_public, invitation_token
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [
            req.body.title,
            req.body.description,
            req.body.targetAmount,
            req.body.eventDate,
            req.body.location,
            req.user.id,
            0,
            req.body.isPublic ?? false,
            invitationToken
          ]
        );

        // Create creator relationship
        await client.query(
          `INSERT INTO user_projects (user_id, project_id, role, status)
           VALUES ($1, $2, 'creator', 'accepted')`,
          [req.user.id, projectResult.rows[0].id]
        );

        await client.query('COMMIT');
        res.json({ ...projectResult.rows[0], invitation_url: `/invite/${invitationToken}` });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).send("Error creating project");
    }
  });

  // Accept invitation
  app.post("/api/projects/accept-invitation/:token", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Find project by invitation token
        const projectResult = await client.query(
          'SELECT id FROM projects WHERE invitation_token = $1',
          [req.params.token]
        );

        if (projectResult.rows.length === 0) {
          return res.status(404).send("Invalid invitation token");
        }

        const projectId = projectResult.rows[0].id;

        // Check if user is already invited
        const existingInvite = await client.query(
          'SELECT * FROM user_projects WHERE user_id = $1 AND project_id = $2',
          [req.user.id, projectId]
        );

        if (existingInvite.rows.length === 0) {
          // Create new invitation acceptance
          await client.query(
            `INSERT INTO user_projects (user_id, project_id, role, status)
             VALUES ($1, $2, 'invited', 'accepted')`,
            [req.user.id, projectId]
          );
        } else {
          // Update existing invitation to accepted
          await client.query(
            `UPDATE user_projects SET status = 'accepted'
             WHERE user_id = $1 AND project_id = $2`,
            [req.user.id, projectId]
          );
        }

        await client.query('COMMIT');
        res.json({ message: "Invitation accepted successfully" });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      res.status(500).send("Error accepting invitation");
    }
  });

  // Get project details
  app.get("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      // Check access permission
      const accessCheck = await pool.query(`
        SELECT 1
        FROM projects p
        LEFT JOIN user_projects up ON p.id = up.project_id
        WHERE p.id = $1 
        AND (
          p.is_public = true 
          OR p.creator_id = $2
          OR (up.user_id = $2 AND up.status = 'accepted')
        )
      `, [req.params.id, req.user.id]);

      if (accessCheck.rows.length === 0) {
        return res.status(403).send("You don't have access to this project");
      }

      const result = await pool.query(`
        WITH contribution_stats AS (
          SELECT 
            project_id,
            COUNT(*) as total_contributions,
            AVG(amount) as avg_amount,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) as median_amount,
            MIN(amount) as min_amount,
            MAX(amount) as max_amount,
            SUM(amount) as total_amount,
            array_agg(amount ORDER BY created_at) as contribution_history
          FROM contributions
          WHERE project_id = $1
          GROUP BY project_id
        ),
        reaction_stats AS (
          SELECT 
            emoji,
            COUNT(*) as count,
            EXISTS(
              SELECT 1 FROM reactions 
              WHERE project_id = $1 
              AND emoji = r.emoji 
              AND user_id = $2
            ) as reacted
          FROM reactions r
          WHERE project_id = $1
          GROUP BY emoji
        )
        SELECT 
          p.*,
          u.username as creator_username,
          COALESCE(json_agg(c.*) FILTER (WHERE c.id IS NOT NULL), '[]') as contributions,
          cs.total_contributions,
          cs.avg_amount,
          cs.median_amount,
          cs.min_amount,
          cs.max_amount,
          cs.total_amount,
          cs.contribution_history,
          COALESCE(json_agg(rs.*) FILTER (WHERE rs.emoji IS NOT NULL), '[]') as reactions
        FROM projects p
        LEFT JOIN users u ON p.creator_id = u.id
        LEFT JOIN contributions c ON p.id = c.project_id
        LEFT JOIN contribution_stats cs ON p.id = cs.project_id
        LEFT JOIN reaction_stats rs ON true
        WHERE p.id = $1
        GROUP BY p.id, u.username, cs.total_contributions, cs.avg_amount, 
                 cs.median_amount, cs.min_amount, cs.max_amount, cs.total_amount,
                 cs.contribution_history
      `, [req.params.id, req.user?.id || null]);

      if (result.rows.length === 0) {
        return res.status(404).send("Project not found");
      }

      const projectId = parseInt(req.params.id);
      const shareStats = await pool.query(`
        WITH platform_shares AS (
          SELECT 
            platform,
            COUNT(*) as count
          FROM shares
          WHERE project_id = $1
          GROUP BY platform
        )
        SELECT 
          json_build_object(
            'total', (SELECT COUNT(*) FROM shares WHERE project_id = $1),
            'by_platform', (
              SELECT json_agg(json_build_object(
                'platform', platform,
                'count', count
              ))
              FROM platform_shares
            )
          ) as shares
      `, [projectId]);

      const projectData = {
        ...result.rows[0],
        shares: shareStats.rows[0].shares,
      };

      res.json(projectData);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).send("Error fetching project");
    }
  });

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
            req.body.contributor_name,
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

  app.post("/api/projects/:id/react", async (req, res) => {
    try {
      const { emoji } = req.body;
      const projectId = parseInt(req.params.id);
      const userId = req.user?.id; 

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        if (userId) {
          const existingReaction = await client.query(
            `SELECT id FROM reactions 
             WHERE project_id = $1 AND user_id = $2 AND emoji = $3`,
            [projectId, userId, emoji]
          );

          if (existingReaction.rows.length > 0) {
            await client.query(
              `DELETE FROM reactions 
               WHERE project_id = $1 AND user_id = $2 AND emoji = $3`,
              [projectId, userId, emoji]
            );
          } else {
            await client.query(
              `INSERT INTO reactions (project_id, user_id, emoji) 
               VALUES ($1, $2, $3)`,
              [projectId, userId, emoji]
            );
          }
        } else {
          await client.query(
            `INSERT INTO reactions (project_id, emoji) 
             VALUES ($1, $2)`,
            [projectId, emoji]
          );
        }

        const reactionCounts = await client.query(`
          SELECT 
            r.emoji,
            COUNT(*) as count,
            EXISTS(
              SELECT 1 FROM reactions 
              WHERE project_id = $1 
              AND emoji = r.emoji 
              AND user_id = $2
            ) as reacted
          FROM reactions r
          WHERE r.project_id = $1
          GROUP BY r.emoji
        `, [projectId, userId || null]);

        await client.query('COMMIT');

        res.json({ reactions: reactionCounts.rows });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      res.status(500).send("Error handling reaction");
    }
  });

  app.post("/api/projects/:id/share", async (req, res) => {
    try {
      const { platform } = req.body;
      const projectId = parseInt(req.params.id);

      await pool.query(
        `INSERT INTO shares (project_id, platform) VALUES ($1, $2)`,
        [projectId, platform]
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking share:', error);
      res.status(500).send("Error tracking share");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
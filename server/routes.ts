import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import {
  projects,
  insertProjectSchema,
  contributions,
  users,
  payments,
  reactions,
} from "@db/schema";
import { nanoid } from "nanoid";
import { eq, and, not, sql, desc, or } from "drizzle-orm";
import { createUploadthingExpressHandler } from "uploadthing/express";
import { ourFileRouter } from "./uploadthing";
import { MercadoPagoConfig, Preference } from "mercadopago";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
  });

  app.use(
    "/api/uploadthing",
    createUploadthingExpressHandler({
      router: ourFileRouter,
      config: {
        uploadthingId: process.env.UPLOADTHING_APP_ID!,
        uploadthingSecret: process.env.UPLOADTHING_SECRET!,
        isDev: process.env.NODE_ENV === "development",
      },
    }),
  );

  // Get list of projects (strict access control)
  app.get("/api/projects", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = req.user as any;
      if (!user?.id || !user?.email) {
        return res.status(401).json({ error: "Invalid user session" });
      }

      // Single query to get all accessible projects with proper security filtering
      const accessibleProjects = await db
        .select({
          id: projects.id,
          title: projects.title,
          description: projects.description,
          image_url: projects.image_url,
          target_amount: projects.target_amount,
          current_amount: sql<number>`COALESCE(
            (SELECT SUM(amount) FROM ${payments} 
             WHERE ${payments.project_id} = ${projects.id} 
             AND ${payments.status} = 'approved'), 0
          )::int`,
          event_date: projects.event_date,
          location: projects.location,
          creator_id: projects.creator_id,
          is_public: projects.is_public,
          invitation_token: projects.invitation_token,
          payment_method: projects.payment_method,
          payment_details: projects.payment_details,
          created_at: projects.created_at,
          contribution_count: sql<number>`COALESCE(
            (SELECT COUNT(*) FROM ${payments} 
             WHERE ${payments.project_id} = ${projects.id} 
             AND ${payments.status} = 'approved'), 0
          )::int`,
          isOwner: sql<boolean>`${projects.creator_id} = ${user.id}`,
        })
        .from(projects)
        .leftJoin(contributions, eq(contributions.project_id, projects.id))
        .where(
          or(
            // User is the creator
            eq(projects.creator_id, user.id),
            // OR user has contributed to the project
            sql`EXISTS (
              SELECT 1 FROM ${contributions}
              WHERE ${contributions.project_id} = ${projects.id}
              AND ${contributions.contributor_name} = ${user.email}
            )`,
          ),
        )
        .groupBy(projects.id)
        .orderBy(desc(projects.created_at));

      return res.json(
        accessibleProjects.map((project) => ({
          ...project,
          contribution_count: Number(project.contribution_count),
          isOwner: Boolean(project.isOwner),
          progress_percentage: project.target_amount > 0 
            ? Math.round((Number(project.current_amount) / Number(project.target_amount)) * 100)
            : 0,
        })),
      );
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      return res.status(500).json({ error: "Error fetching projects" });
    }
  });

  // Create project (with security checks)
  app.post("/api/projects", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = req.user as any;
      if (!user?.id) {
        return res.status(401).json({ error: "Invalid user session" });
      }

      const projectData = {
        ...req.body,
        creator_id: user.id,
        invitation_token: nanoid(),
        event_date: req.body.event_date ? new Date(req.body.event_date) : null,
        target_amount: 0,
        image_url: req.body.image_url || null,
        current_amount: 0,
        is_public: false,
        fixed_amounts: req.body.fixed_amounts || null,
        allow_custom_amount: req.body.allow_custom_amount !== undefined ? req.body.allow_custom_amount : true,
        recipient_account: req.body.recipient_account || null,
      };

      const validationResult = insertProjectSchema.safeParse(projectData);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid project data",
          details: validationResult.error.errors,
        });
      }

      const [newProject] = await db
        .insert(projects)
        .values(validationResult.data)
        .returning();

      if (!newProject) {
        throw new Error("Failed to create project");
      }

      return res.json({
        ...newProject,
        isOwner: true,
        contribution_count: 0,
      });
    } catch (error: any) {
      console.error("Error creating project:", error);
      return res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Get single project (with access control)
  app.get("/api/projects/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = req.user as any;
      if (!user?.id || !user?.email) {
        return res.status(401).json({ error: "Invalid user session" });
      }

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      // Get project with strict access check
      const [projectWithAccess] = await db
        .select({
          project: projects,
          isOwner: sql<boolean>`${projects.creator_id} = ${user.id}`,
          isContributor: sql<boolean>`EXISTS (
            SELECT 1 FROM ${contributions}
            WHERE ${contributions.project_id} = ${projectId}
            AND ${contributions.contributor_name} = ${user.email}
          )`,
        })
        .from(projects)
        .where(eq(projects.id, projectId));

      if (!projectWithAccess) {
        return res.status(404).json({ error: "Project not found" });
      }

      const { project, isOwner, isContributor } = projectWithAccess;

      // Check access rights
      if (!isOwner && !isContributor) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Get project details including payments
      const projectContributions = await db
        .select()
        .from(contributions)
        .where(eq(contributions.project_id, projectId))
        .orderBy(desc(contributions.created_at));

      // Calculate current amount from approved payments
      const [paymentsSum] = await db
        .select({
          total: sql<number>`COALESCE(SUM(amount), 0)::int`,
        })
        .from(payments)
        .where(
          and(
            eq(payments.project_id, projectId),
            eq(payments.status, "approved")
          )
        );

      const [creator] = await db
        .select()
        .from(users)
        .where(eq(users.id, project.creator_id));

      // Get payment count
      const [paymentsCount] = await db
        .select({
          count: sql<number>`COUNT(*)::int`,
        })
        .from(payments)
        .where(
          and(
            eq(payments.project_id, projectId),
            eq(payments.status, "approved")
          )
        );

      const currentAmount = paymentsSum?.total || 0;
      const paymentCount = paymentsCount?.count || 0;
      const progressPercentage = project.target_amount > 0 
        ? Math.round((currentAmount / project.target_amount) * 100)
        : 0;

      return res.json({
        ...project,
        current_amount: currentAmount,
        contribution_count: paymentCount,
        progress_percentage: progressPercentage,
        isOwner,
        creator: { email: creator?.email || "Unknown" },
        contributions: projectContributions,
        reactions: [],
      });
    } catch (error: any) {
      console.error("Error fetching project:", error);
      return res.status(500).json({ error: "Error fetching project details" });
    }
  });

  app.post("/api/projects/:id/contribute", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = req.user as any;
      if (!user?.id || !user?.email) {
        return res.status(401).json({ error: "Invalid user session" });
      }

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const { amount, message, name } = req.body;
      if (!amount || !name) {
        return res.status(400).json({ error: "Amount and name are required" });
      }

      // Get project and verify access
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId));

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Create contribution and update project amount atomically
      const [contribution] = await db.transaction(async (tx) => {
        const [contribution] = await tx
          .insert(contributions)
          .values({
            amount,
            message,
            contributor_name: name,
            project_id: projectId,
          })
          .returning();

        await tx
          .update(projects)
          .set({
            current_amount: project.current_amount + amount,
          })
          .where(eq(projects.id, projectId));

        return [contribution];
      });

      return res.json(contribution);
    } catch (error: any) {
      console.error("Error processing contribution:", error);
      return res.status(500).json({ error: "Failed to process contribution" });
    }
  });

  // Create MercadoPago payment link
  app.post("/api/projects/:id/payment", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = req.user as any;
      if (!user?.id || !user?.email) {
        return res.status(401).json({ error: "Invalid user session" });
      }

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const { amount, description } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required" });
      }

      // Get project details
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId));

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Initialize MercadoPago
      if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
        return res.status(500).json({ error: "MercadoPago not configured" });
      }

      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      });

      const preference = new Preference(client);

      // Create payment preference
      const preferenceData = {
        items: [
          {
            id: `gift_${projectId}_${Date.now()}`,
            title: `Regalo para: ${project.title}`,
            description: description || `Contribución para ${project.title}`,
            quantity: 1,
            currency_id: "ARS",
            unit_price: Number(amount),
          },
        ],
        payer: {
          email: user.email,
        },
        back_urls: {
          success: `https://${req.get(
            "host",
          )}/projects/${projectId}?success=true`,
          failure: `https://${req.get(
            "host",
          )}/projects/${projectId}?success=false`,
          pending: `https://${req.get(
            "host",
          )}/projects/${projectId}?pending=true`,
        },
        auto_return: "approved",
        external_reference: `project_${projectId}_user_${user.id}`,
        notification_url: `https://${req.get("host")}/api/webhooks/mercadopago`,
      };

      const result = await preference.create({ body: preferenceData });

      return res.json({
        paymentUrl: result.init_point,
        preferenceId: result.id,
      });
    } catch (error: any) {
      console.error("Error creating MercadoPago payment:", error);
      return res.status(500).json({ error: "Failed to create payment link" });
    }
  });

  // Get payments for a project
  app.get("/api/projects/:id/payments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = req.user as any;
      if (!user?.id) {
        return res.status(401).json({ error: "Invalid user session" });
      }

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      // Verificar que el usuario tenga acceso al proyecto
      const [project] = await db
        .select({
          creator_id: projects.creator_id,
        })
        .from(projects)
        .where(eq(projects.id, projectId));

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Solo el creador del proyecto puede ver todos los pagos
      if (project.creator_id !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Obtener todos los pagos del proyecto
      const projectPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.project_id, projectId))
        .orderBy(desc(payments.created_at));

      return res.json(projectPayments);
    } catch (error: any) {
      console.error("Error fetching project payments:", error);
      return res.status(500).json({ error: "Error fetching payments" });
    }
  });

  // React to a project
  app.post("/api/projects/:id/react", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = req.user as any;
      if (!user?.id) {
        return res.status(401).json({ error: "Invalid user session" });
      }

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const { emoji } = req.body;
      if (!emoji) {
        return res.status(400).json({ error: "Emoji is required" });
      }

      // Check if project exists
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId));

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Check if user already reacted with this emoji
      const [existingReaction] = await db
        .select()
        .from(reactions)
        .where(
          and(
            eq(reactions.project_id, projectId),
            eq(reactions.user_id, user.id),
            eq(reactions.emoji, emoji)
          )
        );

      if (existingReaction) {
        // Remove the reaction (toggle off)
        await db
          .delete(reactions)
          .where(
            and(
              eq(reactions.project_id, projectId),
              eq(reactions.user_id, user.id),
              eq(reactions.emoji, emoji)
            )
          );
      } else {
        // Add the reaction
        await db
          .insert(reactions)
          .values({
            project_id: projectId,
            user_id: user.id,
            emoji,
          });
      }

      // Get updated reaction counts
      const reactionCounts = await db
        .select({
          emoji: reactions.emoji,
          count: sql<number>`count(*)::int`,
        })
        .from(reactions)
        .where(eq(reactions.project_id, projectId))
        .groupBy(reactions.emoji);

      // Get user's reactions for this project
      const userReactions = await db
        .select({ emoji: reactions.emoji })
        .from(reactions)
        .where(
          and(
            eq(reactions.project_id, projectId),
            eq(reactions.user_id, user.id)
          )
        );

      const userReactionEmojis = userReactions.map(r => r.emoji);

      // Format response with all possible reactions
      const allReactions = [
        { emoji: "🎁", label: "Gift" },
        { emoji: "🎂", label: "Cake" },
        { emoji: "🎈", label: "Balloon" },
        { emoji: "🎊", label: "Confetti" },
        { emoji: "❤️", label: "Love" },
        { emoji: "🌟", label: "Star" }
      ].map(r => {
        const countData = reactionCounts.find(rc => rc.emoji === r.emoji);
        return {
          emoji: r.emoji,
          count: countData?.count || 0,
          reacted: userReactionEmojis.includes(r.emoji)
        };
      });

      return res.json({ reactions: allReactions });
    } catch (error: any) {
      console.error("Error processing reaction:", error);
      return res.status(500).json({ error: "Failed to process reaction" });
    }
  });

  // MercadoPago Webhook endpoint
  app.post("/api/webhooks/mercadopago", async (req, res) => {
    try {
      const { type, data } = req.body;

      // Solo procesar notificaciones de pago
      if (type === "payment") {
        const paymentId = data.id;

        if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
          console.error("MercadoPago access token not configured");
          return res.status(500).json({ error: "MercadoPago not configured" });
        }

        // Obtener información del pago desde MercadoPago
        const paymentResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
            },
          },
        );

        if (!paymentResponse.ok) {
          console.error(
            "Error fetching payment from MercadoPago:",
            paymentResponse.statusText,
          );
          return res
            .status(400)
            .json({ error: "Error fetching payment details" });
        }

        const paymentData = await paymentResponse.json();

        // Extraer información de la external_reference (project_id_user_id)
        const externalRef = paymentData.external_reference;
        if (!externalRef) {
          console.error("No external reference found in payment");
          return res.status(400).json({ error: "No external reference" });
        }

        const match = externalRef.match(/project_(\d+)_user_(\d+)/);
        if (!match) {
          console.error("Invalid external reference format:", externalRef);
          return res
            .status(400)
            .json({ error: "Invalid external reference format" });
        }

        const projectId = parseInt(match[1]);
        const userId = parseInt(match[2]);

        // Verificar si el pago ya existe
        const [existingPayment] = await db
          .select()
          .from(payments)
          .where(eq(payments.mercadopago_payment_id, paymentId.toString()))
          .limit(1);

        if (existingPayment) {
          // Actualizar el pago existente
          await db
            .update(payments)
            .set({
              status: paymentData.status,
              status_detail: paymentData.status_detail,
              payment_method: paymentData.payment_method_id,
              payment_type: paymentData.payment_type_id,
              updated_at: new Date(),
            })
            .where(eq(payments.mercadopago_payment_id, paymentId.toString()));
        } else {
          // Crear nuevo registro de pago
          await db.insert(payments).values({
            project_id: projectId,
            user_id: userId,
            mercadopago_payment_id: paymentId.toString(),
            preference_id: paymentData.order.id || "",
            amount: Math.round(paymentData.transaction_amount),
            currency: paymentData.currency_id,
            status: paymentData.status,
            status_detail: paymentData.status_detail,
            payment_method: paymentData.payment_method_id,
            payment_type: paymentData.payment_type_id,
            description: paymentData.description,
            external_reference: paymentData.external_reference,
            payer_email: paymentData.payer?.email,
          });
        }

        // Si el pago fue aprobado, actualizar el monto del proyecto
        if (paymentData.status === "approved") {
          const [project] = await db
            .select()
            .from(projects)
            .where(eq(projects.id, projectId));

          if (project) {
            await db
              .update(projects)
              .set({
                current_amount:
                  (project.current_amount || 0) +
                  Math.round(paymentData.transaction_amount),
              })
              .where(eq(projects.id, projectId));

            console.log(
              `Payment approved for project ${projectId}: $${paymentData.transaction_amount}`,
            );
          }
        }

        return res.status(200).json({ success: true });
      }

      // Para otros tipos de notificación, simplemente responder OK
      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Error processing MercadoPago webhook:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

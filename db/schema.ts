import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const selectUserSchema = createSelectSchema(users);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image_url: text("image_url"),
  target_amount: integer("target_amount").notNull(),
  current_amount: integer("current_amount").default(0),
  event_date: timestamp("event_date"),
  location: text("location"),
  creator_id: integer("creator_id").references(() => users.id).notNull(),
  is_public: boolean("is_public").default(false),
  invitation_token: text("invitation_token").notNull(),
  payment_method: text("payment_method", { enum: ["cbu", "efectivo"] }).notNull(),
  payment_details: text("payment_details").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertProjectSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  image_url: z.string().optional().nullable(),
  target_amount: z.number().min(1, "El monto objetivo debe ser mayor a 0"),
  location: z.string().optional().nullable(),
  event_date: z.string().optional().nullable(),
  is_public: z.boolean().default(false),
  creator_id: z.number(),
  invitation_token: z.string(),
  payment_method: z.enum(["cbu", "efectivo"], {
    required_error: "Debes seleccionar un método de pago",
  }),
  payment_details: z.string().min(1, "Debes proporcionar los detalles del pago"),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  message: text("message"),
  contributor_name: text("contributor_name").notNull(),
  project_id: integer("project_id").references(() => projects.id).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export type Contribution = typeof contributions.$inferSelect;

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").references(() => projects.id).notNull(),
  user_id: integer("user_id").references(() => users.id),
  emoji: text("emoji").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export type Reaction = typeof reactions.$inferSelect;

export const shares = pgTable("shares", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").references(() => projects.id).notNull(),
  platform: text("platform").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export type Share = typeof shares.$inferSelect;
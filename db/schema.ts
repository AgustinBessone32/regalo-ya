import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Por favor, introduce un email válido"),
  password: z.string().min(1, "La contraseña es requerida"),
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
  creator_id: integer("creator_id")
    .references(() => users.id)
    .notNull(),
  is_public: boolean("is_public").default(false),
  invitation_token: text("invitation_token").notNull(),
  payment_method: text("payment_method", {
    enum: ["mercadopago"],
  })
    .notNull()
    .default("mercadopago"),
  payment_details: text("payment_details"),
  fixed_amounts: text("fixed_amounts"),
  allow_custom_amount: boolean("allow_custom_amount").default(true),
  recipient_account: text("recipient_account"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertProjectSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  image_url: z.string().optional().nullable(),
  target_amount: z.number(),
  location: z.string().optional().nullable(),
  event_date: z.date().optional().nullable(),
  is_public: z.boolean().default(false),
  creator_id: z.number(),
  invitation_token: z.string(),
  payment_method: z.enum(["mercadopago"]).default("mercadopago"),
  payment_details: z.string().optional().nullable(),
  fixed_amounts: z.string().optional().nullable(),
  allow_custom_amount: z.boolean().default(true),
  recipient_account: z.string().min(1, "Debes proporcionar tu alias bancario"),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  message: text("message"),
  contributor_name: text("contributor_name").notNull(),
  project_id: integer("project_id")
    .references(() => projects.id)
    .notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export type Contribution = typeof contributions.$inferSelect;

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id")
    .references(() => projects.id)
    .notNull(),
  user_id: integer("user_id").references(() => users.id),
  emoji: text("emoji").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export type Reaction = typeof reactions.$inferSelect;

export const shares = pgTable("shares", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id")
    .references(() => projects.id)
    .notNull(),
  platform: text("platform").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export type Share = typeof shares.$inferSelect;

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id")
    .references(() => projects.id)
    .notNull(),
  user_id: integer("user_id")
    .references(() => users.id)
    .notNull(),
  mercadopago_payment_id: text("mercadopago_payment_id").unique().notNull(),
  preference_id: text("preference_id").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").default("ARS").notNull(),
  status: text("status", {
    enum: [
      "pending",
      "approved",
      "authorized",
      "in_process",
      "in_mediation",
      "rejected",
      "cancelled",
      "refunded",
      "charged_back",
    ],
  }).notNull(),
  status_detail: text("status_detail"),
  payment_method: text("payment_method"),
  payment_type: text("payment_type"),
  description: text("description"),
  external_reference: text("external_reference"),
  payer_email: text("payer_email"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

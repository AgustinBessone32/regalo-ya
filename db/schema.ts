import { pgTable, text, serial, integer, boolean, timestamp, relations } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  target_amount: integer("target_amount").notNull(),
  current_amount: integer("current_amount").default(0),
  event_date: timestamp("event_date"),
  location: text("location"),
  image_url: text("image_url"),
  creator_id: integer("creator_id").references(() => users.id).notNull(),
  is_public: boolean("is_public").default(false),
  invitation_token: text("invitation_token").unique().notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const userProjects = pgTable("user_projects", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  project_id: integer("project_id").references(() => projects.id).notNull(),
  role: text("role", { enum: ["creator", "invited"] }).notNull(),
  status: text("status", { enum: ["pending", "accepted"] }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  message: text("message"),
  contributor_name: text("contributor_name").notNull(),
  project_id: integer("project_id").references(() => projects.id).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").references(() => projects.id).notNull(),
  user_id: integer("user_id").references(() => users.id),
  emoji: text("emoji").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const shares = pgTable("shares", {
  id: serial("id").primaryKey(),
  project_id: integer("project_id").references(() => projects.id).notNull(),
  platform: text("platform").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Definir las relaciones
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects, { relationName: "creator" }),
  userProjects: many(userProjects),
  reactions: many(reactions),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, { fields: [projects.creator_id], references: [users.id] }),
  userProjects: many(userProjects),
  contributions: many(contributions),
  reactions: many(reactions),
  shares: many(shares),
}));

export const userProjectsRelations = relations(userProjects, ({ one }) => ({
  user: one(users, { fields: [userProjects.user_id], references: [users.id] }),
  project: one(projects, { fields: [userProjects.project_id], references: [projects.id] }),
}));

export const contributionsRelations = relations(contributions, ({ one }) => ({
  project: one(projects, { fields: [contributions.project_id], references: [projects.id] }),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  project: one(projects, { fields: [reactions.project_id], references: [projects.id] }),
  user: one(users, { fields: [reactions.user_id], references: [users.id], relationName: "userReactions" }),
}));

export const sharesRelations = relations(shares, ({ one }) => ({
  project: one(projects, { fields: [shares.project_id], references: [projects.id] }),
}));

// Schemas para validación
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
export const selectUserSchema = createSelectSchema(users);

export const insertProjectSchema = createInsertSchema(projects, {
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  target_amount: z.number().min(1, "El monto objetivo debe ser mayor a 0"),
  location: z.string().optional(),
  event_date: z.string().optional(),
  is_public: z.boolean().default(false),
});

export const insertContributionSchema = createInsertSchema(contributions, {
  amount: z.number().min(1, "El monto debe ser mayor a 0"),
  message: z.string().optional(),
  contributor_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

export const insertReactionSchema = createInsertSchema(reactions, {
  emoji: z.string(),
});

export const insertShareSchema = createInsertSchema(shares, {
  platform: z.string(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type UserProject = typeof userProjects.$inferSelect;
export type Contribution = typeof contributions.$inferSelect;
export type Reaction = typeof reactions.$inferSelect;
export type Share = typeof shares.$inferSelect;
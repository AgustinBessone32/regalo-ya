// Type definitions for our database entities
import { z } from "zod";

export interface User {
  id: number;
  username: string;
  password: string;
  created_at: Date;
}

export interface Project {
  id: number;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  event_date: Date | null;
  location: string | null;
  image_url: string | null;
  creator_id: number;
  is_public: boolean;
  created_at: Date;
}

export interface Contribution {
  id: number;
  amount: number;
  message: string | null;
  contributor_name: string;
  project_id: number;
  created_at: Date;
}

// Schema validation using zod
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  target_amount: z.number().min(1, "Target amount must be greater than 0"),
  location: z.string().optional(),
  event_date: z.string().optional(),
  is_public: z.boolean().default(true),
});

export const insertContributionSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  message: z.string().optional(),
  contributor_name: z.string().min(2, "Name must be at least 2 characters"),
});

// Type for authenticated user (excludes password)
export type AuthenticatedUser = Omit<User, "password">;
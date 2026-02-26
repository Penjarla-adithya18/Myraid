import { z } from "zod";

export const registerSchema = z.object({
  email: z.email().max(255),
  password: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/, "Password must include at least one uppercase character")
    .regex(/[a-z]/, "Password must include at least one lowercase character")
    .regex(/[0-9]/, "Password must include at least one number"),
});

export const loginSchema = z.object({
  email: z.email().max(255),
  password: z.string().min(8).max(72),
});

export const taskCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
});

export const taskUpdateSchema = taskCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided",
);

export const taskListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  search: z.string().trim().max(120).optional(),
});

import { z } from "zod"

export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  bio: z.string().max(160, "Bio must be at most 160 characters").optional(),
}) 
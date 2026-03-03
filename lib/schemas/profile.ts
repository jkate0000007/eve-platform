import { z } from "zod"

export const profileUpdateSchema = z.object({
  username: z
    .string()
    .optional()
    .refine(
      (val) => !val || (val.length >= 3 && val.length <= 32 && /^[a-zA-Z0-9_]+$/.test(val)),
      { message: "Username must be 3-32 characters, letters/numbers/underscores only" }
    ),
  bio: z.string().max(160, "Bio must be at most 160 characters").optional(),
}) 
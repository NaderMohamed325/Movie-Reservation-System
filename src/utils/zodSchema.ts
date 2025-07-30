import { z } from "zod";

/*
user Schema to validate
name String
email normalized
*/
export const userSchema = z.object({
  name: z
    .string()
    .min(4, "Name must be at least 4 characters long")
    .max(50, "Name must be at most 50 characters long"),
  email: z
    .email("Invalid email address")
    .max(100, "Email must be at most 100 characters long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be at most 100 characters long"),
});

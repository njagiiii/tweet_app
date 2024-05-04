import * as z from "zod";

// creating the form schema

export const UserValidation = z.object({
  profile_photo: z.string().url().nullable(),
  name: z.string().min(3).max(30),
  username: z.string().min(3).max(30),
  bio: z.string().min(3).max(100),
});

import { z } from "zod";

export const optionsSchema = z.object({
  apiKey: z.string().min(1, {
    message: "API key is required",
  }),
});

export type Options = z.infer<typeof optionsSchema>;

import { z } from "zod";

export const aiProviderSchema = z.enum(["chrome", "openai"]);
export type AIProvider = z.infer<typeof aiProviderSchema>;

export const optionsSchema = z.object({
  apiKey: z.string().optional().default(""),
  aiProvider: aiProviderSchema.optional().default("chrome"),
});

export type Options = z.infer<typeof optionsSchema>;

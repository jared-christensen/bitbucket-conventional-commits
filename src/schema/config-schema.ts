import { z } from "zod";

export const configSchema = z.object({
  scopes: z.array(z.string()),
});

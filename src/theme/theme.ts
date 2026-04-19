import z from "zod";

//------------------------------------------------------------------------------
// Theme
//------------------------------------------------------------------------------

export const themeSchema = z.enum(["light", "dark"]);

export type Theme = z.infer<typeof themeSchema>;

import z from "zod";
import { createLocalStore } from "~/store/local-store";

//------------------------------------------------------------------------------
// Theme
//------------------------------------------------------------------------------

export const themeSchema = z.enum(["light", "dark"]);

export type Theme = z.infer<typeof themeSchema>;

//------------------------------------------------------------------------------
// Theme Store
//------------------------------------------------------------------------------

const themeStore = createLocalStore("theme", "light", themeSchema.parse);

//------------------------------------------------------------------------------
// Use Theme
//------------------------------------------------------------------------------

export const useTheme = themeStore.use;

import z from "zod";
import { localeSchema } from "~/i18n/locale";
import { supabase } from "~/lib/supabase";
import { type AsyncStateSuccess, success } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Home Message
//------------------------------------------------------------------------------

export const homeNoUpcomingEventsMessageKey = "no_upcoming_events";

const localizedTextSchema = z.object(
  Object.fromEntries(
    localeSchema.options.map((locale) => [locale, z.string()]),
  ),
) as z.ZodObject<Record<(typeof localeSchema.options)[number], z.ZodString>>;

export const homeMessageSchema = z.object({
  body: localizedTextSchema,
  enabled: z.boolean(),
  key: z.string(),
  title: localizedTextSchema,
});

export type HomeMessage = z.infer<typeof homeMessageSchema>;

//------------------------------------------------------------------------------
// Home Message Row
//------------------------------------------------------------------------------

export const homeMessageRowSchema = z.object({
  body: localizedTextSchema,
  enabled: z.boolean(),
  key: z.string(),
  title: localizedTextSchema,
});

//------------------------------------------------------------------------------
// Fetch Home No Upcoming Events Message
//------------------------------------------------------------------------------

export async function fetchHomeNoUpcomingEventsMessage(): Promise<
  AsyncStateSuccess<HomeMessage | null>
> {
  const { data, error } = await supabase
    .from("home_messages")
    .select("key, enabled, title, body")
    .eq("key", homeNoUpcomingEventsMessageKey)
    .eq("enabled", true)
    .maybeSingle();

  if (error) return success(defaultHomeNoUpcomingEventsMessage());
  if (!data) return success(null);

  const homeMessage = homeMessageRowSchema.safeParse(data);
  if (homeMessage.error) return success(defaultHomeNoUpcomingEventsMessage());

  return success(homeMessage.data);
}

//------------------------------------------------------------------------------
// Fetch Admin Home No Upcoming Events Message
//------------------------------------------------------------------------------

export async function fetchAdminHomeNoUpcomingEventsMessage(): Promise<
  AsyncStateSuccess<HomeMessage>
> {
  const { data, error } = await supabase
    .from("home_messages")
    .select("key, enabled, title, body")
    .eq("key", homeNoUpcomingEventsMessageKey)
    .maybeSingle();

  if (error) return success(defaultHomeNoUpcomingEventsMessage());
  if (!data) return success(defaultHomeNoUpcomingEventsMessage());

  const homeMessage = homeMessageRowSchema.safeParse(data);
  if (homeMessage.error) return success(defaultHomeNoUpcomingEventsMessage());

  return success(homeMessage.data);
}

//------------------------------------------------------------------------------
// Update Home No Upcoming Events Message
//------------------------------------------------------------------------------

export async function updateHomeNoUpcomingEventsMessage(
  homeMessage: HomeMessage,
) {
  const { error } = await supabase.from("home_messages").upsert({
    body: homeMessage.body,
    enabled: homeMessage.enabled,
    key: homeNoUpcomingEventsMessageKey,
    title: homeMessage.title,
  });

  return error ? "page.admin_home_message.error.generic" : "";
}

//------------------------------------------------------------------------------
// Default Home No Upcoming Events Message
//------------------------------------------------------------------------------

export function defaultHomeNoUpcomingEventsMessage(): HomeMessage {
  return {
    body: {
      "en-GB": "",
      "it-CH": "",
    },
    enabled: false,
    key: homeNoUpcomingEventsMessageKey,
    title: {
      "en-GB": "No upcoming events.",
      "it-CH": "Nessun evento in programma.",
    },
  };
}

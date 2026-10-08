import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const siteUrl = Deno.env.get("SITE_URL") ?? "";

const adminClient = createClient(supabaseUrl, serviceRoleKey);

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  console.error(
    "Missing Supabase environment variables for manage-event-managers",
  );
}

const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

type Action = "assign" | "invite" | "list" | "remove" | "unassign";

type Payload = {
  action?: Action;
  displayName?: string;
  email?: string;
  eventId?: string;
  userId?: string;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST")
    return json({ error: "method_not_allowed" }, 405);

  const accessToken = request.headers
    .get("Authorization")
    ?.replace("Bearer ", "");
  if (!accessToken) return json({ error: "unauthorized" }, 401);

  const callerClient = createClient(supabaseUrl, anonKey);
  const { data: callerData, error: callerError } =
    await callerClient.auth.getUser(accessToken);
  if (callerError || !callerData.user)
    return json({ error: "unauthorized" }, 401);

  const { data: adminUser, error: adminError } = await adminClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", callerData.user.id)
    .maybeSingle();
  if (adminError || !adminUser) return json({ error: "forbidden" }, 403);

  const payload = (await request.json()) as Payload;

  switch (payload.action) {
    case "assign":
      return await assignEventManager(payload, callerData.user.id);
    case "invite":
      return await inviteEventManager(payload, callerData.user.id);
    case "list":
      return await listEventManagers();
    case "remove":
      return await removeEventManager(payload, callerData.user.id);
    case "unassign":
      return await unassignEventManager(payload);
    default:
      return json({ error: "invalid_action" }, 400);
  }
});

async function assignEventManager(payload: Payload, assignedBy: string) {
  if (!payload.eventId || !payload.userId)
    return json({ error: "missing_parameters" }, 400);

  const { error } = await adminClient.from("event_manager_events").upsert(
    {
      assigned_by: assignedBy,
      event_id: payload.eventId,
      user_id: payload.userId,
    },
    { onConflict: "user_id,event_id" },
  );

  return error ? json({ error: "assignment_failed" }, 400) : json({});
}

async function inviteEventManager(payload: Payload, createdBy: string) {
  const email = payload.email?.trim().toLowerCase() ?? "";
  const displayName = payload.displayName?.trim() ?? "";
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return json({ error: "invalid_email" }, 400);
  if (!displayName) return json({ error: "invalid_display_name" }, 400);

  const { data: users, error: usersError } =
    await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
  if (usersError) return json({ error: "invite_failed" }, 500);

  let user = users.users.find(
    (candidate) => candidate.email?.toLowerCase() === email,
  );
  if (!user) {
    const result = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: siteUrl ? `${siteUrl.replace(/\/$/, "")}/admin` : undefined,
    });
    if (result.error || !result.data.user)
      return json({ error: "invite_failed" }, 400);
    user = result.data.user;
  }

  const { error } = await adminClient
    .from("event_managers")
    .upsert(
      { assigned_by: createdBy, display_name: displayName, user_id: user.id },
      { onConflict: "user_id" },
    );
  if (error) return json({ error: "invite_failed" }, 400);

  return json({ email: user.email, userId: user.id });
}

async function listEventManagers() {
  const [
    { data: managers, error: managersError },
    { data: assignments, error: assignmentsError },
    usersResult,
  ] = await Promise.all([
    adminClient
      .from("event_managers")
      .select("user_id, display_name")
      .order("created_at", { ascending: true }),
    adminClient.from("event_manager_events").select("user_id, event_id"),
    adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  if (managersError || assignmentsError || usersResult.error) {
    console.error("Unable to list event managers", {
      assignmentsError,
      managersError,
      usersError: usersResult.error,
    });
    return json({ error: "list_failed" }, 500);
  }

  const usersById = new Map(
    usersResult.data.users.map((user) => [user.id, user.email ?? ""]),
  );

  return json({
    managers: managers.map((manager) => ({
      displayName: manager.display_name,
      email: usersById.get(manager.user_id) ?? "",
      eventIds: assignments
        .filter((assignment) => assignment.user_id === manager.user_id)
        .map((assignment) => assignment.event_id),
      userId: manager.user_id,
    })),
  });
}

async function removeEventManager(payload: Payload, callerId: string) {
  if (!payload.userId) return json({ error: "missing_parameters" }, 400);
  if (payload.userId === callerId)
    return json({ error: "cannot_remove_self" }, 400);

  const { data: adminUser } = await adminClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", payload.userId)
    .maybeSingle();
  if (adminUser) return json({ error: "cannot_remove_admin" }, 400);

  const { error } = await adminClient
    .from("event_managers")
    .delete()
    .eq("user_id", payload.userId);
  return error ? json({ error: "remove_failed" }, 400) : json({});
}

async function unassignEventManager(payload: Payload) {
  if (!payload.eventId || !payload.userId)
    return json({ error: "missing_parameters" }, 400);

  const { error } = await adminClient
    .from("event_manager_events")
    .delete()
    .eq("event_id", payload.eventId)
    .eq("user_id", payload.userId);
  return error ? json({ error: "assignment_failed" }, 400) : json({});
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

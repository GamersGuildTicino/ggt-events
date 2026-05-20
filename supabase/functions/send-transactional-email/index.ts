//------------------------------------------------------------------------------
// Locale
//------------------------------------------------------------------------------

type Locale = "en-GB" | "it-CH";

//------------------------------------------------------------------------------
// Email Type
//------------------------------------------------------------------------------

type EmailType =
  | "registration-confirmed"
  | "registration-removed"
  | "registration-removed-admin-notification";

//------------------------------------------------------------------------------
// Payload
//------------------------------------------------------------------------------

type Payload = {
  event: {
    locationAddress: string;
    locationName: string;
    title: string;
  };
  locale: Locale;
  registration: {
    cancellationUrl?: string;
    email: string;
    playerName: string;
  };
  table: {
    gameMasterName: string;
    title: string;
  };
  timeSlot: {
    endsAt: string;
    startsAt: string;
  };
  type: EmailType;
};

//------------------------------------------------------------------------------
// Env Variables
//------------------------------------------------------------------------------

const MAILJET_API_KEY = Deno.env.get("MAILJET_API_KEY") ?? "";
const MAILJET_FROM_EMAIL = Deno.env.get("MAILJET_FROM_EMAIL") ?? "";
const MAILJET_FROM_NAME = Deno.env.get("MAILJET_FROM_NAME") ?? "";
const MAILJET_REPLY_TO_EMAIL =
  Deno.env.get("MAILJET_REPLY_TO_EMAIL") ?? MAILJET_FROM_EMAIL;
const MAILJET_REPLY_TO_NAME =
  Deno.env.get("MAILJET_REPLY_TO_NAME") ?? MAILJET_FROM_NAME;
const MAILJET_SECRET_KEY = Deno.env.get("MAILJET_SECRET_KEY") ?? "";
const MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_EN_GB = Number(
  Deno.env.get("MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_EN_GB"),
);
const MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_IT_CH = Number(
  Deno.env.get("MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_IT_CH"),
);
const MAILJET_TEMPLATE_ID_REGISTRATION_REMOVED_EN_GB = Number(
  Deno.env.get("MAILJET_TEMPLATE_ID_REGISTRATION_REMOVED_EN_GB"),
);
const MAILJET_TEMPLATE_ID_REGISTRATION_REMOVED_IT_CH = Number(
  Deno.env.get("MAILJET_TEMPLATE_ID_REGISTRATION_REMOVED_IT_CH"),
);
const TRANSACTIONAL_EMAIL_SECRET =
  Deno.env.get("TRANSACTIONAL_EMAIL_SECRET") ?? "";

//------------------------------------------------------------------------------
// Deno Serve
//------------------------------------------------------------------------------

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  if (
    TRANSACTIONAL_EMAIL_SECRET &&
    request.headers.get("x-transactional-email-secret") !==
      TRANSACTIONAL_EMAIL_SECRET
  ) {
    return json({ error: "forbidden" }, 401);
  }

  if (
    !MAILJET_API_KEY ||
    !MAILJET_FROM_EMAIL ||
    !MAILJET_FROM_NAME ||
    !MAILJET_SECRET_KEY
  ) {
    return json({ error: "missing_email_configuration" }, 500);
  }

  const payload = (await request.json()) as Payload;
  const message = mailjetMessage(payload);

  if (!message) {
    return json({ error: "missing_template_configuration" }, 500);
  }

  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    body: JSON.stringify({ Messages: [message] }),
    headers: {
      "Authorization": basicAuthorization(MAILJET_API_KEY, MAILJET_SECRET_KEY),
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) return json(data, response.status);
  return json(data, 200);
});

//------------------------------------------------------------------------------
// Mailjet Message
//------------------------------------------------------------------------------

function mailjetMessage(payload: Payload) {
  switch (payload.type) {
    case "registration-confirmed":
    case "registration-removed":
      return templateMessage(payload);
    case "registration-removed-admin-notification":
      return registrationRemovedAdminNotificationMessage(payload);
  }
}

//------------------------------------------------------------------------------
// Template Message
//------------------------------------------------------------------------------

function templateMessage(payload: Payload) {
  const templateId = mailjetTemplateId(payload.type, payload.locale);

  if (!templateId) {
    return null;
  }

  return {
    From: {
      Email: MAILJET_FROM_EMAIL,
      Name: MAILJET_FROM_NAME,
    },
    ReplyTo: {
      Email: MAILJET_REPLY_TO_EMAIL,
      Name: MAILJET_REPLY_TO_NAME,
    },
    TemplateID: templateId,
    TemplateLanguage: true,
    To: [
      {
        Email: payload.registration.email,
        Name: payload.registration.playerName,
      },
    ],
    Variables: templateVariables(payload),
  };
}

//------------------------------------------------------------------------------
// Registration Removed Admin Notification Message
//------------------------------------------------------------------------------

function registrationRemovedAdminNotificationMessage(payload: Payload) {
  const timeSlot = formatTimeSlot(payload.locale, payload.timeSlot);
  const location = formatLocation(payload.event);

  return {
    From: { Email: MAILJET_FROM_EMAIL, Name: MAILJET_FROM_NAME },
    ReplyTo: { Email: MAILJET_REPLY_TO_EMAIL, Name: MAILJET_REPLY_TO_NAME },
    Subject: `Registrazione cancellata: ${payload.event.title}`,
    TextPart: [
      `${payload.registration.playerName} si è disiscrittə.`,
      "",
      `Evento: ${payload.event.title}`,
      `Tavolo: ${payload.table.title}`,
      `Game Master: ${payload.table.gameMasterName}`,
      `Fascia oraria: ${timeSlot}`,
      `Luogo: ${location ?? "n/a"}`,
      `Email: ${payload.registration.email}`,
    ].join("\n"),
    To: [{ Email: MAILJET_REPLY_TO_EMAIL, Name: "Gamers Guild Ticino" }],
  };
}

//------------------------------------------------------------------------------
// Mailjet Template Id
//------------------------------------------------------------------------------

function mailjetTemplateId(type: EmailType, locale: Locale) {
  switch (type) {
    case "registration-confirmed":
      return locale === "en-GB" ?
          MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_EN_GB
        : MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_IT_CH;
    case "registration-removed":
      return locale === "en-GB" ?
          MAILJET_TEMPLATE_ID_REGISTRATION_REMOVED_EN_GB
        : MAILJET_TEMPLATE_ID_REGISTRATION_REMOVED_IT_CH;
  }
}

//------------------------------------------------------------------------------
// Format Location
//------------------------------------------------------------------------------

function formatLocation(event: Payload["event"]) {
  return [event.locationName, event.locationAddress].filter(Boolean).join(", ");
}

//------------------------------------------------------------------------------
// Format Time Slot
//------------------------------------------------------------------------------

function formatTimeSlot(locale: Locale, timeSlot: Payload["timeSlot"]) {
  const startsAt = new Date(timeSlot.startsAt);
  const endsAt = new Date(timeSlot.endsAt);

  const start = new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(startsAt);
  const end = new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
  }).format(endsAt);

  return `${start} - ${end}`;
}

//------------------------------------------------------------------------------
// Basic Authorization
//------------------------------------------------------------------------------

function basicAuthorization(username: string, password: string) {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

//------------------------------------------------------------------------------
// Template Variables
//------------------------------------------------------------------------------

function templateVariables(payload: Payload) {
  return {
    cancellationUrl: payload.registration.cancellationUrl ?? "",
    eventTitle: payload.event.title,
    gameMasterName: payload.table.gameMasterName,
    location: formatLocation(payload.event),
    playerName: payload.registration.playerName,
    tableTitle: payload.table.title,
    timeSlot: formatTimeSlot(payload.locale, payload.timeSlot),
  };
}

//------------------------------------------------------------------------------
// JSON
//------------------------------------------------------------------------------

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

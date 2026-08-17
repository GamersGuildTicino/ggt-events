//------------------------------------------------------------------------------
// Locale
//------------------------------------------------------------------------------

type Locale = "en-GB" | "it-CH";

//------------------------------------------------------------------------------
// Event Time Zone
//------------------------------------------------------------------------------

// FIXME: This should be taken as parameter by the Edge Function.
const EVENT_TIME_ZONE = "Europe/Zurich";

//------------------------------------------------------------------------------
// Email Type
//------------------------------------------------------------------------------

type EmailType =
  | "membership-confirmed"
  | "registration-confirmed"
  | "registration-confirmed-correction"
  | "registration-removed"
  | "registration-removed-admin-notification";

//------------------------------------------------------------------------------
// Payload
//------------------------------------------------------------------------------

type Payload = {
  event?: {
    locationAddress: string;
    locationName: string;
    title: string;
  };
  locale: Locale;
  membership?: {
    city: string;
    email: string;
    firstName: string;
    fullName: string;
    lastName: string;
    paymentMethod: "twint" | "bank_transfer" | "cash";
    postalCode: string;
    street: string;
  };
  registration?: {
    cancellationUrl?: string;
    email: string;
    playerName: string;
  };
  table?: {
    gameMasterName: string;
    title: string;
  };
  timeSlot?: {
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
const MAILJET_TEMPLATE_ID_MEMBERSHIP_CONFIRMED_EN_GB = Number(
  Deno.env.get("MAILJET_TEMPLATE_ID_MEMBERSHIP_CONFIRMED_EN_GB"),
);
const MAILJET_TEMPLATE_ID_MEMBERSHIP_CONFIRMED_IT_CH = Number(
  Deno.env.get("MAILJET_TEMPLATE_ID_MEMBERSHIP_CONFIRMED_IT_CH"),
);
const MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_EN_GB = Number(
  Deno.env.get("MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_EN_GB"),
);
const MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_IT_CH = Number(
  Deno.env.get("MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_IT_CH"),
);
const MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_CORRECTION = Number(
  Deno.env.get("MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_CORRECTION"),
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
    case "membership-confirmed":
    case "registration-confirmed":
    case "registration-confirmed-correction":
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
  if (!hasTemplatePayload(payload)) {
    return null;
  }

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
        Email: templateRecipientEmail(payload),
        Name: templateRecipientName(payload),
      },
    ],
    Variables: templateVariables(payload),
  };
}

//------------------------------------------------------------------------------
// Registration Removed Admin Notification Message
//------------------------------------------------------------------------------

function registrationRemovedAdminNotificationMessage(payload: Payload) {
  if (
    !payload.registration ||
    !payload.event ||
    !payload.table ||
    !payload.timeSlot
  ) {
    return null;
  }

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
    case "membership-confirmed":
      return locale === "en-GB" ?
          MAILJET_TEMPLATE_ID_MEMBERSHIP_CONFIRMED_EN_GB
        : MAILJET_TEMPLATE_ID_MEMBERSHIP_CONFIRMED_IT_CH;
    case "registration-confirmed":
      return locale === "en-GB" ?
          MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_EN_GB
        : MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_IT_CH;
    case "registration-confirmed-correction":
      return MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_CORRECTION;
    case "registration-removed":
      return locale === "en-GB" ?
          MAILJET_TEMPLATE_ID_REGISTRATION_REMOVED_EN_GB
        : MAILJET_TEMPLATE_ID_REGISTRATION_REMOVED_IT_CH;
  }
}

//------------------------------------------------------------------------------
// Format Location
//------------------------------------------------------------------------------

function formatLocation(event: NonNullable<Payload["event"]>) {
  return [event.locationName, event.locationAddress].filter(Boolean).join(", ");
}

//------------------------------------------------------------------------------
// Format Time Slot
//------------------------------------------------------------------------------

function formatTimeSlot(locale: Locale, timeSlot: Payload["timeSlot"]) {
  if (!timeSlot) return "";

  const startsAt = new Date(timeSlot.startsAt);
  const endsAt = new Date(timeSlot.endsAt);

  const start = new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: EVENT_TIME_ZONE,
  }).format(startsAt);
  const end = new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
    timeZone: EVENT_TIME_ZONE,
  }).format(endsAt);

  return `${start} - ${end}`;
}

//------------------------------------------------------------------------------
// Format Payment Method
//------------------------------------------------------------------------------

function formatPaymentMethod(
  locale: Locale,
  paymentMethod: NonNullable<Payload["membership"]>["paymentMethod"],
) {
  switch (paymentMethod) {
    case "twint":
      return "TWINT";
    case "bank_transfer":
      return locale === "en-GB" ? "bank transfer" : "versamento bancario";
    case "cash":
      return locale === "en-GB" ? "cash" : "contante";
  }
}

//------------------------------------------------------------------------------
// Basic Authorization
//------------------------------------------------------------------------------

function basicAuthorization(username: string, password: string) {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

//------------------------------------------------------------------------------
// Has Template Payload
//------------------------------------------------------------------------------

function hasTemplatePayload(payload: Payload) {
  if (payload.type === "membership-confirmed") {
    return Boolean(payload.membership);
  }

  return Boolean(
    payload.registration && payload.event && payload.table && payload.timeSlot,
  );
}

//------------------------------------------------------------------------------
// Template Recipient Email
//------------------------------------------------------------------------------

function templateRecipientEmail(payload: Payload) {
  if (payload.type === "membership-confirmed") {
    return payload.membership?.email ?? "";
  }

  return payload.registration?.email ?? "";
}

//------------------------------------------------------------------------------
// Template Recipient Name
//------------------------------------------------------------------------------

function templateRecipientName(payload: Payload) {
  if (payload.type === "membership-confirmed") {
    return payload.membership?.fullName ?? "";
  }

  return payload.registration?.playerName ?? "";
}

//------------------------------------------------------------------------------
// Template Variables
//------------------------------------------------------------------------------

function templateVariables(payload: Payload) {
  if (payload.type === "membership-confirmed") {
    if (!payload.membership) return {};

    return {
      city: payload.membership.city,
      email: payload.membership.email,
      firstName: payload.membership.firstName,
      fullName: payload.membership.fullName,
      lastName: payload.membership.lastName,
      paymentMethod: formatPaymentMethod(
        payload.locale,
        payload.membership.paymentMethod,
      ),
      postalCode: payload.membership.postalCode,
      street: payload.membership.street,
    };
  }

  if (
    !payload.registration ||
    !payload.event ||
    !payload.table ||
    !payload.timeSlot
  ) {
    return {};
  }

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

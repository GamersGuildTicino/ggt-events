type Locale = "en-GB" | "it-CH";
type EmailType = "registration-confirmed" | "registration-removed";

type Payload = {
  event: {
    locationAddress: string;
    locationName: string;
    title: string;
  };
  locale: Locale;
  registration: {
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

const MAILJET_API_KEY = Deno.env.get("MAILJET_API_KEY") ?? "";
const MAILJET_FROM_EMAIL = Deno.env.get("MAILJET_FROM_EMAIL") ?? "";
const MAILJET_FROM_NAME = Deno.env.get("MAILJET_FROM_NAME") ?? "";
const MAILJET_SECRET_KEY = Deno.env.get("MAILJET_SECRET_KEY") ?? "";
const TRANSACTIONAL_EMAIL_SECRET =
  Deno.env.get("TRANSACTIONAL_EMAIL_SECRET") ?? "";

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
  const email = buildEmail(payload);
  const mailjetAuthorization = basicAuthorization(
    MAILJET_API_KEY,
    MAILJET_SECRET_KEY,
  );

  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    body: JSON.stringify({
      Messages: [
        {
          From: {
            Email: MAILJET_FROM_EMAIL,
            Name: MAILJET_FROM_NAME,
          },
          HTMLPart: email.html,
          Subject: email.subject,
          TextPart: email.text,
          To: [
            {
              Email: payload.registration.email,
              Name: payload.registration.playerName,
            },
          ],
        },
      ],
    }),
    headers: {
      "Authorization": mailjetAuthorization,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) return json(data, response.status);
  return json(data, 200);
});

function buildEmail(payload: Payload) {
  if (payload.type === "registration-confirmed") {
    return registrationConfirmedEmail(payload);
  }

  return registrationRemovedEmail(payload);
}

function registrationConfirmedEmail(payload: Payload) {
  const detailsHtml = detailsListHtml(payload);
  const detailsText = detailsListText(payload);

  if (payload.locale === "it-CH") {
    return {
      html:
        `<p>Ciao ${escapeHtml(payload.registration.playerName)},</p>` +
        "<p>la tua registrazione è confermata.</p>" +
        detailsHtml +
        "<p>A presto,<br />Gamers Guild Ticino</p>",
      subject: `Conferma registrazione - ${payload.event.title}`,
      text:
        `Ciao ${payload.registration.playerName},\n\n` +
        "la tua registrazione è confermata.\n\n" +
        `${detailsText}\n\n` +
        "A presto,\nGamers Guild Ticino",
    };
  }

  return {
    html:
      `<p>Hello ${escapeHtml(payload.registration.playerName)},</p>` +
      "<p>your registration is confirmed.</p>" +
      detailsHtml +
      "<p>See you soon,<br />Gamers Guild Ticino</p>",
    subject: `Registration confirmed - ${payload.event.title}`,
    text:
      `Hello ${payload.registration.playerName},\n\n` +
      "your registration is confirmed.\n\n" +
      `${detailsText}\n\n` +
      "See you soon,\nGamers Guild Ticino",
  };
}

function registrationRemovedEmail(payload: Payload) {
  const detailsHtml = detailsListHtml(payload);
  const detailsText = detailsListText(payload);

  if (payload.locale === "it-CH") {
    return {
      html:
        `<p>Ciao ${escapeHtml(payload.registration.playerName)},</p>` +
        "<p>la tua registrazione è stata rimossa da questo tavolo.</p>" +
        detailsHtml +
        "<p>Per domande, contatta gli organizzatori.</p>" +
        "<p>Gamers Guild Ticino</p>",
      subject: `Registrazione rimossa - ${payload.event.title}`,
      text:
        `Ciao ${payload.registration.playerName},\n\n` +
        "la tua registrazione è stata rimossa da questo tavolo.\n\n" +
        `${detailsText}\n\n` +
        "Per domande, contatta gli organizzatori.\n\n" +
        "Gamers Guild Ticino",
    };
  }

  return {
    html:
      `<p>Hello ${escapeHtml(payload.registration.playerName)},</p>` +
      "<p>your registration has been removed from this table.</p>" +
      detailsHtml +
      "<p>If you have any questions, please contact the organizers.</p>" +
      "<p>Gamers Guild Ticino</p>",
    subject: `Registration removed - ${payload.event.title}`,
    text:
      `Hello ${payload.registration.playerName},\n\n` +
      "your registration has been removed from this table.\n\n" +
      `${detailsText}\n\n` +
      "If you have any questions, please contact the organizers.\n\n" +
      "Gamers Guild Ticino",
  };
}

function detailsListHtml(payload: Payload) {
  const labels = textLabels(payload.locale);

  return (
    "<ul>" +
    `<li><strong>${labels.event}:</strong> ${escapeHtml(payload.event.title)}</li>` +
    `<li><strong>${labels.table}:</strong> ${escapeHtml(payload.table.title)}</li>` +
    `<li><strong>${labels.gameMaster}:</strong> ${escapeHtml(payload.table.gameMasterName)}</li>` +
    `<li><strong>${labels.time}:</strong> ${escapeHtml(formatTimeSlot(payload.locale, payload.timeSlot))}</li>` +
    `<li><strong>${labels.location}:</strong> ${escapeHtml(formatLocation(payload.event))}</li>` +
    "</ul>"
  );
}

function detailsListText(payload: Payload) {
  const labels = textLabels(payload.locale);

  return [
    `${labels.event}: ${payload.event.title}`,
    `${labels.table}: ${payload.table.title}`,
    `${labels.gameMaster}: ${payload.table.gameMasterName}`,
    `${labels.time}: ${formatTimeSlot(payload.locale, payload.timeSlot)}`,
    `${labels.location}: ${formatLocation(payload.event)}`,
  ].join("\n");
}

function formatLocation(event: Payload["event"]) {
  return [event.locationName, event.locationAddress].filter(Boolean).join(", ");
}

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

function textLabels(locale: Locale) {
  if (locale === "it-CH") {
    return {
      event: "Evento",
      gameMaster: "Game Master",
      location: "Luogo",
      table: "Tavolo",
      time: "Orario",
    };
  }

  return {
    event: "Event",
    gameMaster: "Game Master",
    location: "Location",
    table: "Table",
    time: "Time",
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function basicAuthorization(username: string, password: string) {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status,
  });
}

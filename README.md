# Gamers Guild Ticino Events

Public event site and admin panel for managing tabletop roleplaying events, tables, time slots, registrations, and registration emails.

## Stack

- React
- Vite
- Chakra UI
- Supabase

## Features

- Public homepage with upcoming events
- Public event pages with table registration
- Admin authentication via Supabase Auth
- Admin event management
- Admin game system management
- Registration confirmation and removal emails via a Supabase Edge Function
- Localized UI in `en-GB` and `it-CH`

## Project Structure

- `src/`: frontend application
- `src/routes/pages/`: route entry pages, one page per folder
- `src/routes/components/`: route-related shared components
- `src/ui/`: generic shared UI
- `supabase/schemas/`: database source of truth
- `supabase/migrations/`: generated/manual migrations
- `supabase/functions/send-transactional-email/`: transactional email Edge Function

## Configuration

### Frontend Environment

Configure these in your local frontend env file, for example `.env.local`.

For GitHub Pages or any other static deployment, configure the same values in the deploy environment used to build the site.

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase publishable key used by the frontend

Note: `VITE_SUPABASE_ANON_KEY` still uses the older name, but the value should be the current Supabase publishable key.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start Supabase locally:

```bash
npx supabase start
```

3. Reset/apply the local database if needed:

```bash
npx supabase db reset
```

4. Provide the frontend env vars in a local env file.

5. Start the app:

```bash
npm run dev
```

## Validation Commands

```bash
npm run lint:check
npm run build
```

There is currently no formal test suite.

## Supabase Setup

The database source of truth is in `supabase/schemas/`. Schema files are edited directly, and migrations are generated from them.

Important: for this project, `pg_net` must currently be enabled manually in the Supabase dashboard.

### Required Extensions

- `supabase_vault`
- `pg_net`

### Manual `pg_net` Step

Enable `pg_net` from the Supabase Dashboard:

1. Open `Database`
2. Open `Extensions`
3. Enable `pg_net`
4. Choose the `extensions` schema when prompted

Even though the extension is installed under `extensions`, the callable functions used by this project are exposed under the `net` schema, for example:

```sql
net.http_post(...)
```

This is required for registration confirmation/removal emails.

## Admin Setup

Admin access is controlled by the `public.admin_users` table.

After creating a Supabase Auth user, grant admin access by inserting its user id:

```sql
insert into public.admin_users (user_id)
values ('<auth-user-uuid>');
```

## Registration Emails

Registration confirmation and removal emails are sent by:

- database function: `public.send_registration_email(...)`
- edge function: `send-transactional-email`

The current email provider is Mailjet.

### Supabase Edge Function Secrets

Configure these in Supabase for the `send-transactional-email` Edge Function:

```bash
MAILJET_API_KEY=...
MAILJET_SECRET_KEY=...
MAILJET_FROM_EMAIL=...
MAILJET_FROM_NAME=...
MAILJET_REPLY_TO_EMAIL=...
MAILJET_REPLY_TO_NAME=...
MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_EN_GB=...
MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_IT_CH=...
MAILJET_TEMPLATE_ID_REGISTRATION_REMOVED_EN_GB=...
MAILJET_TEMPLATE_ID_REGISTRATION_REMOVED_IT_CH=...
TRANSACTIONAL_EMAIL_SECRET=...
```

- `MAILJET_API_KEY`: Mailjet API key
- `MAILJET_SECRET_KEY`: Mailjet secret key
- `MAILJET_FROM_EMAIL`: sender email address used for transactional emails
- `MAILJET_FROM_NAME`: sender display name
- `MAILJET_REPLY_TO_EMAIL`: reply-to mailbox shown to recipients
- `MAILJET_REPLY_TO_NAME`: reply-to display name
- `MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_EN_GB`: Mailjet template id for English registration confirmations
- `MAILJET_TEMPLATE_ID_REGISTRATION_CONFIRMED_IT_CH`: Mailjet template id for Italian registration confirmations
- `MAILJET_TEMPLATE_ID_REGISTRATION_REMOVED_EN_GB`: Mailjet template id for English registration removals
- `MAILJET_TEMPLATE_ID_REGISTRATION_REMOVED_IT_CH`: Mailjet template id for Italian registration removals
- `TRANSACTIONAL_EMAIL_SECRET`: internal shared secret between Postgres and the Edge Function

`TRANSACTIONAL_EMAIL_SECRET` is not related to Mailjet credentials.

Mailjet transactional templates are selected by email type and locale. The Edge Function currently expects four templates:

- `registration-confirmed` / `en-GB`
- `registration-confirmed` / `it-CH`
- `registration-removed` / `en-GB`
- `registration-removed` / `it-CH`

The function passes these template variables:

- `cancellationUrl`
- `eventTitle`
- `gameMasterName`
- `location`
- `playerName`
- `tableTitle`
- `timeSlot`

### Supabase Vault Secrets

These values must exist in `vault.decrypted_secrets` inside the Supabase database:

- `project_url`
- `anon_key`
- `site_url`
- `transactional_email_secret`

Expected meanings:

- `project_url`: your Supabase project base URL, for example `https://<project-ref>.supabase.co`
- `anon_key`: your current Supabase publishable key
- `site_url`: public website base URL, used to build registration cancellation links
- `transactional_email_secret`: must match `TRANSACTIONAL_EMAIL_SECRET`

To verify:

```sql
select name, decrypted_secret
from vault.decrypted_secrets
where name in ('project_url', 'anon_key', 'site_url', 'transactional_email_secret');
```

To create a missing Vault secret:

```sql
select vault.create_secret(
  '<secret-value>',
  '<secret-name>',
  '<description>'
);
```

### Deploy the Edge Function

After changing the function:

```bash
supabase functions deploy send-transactional-email
```

### How the Email Flow Works

1. A registration or unregistration happens in Postgres.
2. `public.send_registration_email(...)` builds a payload.
3. Postgres calls `/functions/v1/send-transactional-email` via `net.http_post(...)`.
4. The Edge Function sends the email through Mailjet.

## GitHub Pages

If the site is deployed on GitHub Pages:

- the app build must use the frontend env vars listed above
- the custom domain and DNS are configured outside the repo
- GitHub Pages serves the built static output only

Current routing assumptions:

- Vite `base` is `/`
- the SPA fallback page in `public/404.html` must match root-domain hosting

## Mailjet Notes

- Mailjet is used for transactional outbound email only.
- Mailjet does not provide a normal mailbox/inbox for your custom domain.
- The sender address or sender domain must be validated in Mailjet.
- Domain-based sending is preferred over freemail senders such as Gmail for deliverability.

## Password Reset

Admin password reset uses Supabase Auth and redirects to:

```text
/admin/reset-password
```

Make sure your deployed frontend URL is allowed in Supabase Auth redirect settings.

## Deployment Notes

- The router uses `import.meta.env.BASE_URL` as the browser router basename.
- The app includes a one-time reload safeguard for stale lazy-loaded chunks after deploys.
- The site can be hosted statically, for example on GitHub Pages.

## Localization

- Supported locales: `en-GB`, `it-CH`
- Italian is the base language for the app
- All user-facing text should be localized

## Current Operational Notes

- Registration emails are functional once:
  - Mailjet secrets are set
  - Vault secrets are present
  - `pg_net` is enabled
  - the Edge Function is deployed
- Deliverability may be poor when sending from freemail addresses through Mailjet
- A proper custom domain sender is recommended for production

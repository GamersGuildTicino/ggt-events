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

## Frontend Environment

The frontend requires:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Note: `VITE_SUPABASE_ANON_KEY` is currently the Supabase publishable key, despite the older variable name.

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

### Edge Function Secrets

Set these in Supabase Edge Function secrets:

```bash
MAILJET_API_KEY=...
MAILJET_SECRET_KEY=...
MAILJET_FROM_EMAIL=...
MAILJET_FROM_NAME=...
TRANSACTIONAL_EMAIL_SECRET=...
```

`TRANSACTIONAL_EMAIL_SECRET` is an internal shared secret between the database-triggered HTTP call and the Edge Function. It is not related to Mailjet credentials.

### Vault Secrets

These secrets must exist in `vault.decrypted_secrets`:

- `project_url`
- `anon_key`
- `transactional_email_secret`

Expected meanings:

- `project_url`: your Supabase project base URL, for example `https://<project-ref>.supabase.co`
- `anon_key`: your current Supabase publishable key
- `transactional_email_secret`: must match `TRANSACTIONAL_EMAIL_SECRET`

To verify:

```sql
select name, decrypted_secret
from vault.decrypted_secrets
where name in ('project_url', 'anon_key', 'transactional_email_secret');
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

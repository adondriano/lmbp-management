# LMBP Management Portal

A responsive, installable team workspace built with the Next.js App Router, TypeScript, Tailwind CSS, Lucide, Supabase Auth/Postgres/Realtime/Storage, and Vercel. The uploaded LMBP emblem is used as the portal logo and PWA icon.

## What is included

- Executive dashboard, live PHT and Berlin clocks, weekly completion chart, shift roster, and clock-in/out with daily focus.
- Workspace task list and draggable board, assignees, priority, due dates, task comments/@mentions, reusable templates, weekly recurrence.
- Date-filtered team timesheets with per-user totals and daily breakdowns.
- Private Supabase Storage knowledge vault with extension filters and file version history.
- Supabase Realtime `postgres_changes` for instant space/direct messages, membership/read-marker updates, mention notifications, and live unread-space counters; offline outgoing messages queue until reconnect.
- Restricted Lead Tracker with table/kanban views, inline stages, manual lead entry, and a SheetJS-powered CSV/XLSX import modal for header mapping, preview, and bulk insertion.
- Settings with three persisted themes, push settings, role/access management, and protected Primary Admin hierarchy.
- PWA manifest/service worker, Vercel weekly recurrence cron, SQL migration and seed logic, auth callback, and authenticated push API route.

If Supabase environment variables are not set, the portal opens in an interactive local preview with browser-only demo data. Local preview uploads store file metadata only; real file bytes, authentication, realtime, and push delivery require Supabase configuration.

## Requirements

- Node.js 20.11 or newer
- A Supabase project
- Vercel account for deployment (optional for local development)

## Local development

```bash
npm install
cp .env.example .env.local
# Fill in your Supabase project URL and anon key (and push keys if needed)
npm run dev
```

Open `http://localhost:3000`. Without `.env.local` credentials, the app opens its local demo. With Supabase credentials, sign up or sign in using Supabase Auth.

## Supabase setup

1. Create a Supabase project and install the Supabase CLI.
2. Copy `.env.example` to `.env.local` and fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. **Never expose the service role key to browser code.**
3. Link the project, then apply all migrations:

   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

   The initial schema migration is `supabase/migrations/20261117000000_initial_schema.sql`; the follow-up `20261117123459_chat_mention_member_guard.sql` limits mention alerts to members of the conversation. `supabase/schema.sql` reflects the resulting schema.
4. Optional: set the designated first Primary Admin *before* signup in the SQL editor:

   ```sql
   update public.app_settings
   set value = lower('owner@yourcompany.com'), updated_at = now()
   where key = 'primary_admin_email';
   ```

   If no designated email is configured, the first registered Auth user is promoted to `primary_admin`. The database trigger creates the profile and default Operations, Development and Marketing workspaces plus the default chat spaces. Run `supabase/seed.sql` to re-apply defaults for an existing Primary Admin. No password or service credential is seeded.
5. In Supabase Auth URL configuration, set the production Site URL and allow your Vercel `/auth/callback` URL. Enable the email/password provider.
6. The migrations create the private `lmbp-knowledge` Storage bucket, storage-object policies, RLS, task/comment/permission/chat-mention notification triggers, and Realtime publication entries for chat messages, space memberships, and notifications.

## Environment variables

| Variable | Where it is used |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser/server Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe Auth and PostgREST access key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only push delivery and recurring-task cron |
| `PRIMARY_ADMIN_EMAIL` | Reference for the designated Primary Admin; set the matching DB setting in `app_settings` before signup |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Browser PushSubscription registration |
| `VAPID_PRIVATE_KEY` | Server-only Web Push signing key |
| `VAPID_SUBJECT` | VAPID contact (for example `mailto:admin@example.com`) |
| `CRON_SECRET` | Protects `/api/cron/recurring` |

Generate Web Push keys with:

```bash
npx web-push generate-vapid-keys
```

Set the public/private keys in local/Vercel environment variables. Push requires HTTPS (except localhost), a browser that supports Push API, user permission, and a stored subscription.

## Vercel deployment

1. Import this repository into Vercel and set the environment variables above in Project Settings.
2. Deploy. Add the production domain (and Preview domains as appropriate) to Supabase Auth's allowed redirect URLs.
3. Vercel Cron runs `/api/cron/recurring` on Mondays at 01:00 UTC. Configure the project `CRON_SECRET`; Vercel sends it in the `Authorization: Bearer …` header for cron invocations. The endpoint is idempotent by week and protected by a unique database index.
4. Chat delivery, @mention alerts, and unread counters are driven by `postgres_changes` on the `supabase_realtime` publication: `chat_messages` updates the conversation and unread badges, `chat_space_members` updates membership/read markers, and the mention trigger inserts recipient-specific `notifications`.

## Security notes

- Lead access is hidden in the navigation for members without permission, but the authoritative control is PostgreSQL RLS (`can_access_leads()`), so direct API requests are denied too.
- Profiles cannot self-promote or self-grant lead access. The database protects a Primary Admin from demotion.
- `SUPABASE_SERVICE_ROLE_KEY` and `VAPID_PRIVATE_KEY` are only read by Node.js API routes. Do not prefix them with `NEXT_PUBLIC_`.
- Knowledge files use private signed URLs, a 50 MiB file cap, a MIME allowlist, and workspace-folder Storage policies.
- The push route verifies the bearer session, message ownership, and space membership before delivering notifications; expired subscriptions are deleted.
- Chat @mentions resolve only against the current space’s members, and the database trigger independently checks membership before inserting a mention notification.
- The spreadsheet parser uses SheetJS 0.20.3 from the official SheetJS CDN tarball; the npm registry’s older 0.18.5 release is not used.

## Useful commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

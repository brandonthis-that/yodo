# Yodo

A tiny checklist for the things you normally forget. Group them into routines (morning, done by 8:00), collect points, and keep a streak when you finish on time.

One app for **phone, web, and desktop**. Your phone is the reminder engine. The web app (installable as a PWA) is the desktop companion. Everything syncs live through your own free [Supabase](https://supabase.com) project.

This repo is a **template**, not a shared cloud. Anyone can clone it, create their own free Supabase project, and run it. Your data stays in your project.

## What you get

- **Today** — today's routines as checklists, with due times
- **Routines** — named groups (days + due time + on-time bonus) and standalone tasks
- **Score** — today / all-time points and an on-time streak
- **Sync** — check something off on your laptop, the phone updates immediately
- **Reminders** — local notifications on Android and iOS for unfinished items

Points: each task has a value (default 1). Finish every task in a routine **before the due time** and you get the group bonus (default 5). Unchecking removes the points for that day.

## Setup (about five minutes)

You need Node.js 20+ and a free [Supabase](https://supabase.com/dashboard) account.

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USER/yodo.git
cd yodo
cp .env.example .env
npm install
```

### 2. Create a Supabase project

In the dashboard: **New project**. Wait until it is ready, then open **Project Settings → API** and copy:

- Project URL → `EXPO_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Paste both into `.env`. Never commit that file.

### 3. Run the schema

In Supabase, open **SQL Editor**, paste the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and run it.

That creates tables, row-level security (so users only see their own rows), a profile on signup, and realtime.

Optional, if you already use the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
npx supabase init
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### 4. Auth setting for personal use

In **Authentication → Providers → Email**, you can turn **off** “Confirm email” so the first account works immediately. Leave it on if you want confirmation emails.

### 5. Start the app

```bash
npx expo start
```

- Press `w` for web (this is also your desktop app)
- Press `a` for Android (emulator or USB device with USB debugging)
- iOS needs a Mac or [EAS Build](https://docs.expo.dev/build/introduction/)

Create an account in the app with email + password.

## Phone reminders

Local notifications are scheduled on the device from your synced tasks. Completing a task on any device cancels today's reminder for it.

They do **not** fire reliably in a browser. Use the Android or iOS app as the alarm clock; use web/desktop to check things off.

On Android 12+ the OS may ask for alarm/notification permission. Allow it.

A development build (`npx expo run:android`) is the reliable way to test notifications. Expo Go can show local notifications, but a real install is better.

## Web / desktop (PWA)

```bash
npm run web
```

Or deploy a static build. On [Cloudflare Pages](https://pages.cloudflare.com) (free):

1. Connect this GitHub repo
2. Build command: `npx expo export --platform web`
3. Output directory: `dist`
4. Add environment variables `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (build-time)
5. Deploy

In the browser: **Install page** / **Add to Home Screen** / **Install app** to pin it like a desktop app. Chrome, Edge, and Chromium-based browsers on Linux all work.

Same origin, same login, same data.

## Project layout

```
app/                  Expo Router screens
src/lib/              Supabase client, dates, points, notifications
src/hooks/            Data + realtime
src/components/       Minimal UI
supabase/migrations/  Schema + RLS
```

## Cost

For one person: **$0**.

- Supabase free tier is enough (the database will stay tiny)
- Expo is free
- Cloudflare Pages is free
- No Apple Developer account unless you want the iOS App Store

Use this every day so the free Supabase project is not paused for inactivity (they pause unused free projects after about a week).

## License

MIT. Fork it, self-host your own backend, change it.

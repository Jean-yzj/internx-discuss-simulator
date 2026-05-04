# 實習通．話題 — Discussion Simulator

A standalone Next.js demo of the InternX **「話題」** (discussion) feature.

This project is intentionally separate from the main InternX platform:

- Independent repo — does **not** share code with the InternX frontend.
- Independent backend — pure in-memory state. **No Firebase, no shared data.**
- Independent deploy — runs on its own Zeabur project.

The simulator restarts to a fresh seeded set of topics whenever the server
reboots. This is by design: it is a UX preview for technical reviewers,
not a production application.

## What's inside

- **Trending grid** — four hottest topics by `replyCount * 2 + viewCount`.
- **Category pills** — 9 categories (career, internship, interview, skills, salary, startup, campus, side, all).
- **Topic list** — sorted by latest activity.
- **Chat-style detail page** — message bubbles with day dividers, sticky composer, auto-scroll, polling-based "live" updates.
- **Anonymous identity** — display name persisted in `localStorage`; your own bubbles render right-aligned.

## Run locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Build for production

```bash
npm run build
npm start
```

## Deploy

This project ships with a multi-stage `Dockerfile` (Node 20 alpine).
Any platform that reads a Dockerfile (Zeabur, Fly, Railway, Cloud Run) can
deploy it.

## Architecture

```
pages/                                    UI routes
  index.jsx                               topic list
  topics/[id].jsx                         topic detail (chat-style)
  api/discuss/topics/                     in-memory REST endpoints
    index.js                              GET /  POST /
    [id]/index.js                         GET /:id
    [id]/replies.js                       GET / POST replies

lib/store.js                              in-memory state + seed data
components/
  SimulatorBar.jsx                        top bar with SIMULATOR badge
  Discuss/DiscussList.jsx                 list page
  Discuss/DiscussRoom.jsx                 chat-style detail
```

Built as a self-contained simulator for one feature. Swap `lib/store.js`
for a real backend (Postgres, Firestore, etc.) if you ever want to take
this past demo.

## Internal accounting tool

This repo now also includes an internal accounting form at `http://localhost:3000/accounting`.

Set these environment variables before using the Notion sync:

```bash
NOTION_TOKEN=secret_xxx
NOTION_ACCOUNTING_DATA_SOURCE_ID=26a01840-88bc-8101-8a2f-000bfeb2a44f
# optional: map submitter email/name to Notion user ids
NOTION_USER_MAP_JSON='{"someone@internx.ai":"00000000-0000-0000-0000-000000000000"}'
```

The form syncs into the Notion data source `公司帳目 (新)` and currently stores
receipt attachments as external URLs.

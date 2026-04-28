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

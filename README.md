# 🏛️ Quiz Club KLS GIT — Question of the Day & Live Leaderboard

A neobrutalist daily trivia and "Give Funda" platform for **Quiz Club, KLS Gogte Institute of Technology, Belagavi**: progressive hints, adaptive scoring, fuzzy answer matching and a live leaderboard with a Top‑3 podium and CW (Correct/Wrong) ratios.

## How it works

* **Everything lives in Supabase.** Users, questions, hint unlocks, attempts and scores are rows in the database. Nothing is stored in the browser except the theme and a signed, httpOnly login cookie.
* **The browser never talks to Supabase.** It calls `/api/*` routes (Next.js route handlers) which use a server‑only service role key. Row Level Security is enabled on every table with no public policies.
* **The server decides the outcome.** Answer matching, hint‑based point caps and score updates happen on the server, and the correct answer is only sent to a user after they have used their attempt.
* **One attempt per question per member**, enforced by a unique index in Postgres.
* **The Quizmaster publishes questions manually** ("Upload (Make Active)"). The active question stays live until another is published.

## Scoring

| Hints revealed | Max points |
|---|---|
| none | 100 |
| Toughest clue | 90 |
| Medium clue | 70 |
| Easiest clue | 50 |

## Members

Sign up with name, college UID, password, **designation** (Student / Graduate / Professor/Faculty / Other), **branch** and **year**. Passwords are stored as bcrypt hashes.

## Setup

1. Run `supabase/001_move_to_database.sql` once in the Supabase SQL editor (after the original `schema.sql`).
2. `npm install` (adds `bcryptjs` and `jose`).
3. Copy `.env.example` to `.env.local` and fill it in; add the same variables in Vercel and redeploy.
4. `npm run dev`

## Tech

Next.js 15 (App Router, React 19, TypeScript) · Tailwind CSS · Supabase PostgreSQL · Vercel

*Curated with passion for the quizzing scholars of KLS Gogte Institute of Technology, Belagavi.*

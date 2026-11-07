# 🏛️ Quiz Club KLS GIT — Question of the Day & Leaderboard

An editorial, retro-inspired daily trivia and "Give Funda" web application built for **Quiz Club, Karnatak Law Society's Gogte Institute of Technology (KLS GIT), Belagavi**.

Designed with the aesthetic, typography, and atmospheric experience of [References Game](https://referencesgame.com/), featuring progressive hint disclosure, an adaptive score economy, smart conceptual fuzzy matching, and real-time leaderboard ranking with game-style **K/D (Correct / Wrong) ratios**.

---

## 🌟 Key Features

### 1. Daily Gameplay & Question of the Day (QOTD)
* **Question on the Top:** Clean, prominent masthead displaying the daily edition marker (e.g. *Edition #42*), publication date, and quiz prompt.
* **Progressive Clue Stack:** Up to 3 tiered hints ordered from hardest to easiest:
  * **Clue 1 (Toughest / Difficult):** Obscure conceptual clue.
  * **Clue 2 (Medium):** Clearer historical or contextual pointer.
  * **Clue 3 (Easiest):** Direct hint.
* **Adaptive Scoring Economy:**
  * Answering without clues: **100 ★ Points**
  * Answering with difficult clue revealed: **90 ★ Points**
  * Answering with medium clue revealed: **70 ★ Points**
  * Answering with easy clue revealed: **50 ★ Points**
* **Confirmation Friction / Reveal Safeguards:** Modals prevent accidental hint unlocks or forfeits before players take their best guesses.

### 2. Smart "Give Funda" Fuzzy Matching Engine
* For conceptual trivia and "Give Funda" questions, answers are evaluated using an intelligent multi-stage algorithm:
  * Normalization & typo tolerance (Damerau-Levenshtein distance).
  * Semantic token set overlap (Sørensen-Dice coefficient).
  * Substring & title matching.
  * Concept keyword matching configured by the Quizmaster.
* Rewards genuine conceptual understanding without penalizing minor spelling variations or alternate phrasings.

### 3. Dual Authentication Roles
* **Member / Student Authentication:**
  * **Real Full Name** (e.g. *Rohan Kulkarni*).
  * **College UID** assigned by KLS GIT from the student ID card (e.g. `25u0101`, `24u0340`).
  * Password.
* **Quizmaster (QM) Portal:**
  * Dedicated credentials:
    * **Username:** `phineas`
    * **Password:** `phineastheqm`
  * Complete control to dump, edit, and archive questions.
  * Configurable hint count per question (1 to 3 hints chosen by the QM).
  * Single-click **"Upload / Make Active"** button to publish questions as the live Question of the Day.
  * Live participant submission stream and answer review.

### 4. Competitive Leaderboard with K/D Ratios
* Tracks total Star score ranking.
* Displays **Correct / Wrong (K/D) ratio** (e.g. `12C / 2W (6.00)`), rewarding precision and penalizing blind guesses.
* Highlights real names and college UIDs on the podium.

### 5. References Game Editorial Aesthetic & Atmospheric Customization
* **Adaptive Lighting Themes:**
  * 🌅 *Morning* (soft warm cream / off-white editorial paper)
  * 🌇 *Golden Hour* (warm amber sunset glow)
  * 🌌 *Dusk* (twilight slate & indigo)
  * 🌑 *Midnight* (charcoal `#121212` & deep slate `#1e293b`)
* **Atmospheric Motion:** *Calm*, *Breeze*, *Gale* animation controls.
* **Interactive Pet Companions:** *Cat* 🐱, *Dog* 🐶, or *Owl* 🦉 with dynamic speech bubbles reacting to hints, guesses, and victories.
* **Social Share Cards:** Wordle/References-style share summaries with emojis for WhatsApp and Instagram.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Next.js 15 (App Router, React 19, TypeScript)
* **Styling:** Tailwind CSS with custom editorial color tokens
* **Icons:** Lucide React
* **Confetti:** Canvas-Confetti
* **Database & Hosting:**
  * **Vercel:** Optimized for zero-configuration deployment
  * **Supabase:** PostgreSQL database with schema (`supabase/schema.sql`)
  * **Hybrid Storage Engine:** Seamless fallback to browser local storage so the application runs instantly out of the box even before database keys are configured.

---

## 🚀 Quick Start & Deployment

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Supabase Setup (Optional for Persistence)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run the script located in:
   ```
   supabase/schema.sql
   ```
3. Copy your project URL and Anon Key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

### Deploying to Vercel

1. Push your repository to GitHub: `https://github.com/Phineasgenius/qcklsgit`
2. Import the project in [vercel.com](https://vercel.com).
3. If using Supabase, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your Vercel Environment Variables.
4. Click **Deploy**!

---

## 🛡️ Quizmaster Credentials Summary

| Role | Username / Identifier | Password | Access |
|---|---|---|---|
| **Quizmaster (QM)** | `phineas` | `phineastheqm` | Question Dump, Hint Selection (1-3), Publish QOTD, Review Submissions |
| **Student / Member** | College UID (e.g. `25u0101`) | User-defined | Daily Quiz, Hints, Score Bank, Leaderboard |

---

*Curated with passion for the quizzing scholars of KLS Gogte Institute of Technology, Belagavi.*

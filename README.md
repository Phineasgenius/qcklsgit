# 🏛️ Quiz Club KLS GIT — Question of the Day & Live Leaderboard

A crisp, modern neobrutalist daily trivia and "Give Funda" platform built for **Quiz Club, Karnatak Law Society's Gogte Institute of Technology (KLS GIT), Belagavi**.

Featuring a clean, high-contrast, paper-and-ink visual aesthetic inspired by [litkod-lidarbord](https://github.com/Phineasgenius/litkod-lidarbord) with progressive hint disclosure, an adaptive score economy, smart conceptual fuzzy matching, and a live leaderboard featuring **Top 3 podiums** and game-style **K/D (Correct / Wrong) ratios**.

---

## 🌟 Key Features

### 1. Simple, Crisp & High-Contrast Neobrutalist UI
* **Clean Masthead:** Yellow icon badge, bold Bricolage Grotesque typography, seamless tab navigation (*Today's Quiz* vs *Leaderboard*), and instant Light / Dark mode toggle.
* **Warm Paper Aesthetic:** Dot-grid background with solid 2.5px ink borders and hard-drop offset shadows (`4px 4px 0 var(--ink)`).
* **Vibrant Accent Coding:** Punchy Yellow (`#ffce4a`), Red (`#ff3b2f`), Teal (`#36c2ad`), Coral, and Lilac accents for hints, badges, and podium rankings.

### 2. Daily Gameplay & Question of the Day (QOTD)
* **Question on Top:** Bold, clear typography displaying the daily edition marker (e.g. *Edition #42*), date, and question text.
* **Progressive Clue Stack:** Up to 3 tiered hints configured by the Quizmaster:
  * **Clue 1 (Toughest / Difficult):** Obscure connection (Caps max score at 90 ★).
  * **Clue 2 (Medium):** Clearer historical or conceptual clue (Caps max score at 70 ★).
  * **Clue 3 (Easiest):** Direct pointer (Caps max score at 50 ★).
* **Scoring Rules:**
  * No hints used: **100 ★ Points**
  * Difficult hint unlocked: **90 ★ Points**
  * Medium hint unlocked: **70 ★ Points**
  * Easy hint unlocked: **50 ★ Points**
* **Confirmation Safeguards:** Friction modals before unlocking clues or forfeiting a puzzle to prevent accidental loss of points.

### 3. Smart "Give Funda" Fuzzy Matching Engine
* Checks for conceptual understanding rather than requiring exact verbatim strings:
  * Typo and spelling tolerance (Damerau-Levenshtein distance).
  * Word token overlap (Sørensen-Dice coefficient).
  * Concept keyword matching configured by the Quizmaster.
  * Substring / title matches.

### 4. Litkod-Style Leaderboard & Top 3 Podium
* **Top 3 Podium Cards:**
  * 🥇 1st Place (Gold Crown, elevated)
  * 🥈 2nd Place (Silver)
  * 🥉 3rd Place (Bronze)
* **Search & Sort:** Search any participant by name or College UID, sort by Score (Stars) or K/D Ratio.
* **K/D (Correct / Wrong) Ratio:** Calculates exact accuracy (e.g. `5C / 1W • 5.00 K/D`), rewarding thoughtful answers.

### 5. Dual Logins & Quizmaster Portal
* **Student Login:** Real Name + College UID (e.g. `25u0101` from the ID card) + Password.
* **Quizmaster (QM) Login:**
  * Username: `phineas`
  * Password: `phineastheqm`
  * Add / dump any number of questions with 1 to 3 hints.
  * One-click **"Upload (Make Active)"** to set the Question of the Day.
  * Submissions audit log.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Next.js 15 (App Router, React 19, TypeScript)
* **Styling:** Tailwind CSS + Neobrutalist custom CSS tokens
* **Fonts:** Bricolage Grotesque & Hanken Grotesk
* **Database:** Supabase PostgreSQL (`supabase/schema.sql`) with seamless local storage fallback
* **Deployment:** Zero-config Vercel deployment

---

## 🛡️ Quizmaster Credentials

| Role | Username / Identifier | Password | Access |
|---|---|---|---|
| **Quizmaster (QM)** | `phineas` | `phineastheqm` | Dump questions, pick 1–3 hints, set QOTD, review answers |
| **Student / Member** | College UID (e.g. `25u0101`) | User-defined | Daily Quiz, Hints, Score Bank, Leaderboard |

---

*Curated with passion for the quizzing scholars of KLS Gogte Institute of Technology, Belagavi.*

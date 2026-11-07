-- ==============================================================================
-- QUIZ CLUB KLS GIT - SUPABASE DATABASE SCHEMA
-- Question of the Day & Editorial Leaderboard Platform
-- ==============================================================================

-- 1. PROFILES TABLE (Users & Quizmaster)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    uid TEXT UNIQUE NOT NULL, -- College UID format: e.g. 25u0101
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'quizmaster')),
    password_hash TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    wrong_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for UID lookup and leaderboard sorting
CREATE INDEX IF NOT EXISTS idx_profiles_uid ON public.profiles(uid);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles(points DESC);

-- 2. QUESTIONS REPOSITORY TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    edition INTEGER NOT NULL,
    title TEXT NOT NULL,
    question_text TEXT NOT NULL,
    hint_difficult TEXT, -- Clue 1 (Toughest) -> gives 90 pts
    hint_medium TEXT,    -- Clue 2 (Medium)    -> gives 70 pts
    hint_easy TEXT,      -- Clue 3 (Easiest)   -> gives 50 pts
    answer TEXT NOT NULL,
    funda_keywords TEXT[] DEFAULT '{}', -- Keywords for conceptual / "give funda" checking
    is_funda BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. DAILY ACTIVE QUESTION POINTER
CREATE TABLE IF NOT EXISTS public.daily_question (
    id TEXT PRIMARY KEY,
    question_id TEXT REFERENCES public.questions(id) ON DELETE CASCADE,
    active_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. SUBMISSIONS & ATTEMPTS LOG
CREATE TABLE IF NOT EXISTS public.submissions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id TEXT REFERENCES public.questions(id) ON DELETE CASCADE,
    guess TEXT NOT NULL,
    hints_unlocked TEXT[] DEFAULT '{}',
    points_awarded INTEGER NOT NULL DEFAULT 0,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    match_score NUMERIC(4, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_question ON public.submissions(user_id, question_id);

-- 5. LEADERBOARD VIEW WITH K/D (CORRECT/WRONG) RATIO
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
    p.id,
    p.name,
    p.uid,
    p.points,
    p.correct_count,
    p.wrong_count,
    CASE 
        WHEN p.wrong_count = 0 THEN p.correct_count::numeric
        ELSE ROUND((p.correct_count::numeric / p.wrong_count::numeric), 2)
    END AS kd_ratio,
    RANK() OVER (ORDER BY p.points DESC, p.correct_count DESC) AS rank
FROM public.profiles p
WHERE p.role = 'user';

-- 6. SEED QUIZMASTER ACCOUNT
-- Default QM login requested: phineas & phineastheqm
INSERT INTO public.profiles (id, name, uid, role, password_hash, points, correct_count, wrong_count)
VALUES (
    'qm-phineas',
    'Phineas (Quizmaster)',
    'phineas',
    'quizmaster',
    'phineastheqm',
    0,
    0,
    0
)
ON CONFLICT (uid) DO NOTHING;

-- 7. INITIAL SAMPLE QUESTIONS FOR QUIZ CLUB KLS GIT
INSERT INTO public.questions (id, edition, title, question_text, hint_difficult, hint_medium, hint_easy, answer, funda_keywords, is_funda, status)
VALUES 
(
    'q-ed-42',
    42,
    'The Belagavi Accord',
    'In December 1924, this landmark political session took place in Belagavi (Belgaum), notable for being the only Congress session ever presided over by a singular iconic figure in Indian history. What was this historic event or who was the president?',
    'The venue of this 39th session was famously christened Vijayanagar in tribute to the great southern empire.',
    'A special memorial well known as "Veera Soudha" commemorates this very meeting in Tilakwadi, Belagavi.',
    'The individual who presided over it was later affectionately titled the Father of the Nation.',
    'Mahatma Gandhi (1924 Belgaum Congress Session)',
    ARRAY['mahatma', 'gandhi', 'belgaum', 'congress', '1924', 'veera soudha', 'president'],
    true,
    'active'
),
(
    'q-ed-43',
    43,
    'The Quantum Feline',
    'Give the funda: In 1935, an Austrian-Irish physicist devised an intriguing thought experiment illustrating the paradox of quantum superposition, involving a flask of poison, a radioactive atom, and a domestic pet. What is the funda or name of this experiment?',
    'Formulated in critique of the Copenhagen interpretation during discussions with Albert Einstein.',
    'The subject in the box is paradoxically both dead and alive simultaneously until observed.',
    'It is named after the physicist whose eponymous wave equation won him the Nobel Prize in 1933.',
    'Schrödinger''s Cat (Quantum Superposition)',
    ARRAY['schrodinger', 'cat', 'superposition', 'copenhagen', 'quantum'],
    true,
    'draft'
)
ON CONFLICT (id) DO NOTHING;

-- Set question 42 as the active Question of the Day
INSERT INTO public.daily_question (id, question_id, active_date)
VALUES ('daily-today', 'q-ed-42', CURRENT_DATE)
ON CONFLICT (id) DO UPDATE SET question_id = 'q-ed-42';

-- ==============================================================================
-- QUIZ CLUB KLS GIT - MIGRATION 001
-- Moves the app fully onto the database. Run ONCE in Supabase -> SQL Editor.
-- Safe to re-run: every step is guarded.
-- ==============================================================================

begin;

-- ------------------------------------------------------------------------------
-- 0. Remove things that must not exist any more
-- ------------------------------------------------------------------------------
-- The old leaderboard view runs with owner rights and would bypass RLS (public leak).
drop view if exists public.leaderboard_view;
-- Not used any more: the active question is simply questions.status = 'active'.
drop table if exists public.daily_question;
-- Sample questions that were seeded by schema.sql.
delete from public.questions where id in ('q-ed-42', 'q-ed-43');
-- Quizmaster row with a plaintext password. QM login now uses server env vars.
delete from public.profiles where role = 'quizmaster' or uid = 'phineas';

-- ------------------------------------------------------------------------------
-- 1. profiles: year / branch / designation, auto ids
-- ------------------------------------------------------------------------------
alter table public.profiles alter column id set default gen_random_uuid()::text;
alter table public.profiles add column if not exists year text;
alter table public.profiles add column if not exists branch text;
alter table public.profiles add column if not exists designation text;

alter table public.profiles drop constraint if exists profiles_year_check;
alter table public.profiles add constraint profiles_year_check
  check (year is null or year in ('1st', '2nd', '3rd', '4th', 'N/A'));

alter table public.profiles drop constraint if exists profiles_branch_check;
alter table public.profiles add constraint profiles_branch_check
  check (branch is null or branch in
    ('CSE', 'ISE', 'ECE', 'EEE', 'ME', 'Civil', 'AI & ML', 'Architecture', 'MCA', 'B Des'));

alter table public.profiles drop constraint if exists profiles_designation_check;
alter table public.profiles add constraint profiles_designation_check
  check (designation is null or designation in ('Student', 'Graduate', 'Professor/Faculty', 'Other'));

-- ------------------------------------------------------------------------------
-- 2. questions
-- ------------------------------------------------------------------------------
alter table public.questions alter column id set default gen_random_uuid()::text;
alter table public.questions add column if not exists funda text;
alter table public.questions add column if not exists published_at timestamptz;

-- At most one active question at any time (enforced by the database).
create unique index if not exists one_active_question
  on public.questions (status) where status = 'active';

-- ------------------------------------------------------------------------------
-- 3. submissions: ONE attempt per user per question
-- ------------------------------------------------------------------------------
alter table public.submissions alter column id set default gen_random_uuid()::text;
alter table public.submissions add column if not exists match_feedback text;

create unique index if not exists submissions_one_attempt_per_question
  on public.submissions (user_id, question_id);

-- ------------------------------------------------------------------------------
-- 4. hint_unlocks: which clues a user revealed (so scoring cannot be faked)
-- ------------------------------------------------------------------------------
create table if not exists public.hint_unlocks (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references public.profiles(id) on delete cascade,
  question_id text not null references public.questions(id) on delete cascade,
  tier text not null check (tier in ('difficult', 'medium', 'easy')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, question_id, tier)
);

-- ------------------------------------------------------------------------------
-- 5. Atomic functions (called by the server only)
-- ------------------------------------------------------------------------------
create or replace function public.submit_answer(
  p_user_id text,
  p_question_id text,
  p_guess text,
  p_hints text[],
  p_points integer,
  p_correct boolean,
  p_score numeric,
  p_feedback text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Raises unique_violation (23505) if this user already attempted this question.
  insert into submissions (user_id, question_id, guess, hints_unlocked, points_awarded, is_correct, match_score, match_feedback)
  values (p_user_id, p_question_id, p_guess, p_hints,
          case when p_correct then p_points else 0 end,
          p_correct, least(greatest(p_score, 0), 99.99), p_feedback);

  update profiles
     set points = points + case when p_correct then p_points else 0 end,
         correct_count = correct_count + case when p_correct then 1 else 0 end,
         wrong_count = wrong_count + case when p_correct then 0 else 1 end
   where id = p_user_id;
end;
$$;

create or replace function public.activate_question(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update questions set status = 'archived' where status = 'active' and id <> p_id;
  update questions set status = 'active', published_at = now() where id = p_id;
  if not found then
    raise exception 'question not found';
  end if;
end;
$$;

revoke all on function public.submit_answer(text, text, text, text[], integer, boolean, numeric, text) from public, anon, authenticated;
revoke all on function public.activate_question(text) from public, anon, authenticated;
grant execute on function public.submit_answer(text, text, text, text[], integer, boolean, numeric, text) to service_role;
grant execute on function public.activate_question(text) to service_role;

-- ------------------------------------------------------------------------------
-- 6. Lock the tables: the browser can no longer touch them directly.
--    Only the server (service role key) can read/write.
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.submissions enable row level security;
alter table public.hint_unlocks enable row level security;

revoke all on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;

commit;

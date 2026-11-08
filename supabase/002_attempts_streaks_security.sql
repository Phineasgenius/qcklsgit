-- ==============================================================================
-- QUIZ CLUB KLS GIT - MIGRATION 002
-- AE branch, security question (forgot password), multiple attempts per question.
-- Run ONCE in Supabase -> SQL Editor, AFTER 001. Safe to re-run.
-- ==============================================================================

begin;

-- 1. AE branch ----------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_branch_check;
alter table public.profiles add constraint profiles_branch_check
  check (branch is null or branch in
    ('CSE', 'ISE', 'ECE', 'EEE', 'ME', 'Civil', 'AI & ML', 'AE', 'Architecture', 'MCA', 'B Des'));

-- 2. Security question for password reset -------------------------------------
alter table public.profiles add column if not exists security_question text;
alter table public.profiles add column if not exists security_answer_hash text;
alter table public.profiles add column if not exists reset_fails integer not null default 0;
alter table public.profiles add column if not exists reset_locked_until timestamptz;

-- 3. Several attempts per question (number of hints + 1) -----------------------
alter table public.submissions add column if not exists attempt_no integer not null default 1;
alter table public.submissions add column if not exists is_forfeit boolean not null default false;
update public.submissions set is_forfeit = true where guess = '[Forfeited]';

drop index if exists public.submissions_one_attempt_per_question;

-- Each attempt number can exist only once per user and question.
create unique index if not exists submissions_user_question_attempt
  on public.submissions (user_id, question_id, attempt_no);
-- A user can solve a question only once, and forfeit it only once.
create unique index if not exists submissions_one_correct
  on public.submissions (user_id, question_id) where is_correct;
create unique index if not exists submissions_one_forfeit
  on public.submissions (user_id, question_id) where is_forfeit;

-- 4. Replace the atomic submit function ---------------------------------------
drop function if exists public.submit_answer(text, text, text, text[], integer, boolean, numeric, text);

create or replace function public.submit_answer(
  p_user_id text,
  p_question_id text,
  p_guess text,
  p_hints text[],
  p_points integer,
  p_correct boolean,
  p_score numeric,
  p_feedback text,
  p_forfeit boolean,
  p_max_attempts integer
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used integer;
  v_done boolean;
begin
  -- Lock the user's row so two simultaneous submissions are processed one at a time.
  perform 1 from profiles where id = p_user_id for update;
  if not found then
    raise exception 'user_not_found';
  end if;

  select count(*), coalesce(bool_or(is_correct or is_forfeit), false)
    into v_used, v_done
    from submissions
   where user_id = p_user_id and question_id = p_question_id;

  if v_done then
    raise exception 'already_finished';
  end if;
  if v_used >= p_max_attempts then
    raise exception 'no_attempts_left';
  end if;

  insert into submissions
    (user_id, question_id, guess, hints_unlocked, points_awarded, is_correct,
     match_score, match_feedback, attempt_no, is_forfeit)
  values
    (p_user_id, p_question_id, p_guess, p_hints,
     case when p_correct then p_points else 0 end,
     p_correct, least(greatest(p_score, 0), 99.99), p_feedback, v_used + 1, p_forfeit);

  update profiles
     set points = points + case when p_correct then p_points else 0 end,
         correct_count = correct_count + case when p_correct then 1 else 0 end,
         wrong_count = wrong_count + case when p_correct then 0 else 1 end
   where id = p_user_id;

  return v_used + 1;
end;
$$;

revoke all on function public.submit_answer(text, text, text, text[], integer, boolean, numeric, text, boolean, integer) from public, anon, authenticated;
grant execute on function public.submit_answer(text, text, text, text[], integer, boolean, numeric, text, boolean, integer) to service_role;

commit;

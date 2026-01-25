// Drop existing policy if it exists (for idempotency)
drop policy if exists "Admins can manage tips." on public.tips;

// Re-create policy to ensure it's not recursive or causing deadlocks
create policy "Admins can manage tips." on public.tips for all using (
  auth.uid() in (
    select id from public.profiles where role = 'admin'
  )
);

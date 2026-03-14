create or replace function public.bootstrap_owner_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(new.email, '')) = 'tat38254@gmail.com' then
    insert into public.admin_users (user_id, email, role)
    values (new.id, lower(new.email), 'admin')
    on conflict (user_id) do update
    set
      email = excluded.email,
      role = excluded.role;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_owner_admin_bootstrap on auth.users;
create trigger on_auth_owner_admin_bootstrap
  after insert or update of email on auth.users
  for each row
  execute function public.bootstrap_owner_admin();

insert into public.admin_users (user_id, email, role)
select
  id,
  lower(email),
  'admin'
from auth.users
where lower(email) = 'tat38254@gmail.com'
on conflict (user_id) do update
set
  email = excluded.email,
  role = excluded.role;

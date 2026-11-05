begin;

create table public.ritual_cards (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('affirmation', 'intention')),
  tag text not null,
  body text not null,
  active boolean not null default true,
  unique (id, kind)
);

create table public.ritual_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  mood text not null default '' check (mood in ('', 'calm', 'tired', 'overwhelmed', 'grateful')),
  energy integer not null default 50 check (energy between 0 and 100),
  need text not null default '' check (char_length(need) <= 60),
  reflection text not null default '' check (char_length(reflection) <= 4000),
  evening text not null default '' check (char_length(evening) <= 4000),
  completed boolean not null default false,
  primary key (user_id, day)
);

create table public.ritual_draws (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  kind text not null,
  card_id bigint not null,
  primary key (user_id, day, kind),
  foreign key (card_id, kind) references public.ritual_cards (id, kind)
);

alter table public.ritual_cards enable row level security;
alter table public.ritual_days enable row level security;
alter table public.ritual_draws enable row level security;

revoke all on public.ritual_cards, public.ritual_days, public.ritual_draws from anon, authenticated;
grant select on public.ritual_cards to authenticated;
grant select, insert, update on public.ritual_days to authenticated;
grant select, insert on public.ritual_draws to authenticated;

create policy "Read deck" on public.ritual_cards
  for select to authenticated using (true);

create policy "Own daily records" on public.ritual_days
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Read own draws" on public.ritual_draws
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Create own draws" on public.ritual_draws
  for insert to authenticated with check ((select auth.uid()) = user_id);

create function public.draw_ritual_card(draw_day date, draw_kind text)
returns table (id bigint, kind text, tag text, body text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null or draw_kind is null or draw_kind not in ('affirmation', 'intention') then
    raise exception 'Invalid card draw';
  end if;

  insert into public.ritual_draws (user_id, day, kind, card_id)
  select current_user_id, draw_day, cards.kind, cards.id
  from public.ritual_cards as cards
  where cards.kind = draw_kind and cards.active
  order by random()
  limit 1
  on conflict on constraint ritual_draws_pkey do nothing;

  return query
  select cards.id, cards.kind, cards.tag, cards.body
  from public.ritual_draws as draws
  join public.ritual_cards as cards on (cards.id, cards.kind) = (draws.card_id, draws.kind)
  where draws.user_id = current_user_id and draws.day = draw_day and draws.kind = draw_kind;
end;
$$;

revoke execute on function public.draw_ritual_card(date, text) from public, anon;
grant execute on function public.draw_ritual_card(date, text) to authenticated;

insert into public.ritual_cards (kind, tag, body) values
  ('affirmation', 'Spokój', 'Mogę zwolnić i nadal iść naprzód.'),
  ('affirmation', 'Łagodność', 'Jestem wystarczająca dokładnie taka, jaka jestem.'),
  ('affirmation', 'Odwaga', 'Mam prawo zabrać głos, nawet gdy głos mi drży.'),
  ('affirmation', 'Odpoczynek', 'Odpoczynek jest częścią mojego dnia. Nie muszę na niego zasługiwać.'),
  ('affirmation', 'Bliskość', 'Mogę być dla siebie osobą, do której chcę wracać.'),
  ('affirmation', 'Zaufanie', 'Wystarczy jeden mały krok w moim tempie.'),
  ('intention', 'Spokój', 'Dziś zrobię jedną rzecz spokojniej niż zwykle.'),
  ('intention', 'Łagodność', 'Dziś odezwę się do siebie tak, jak odezwałabym się do przyjaciółki.'),
  ('intention', 'Odwaga', 'Dziś zrobię trochę miejsca na to, czego naprawdę chcę.'),
  ('intention', 'Odpoczynek', 'Dziś znajdę chwilę ciszy między jedną rzeczą a drugą.'),
  ('intention', 'Wdzięczność', 'Dziś zauważę jedną zwyczajną rzecz, która mi służy.'),
  ('intention', 'Uważność', 'Dziś choć przez chwilę będę robić tylko jedną rzecz.');

commit;

import { createClient } from '@supabase/supabase-js';
import { sampleCards } from './content.js';

export const cloudEnabled = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
let client;
const localKey = 'namaste-alma-demo-v1';

export function dateKey(date = new Date()) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => index ? String(part).padStart(2, '0') : part).join('-');
}

function localData() {
  try {
    return JSON.parse(localStorage.getItem(localKey)) ?? {};
  } catch {
    return {};
  }
}

function writeLocal(day, patch) {
  const data = localData();
  const updated = { ...data[day], ...patch, day };
  data[day] = updated;
  localStorage.setItem(localKey, JSON.stringify(data));
  return updated;
}

function checked(result) {
  if (result.error) throw result.error;
  return result.data;
}

export async function initStore() {
  if (!cloudEnabled) return null;

  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return checked(await client.auth.getSession()).session?.user ?? null;
}

export async function sendCode(email) {
  checked(await client.auth.signInWithOtp({ email }));
}

export async function verifyCode(email, token) {
  return checked(await client.auth.verifyOtp({ email, token, type: 'email' })).user;
}

export async function signOut() {
  checked(await client.auth.signOut({ scope: 'local' }));
}

export async function loadDay(user, day) {
  if (!cloudEnabled) return localData()[day] ?? { day };
  const [dayResult, drawResult] = await Promise.all([
    client.from('ritual_days').select('*').eq('user_id', user.id).eq('day', day).maybeSingle(),
    client.from('ritual_draws').select('kind, ritual_cards(id,kind,tag,body)').eq('user_id', user.id).eq('day', day),
  ]);
  const record = checked(dayResult) ?? { day };
  for (const draw of checked(drawResult)) record[draw.kind] = draw.ritual_cards;
  return record;
}

export async function saveDay(user, day, patch) {
  if (!cloudEnabled) return writeLocal(day, patch);
  return checked(await client.from('ritual_days').upsert(
    { ...patch, user_id: user.id, day }, { onConflict: 'user_id,day' },
  ).select().single());
}

export async function drawCard(user, day, kind, selected) {
  if (selected) return selected;
  if (!cloudEnabled) {
    const cards = sampleCards.filter(card => card.kind === kind);
    const card = cards[Math.floor(Math.random() * cards.length)];
    writeLocal(day, { [kind]: card });
    return card;
  }
  const result = checked(await client.rpc('draw_ritual_card', { draw_day: day, draw_kind: kind }));
  return result?.[0] ?? null;
}

export async function loadJournal(user, start, end) {
  if (!cloudEnabled) return Object.values(localData()).filter(record => record.day >= start && record.day < end);
  const [dayResult, drawResult] = await Promise.all([
    client.from('ritual_days').select('*').eq('user_id', user.id).gte('day', start).lt('day', end),
    client.from('ritual_draws').select('day, kind, ritual_cards(id,kind,tag,body)').eq('user_id', user.id).gte('day', start).lt('day', end),
  ]);
  const records = new Map(checked(dayResult).map(record => [record.day, record]));
  for (const draw of checked(drawResult)) {
    const record = records.get(draw.day) ?? { day: draw.day };
    record[draw.kind] = draw.ritual_cards;
    records.set(draw.day, record);
  }
  return [...records.values()];
}



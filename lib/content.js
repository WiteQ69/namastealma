export const moods = [
  { id: 'calm', icon: 'happy', label: 'Spokojna' },
  { id: 'tired', icon: 'tired', label: 'Zmęczona' },
  { id: 'overwhelmed', icon: 'cloud', label: 'Przebodźcowana' },
  { id: 'grateful', icon: 'smile', label: 'Wdzięczna' },
];

export const needs = ['Spokoju', 'Wsparcia', 'Motywacji', 'Odpoczynku', 'Pewności siebie', 'Kontaktu ze sobą'];

export const steps = [
  { id: 'oddech', label: 'Ciało', title: 'Spokojny oddech', subtitle: 'Zwolnij na kilka oddechów', icon: 'leaf', color: 'peach' },
  { id: 'emocje', label: 'Emocje', title: 'Co dziś czuję?', subtitle: 'Zapisz to, co w Tobie jest', icon: 'heart', color: 'rose' },
  { id: 'afirmacja', label: 'Umysł', title: 'Afirmacja dla Ciebie', subtitle: 'Odkryj słowa na dziś', icon: 'spark', color: 'sage' },
  { id: 'intencja', label: 'Duch', title: 'Intencja na ten dzień', subtitle: 'Wybierz kierunek dla siebie', icon: 'moon', color: 'lavender' },
];

export const sampleCards = [
  { id: 1, kind: 'affirmation', tag: 'Spokój', body: 'Mogę zwolnić i nadal iść naprzód.' },
  { id: 2, kind: 'affirmation', tag: 'Łagodność', body: 'Jestem wystarczająca dokładnie taka, jaka jestem.' },
  { id: 3, kind: 'affirmation', tag: 'Odwaga', body: 'Mam prawo zabrać głos, nawet gdy głos mi drży.' },
  { id: 4, kind: 'affirmation', tag: 'Odpoczynek', body: 'Odpoczynek jest częścią mojego dnia. Nie muszę na niego zasługiwać.' },
  { id: 5, kind: 'affirmation', tag: 'Bliskość', body: 'Mogę być dla siebie osobą, do której chcę wracać.' },
  { id: 6, kind: 'affirmation', tag: 'Zaufanie', body: 'Wystarczy jeden mały krok w moim tempie.' },
  { id: 7, kind: 'intention', tag: 'Spokój', body: 'Dziś zrobię jedną rzecz spokojniej niż zwykle.' },
  { id: 8, kind: 'intention', tag: 'Łagodność', body: 'Dziś odezwę się do siebie tak, jak odezwałabym się do przyjaciółki.' },
  { id: 9, kind: 'intention', tag: 'Odwaga', body: 'Dziś zrobię trochę miejsca na to, czego naprawdę chcę.' },
  { id: 10, kind: 'intention', tag: 'Odpoczynek', body: 'Dziś znajdę chwilę ciszy między jedną rzeczą a drugą.' },
  { id: 11, kind: 'intention', tag: 'Wdzięczność', body: 'Dziś zauważę jedną zwyczajną rzecz, która mi służy.' },
  { id: 12, kind: 'intention', tag: 'Uważność', body: 'Dziś choć przez chwilę będę robić tylko jedną rzecz.' },
];

const paths = {
  happy: '<circle cx="12" cy="12" r="9"/><path d="M8 14c2 3 6 3 8 0M8 9h.01M16 9h.01"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 13c2 3 6 3 8 0M8 9l1-1 1 1m4 0 1-1 1 1"/>',
  tired: '<circle cx="12" cy="12" r="9"/><path d="M9 16c2-2 4-2 6 0M7 9l3 1m4 0 3-1"/>',
  cloud: '<circle cx="12" cy="12" r="9"/><path d="M7 10l2-1 2 1m2 0 2-1 2 1m-8 5h6"/>',
  leaf: '<path d="M11 21c0-6 1-11 7-16m-6 10c-5 0-8-2-8-6 4 0 7 2 8 6Zm0 0c5 0 8-3 8-8-4 0-7 3-8 8ZM8 21h8"/>',
  heart: '<path d="M20.8 5.7a4.7 4.7 0 0 0-6.7 0L12 7.8 9.9 5.7a4.7 4.7 0 1 0-6.7 6.7l2.1 2.1 6.7 6.3 6.7-6.3 2.1-2.1a4.7 4.7 0 0 0 0-6.7Z"/>',
  spark: '<path d="M12 2c0 6-4 10-10 10 6 0 10 4 10 10 0-6 4-10 10-10-6 0-10-4-10-10Z"/>',
  moon: '<path d="M20.6 15.4A9 9 0 0 1 8.6 3.4a9 9 0 1 0 12 12Z"/><path d="M17 3v5m-2.5-2.5h5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  book: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v18m3-13h5m-5 4h5"/>',
  bag: '<path d="M5 8h14l1.5 12h-17L5 8Zm4 2V6a3 3 0 1 1 6 0v4"/>',
  cards: '<rect x="7" y="3" width="13" height="16" rx="2"/><path d="M4 7v12a3 3 0 0 0 3 3h9m-3-14v6m-3-3h6"/>',
  account: '<circle cx="12" cy="8" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  play: '<path d="m8 5 12 7-12 7V5Z"/>',
  pause: '<path d="M9 5v14m6-14v14"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
};

export function icon(name, size = 22) {
  return '<svg aria-hidden="true" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round">' + paths[name] + '</svg>';
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { icon, moods, needs, steps } from '../lib/content';
import { cloudEnabled, dateKey, drawCard, initStore, loadDay, saveDay, sendCode, signOut, verifyCode } from '../lib/store';
import JournalCalendar from './journal-calendar';

const pages = ['dzis', 'plan', 'oddech', 'emocje', 'afirmacja', 'intencja', 'przestrzen', 'podsumowanie', 'dziennik', 'sklep'];
const journalPrompts = ['Co dziś dało mi ulgę?', 'Czego teraz potrzebuję?', 'Co mnie dziś przytłacza?'];
const tabs = [['dzis', 'sun', 'Dziś'], ['plan', 'leaf', 'Praktyki'], ['dziennik', 'book', 'Dziennik'], ['sklep', 'bag', 'Sklep']];
const fallbackDay = { energy: 50, mood: '', need: '', reflection: '', evening: '', completed: false };

function Icon({ name, size }) {
  return <span className="icon" dangerouslySetInnerHTML={{ __html: icon(name, size) }} />;
}

function Navigation({ activeTab, placement }) {
  return <nav className={'tabs tabs--' + placement} aria-label="Nawigacja">
    {tabs.map(([id, glyph, label]) => <a key={id} href={'#' + id} aria-current={activeTab === id ? 'page' : undefined}>
      <Icon name={glyph} size={19} />{label}
    </a>)}
  </nav>;
}

function dateLabel(key, options = { day: 'numeric', month: 'long' }) {
  return new Intl.DateTimeFormat('pl-PL', options).format(new Date(key + 'T12:00:00'));
}

function planFor(record) {
  const rest = record.energy <= 35 || record.need === 'Odpoczynku' || record.mood === 'overwhelmed';
  const question = record.need === 'Pewności siebie' ? 'Co dziś zrobiłam mimo wątpliwości?'
    : rest ? 'Co mogę dziś sobie odpuścić?' : 'Co jest teraz we mnie obecne?';
  const minutes = rest ? [1, 2, 1, 1] : [3, 4, 2, 2];
  return { rest, question, steps: steps.map((step, index) => ({ ...step, minutes: minutes[index] })) };
}

function Cta({ children, onClick, disabled, secondary = false, arrow = true, type = 'button' }) {
  return <button className={secondary ? 'button secondary' : 'button'} type={type} onClick={onClick} disabled={disabled}>
    {children}{arrow && <Icon name="arrow" size={18} />}
  </button>;
}

function Heading({ label, title, description, children }) {
  return <header className="screen-heading">
    {label && <p className="eyebrow">{label}</p>}
    <h1>{title}</h1>
    {description && <p className="intro">{description}</p>}
    {children}
  </header>;
}

function SectionBar({ label, back, step }) {
  return <div className="section-top">
    <button type="button" className="icon-button back" onClick={back} aria-label="Wróć"><Icon name="back" size={19} /></button>
    <span>{label}</span>{step && <span className="step-count">{step} / 4</span>}
    {step && <div className="progress" role="progressbar" aria-label="Krok praktyki" aria-valuemin={0} aria-valuemax={4} aria-valuenow={step}><i style={{ width: step * 25 + '%' }} /></div>}
  </div>;
}

function Breath({ minutes }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const duration = minutes * 60;
  const done = elapsed >= duration;
  const active = running && !done;
  useEffect(() => {
    if (!active) return;
    let previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const delta = (now - previous) / 1000;
      previous = now;
      setElapsed(value => Math.min(duration, value + delta));
    }, 60);
    return () => clearInterval(timer);
  }, [duration, active]);

  const cycle = elapsed % 10;
  const inhale = cycle < 4;
  const cue = done ? 'Gotowe' : elapsed === 0 ? 'Gotowa?' : inhale ? 'Wdech' : 'Wydech';
  const count = done ? '✓' : Math.ceil(inhale ? 4 - cycle : 10 - cycle);
  const progress = inhale ? cycle / 4 : 1 - (cycle - 4) / 6;
  function toggle() {
    if (done) { setElapsed(0); setRunning(true); }
    else setRunning(value => !value);
  }
  return <div className="breath-practice">
    <div className="breath-orbit" style={{ '--breath': progress }}>
      <div className="breath-halo" />
      <div className="breath-core"><span aria-live="polite">{cue}</span><strong>{count}</strong></div>
    </div>
    <button type="button" className="round-control" onClick={toggle} aria-label={running && !done ? 'Wstrzymaj oddech' : 'Rozpocznij oddech'}>
      <Icon name={running && !done ? 'pause' : 'play'} size={22} />
    </button>
    <p className="timer-note">{Math.ceil(Math.max(0, duration - elapsed) / 60)} min do końca</p>
  </div>;
}

function Shop() {
  return <>
    <Heading label="NAMASTE ALMA · SKLEP" title="Małe rzeczy, które zostają." description="Zabierz chwilę uważności ze sobą do codzienności." />
    <article className="product">
      <figure className="product-figure">
        <img className="product-art" src="/karta-wdziecznosci.webp" width="960" height="1200"
          alt="Karta Namaste Alma. Dziś wybieram wdzięczność i odnajduję radość w małych chwilach." />
        <figcaption>Wizualizacja talii</figcaption>
      </figure>
      <div className="product-copy"><span className="eyebrow">TALIA FIZYCZNA</span><h2>Karty afirmacyjne</h2><p>Sięgnij po jedną kartę, kiedy potrzebujesz chwili dla siebie. Pierwsza talia Namaste Alma jest w przygotowaniu.</p>
        <button className="button coming-soon" type="button" disabled>Wkrótce</button>
      </div>
    </article>
  </>;
}

export default function Ritual() {
  const [screen, setScreen] = useState('dzis');
  const [day, setDay] = useState('');
  const [record, setRecord] = useState(fallbackDay);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [prompt, setPrompt] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [authError, setAuthError] = useState('');
  const dialog = useRef(null);
  const main = useRef(null);
  const content = useRef(null);
  const lock = useRef(false);

  useEffect(() => {
    const key = dateKey();
    setDay(key);
    function readHash() {
      const value = window.location.hash.slice(1);
      setScreen(pages.includes(value) ? value : 'dzis');
      setError('');
    }
    readHash();
    window.addEventListener('hashchange', readHash);
    let alive = true;
    async function start() {
      try {
        const sessionUser = await initStore();
        const saved = !cloudEnabled || sessionUser ? await loadDay(sessionUser, key) : {};
        if (alive) {
          setUser(sessionUser);
          setRecord({ ...fallbackDay, ...saved });
        }
      } catch {
        if (alive) setError('Nie udało się wczytać danych. Odśwież stronę i spróbuj ponownie.');
      } finally {
        if (alive) setReady(true);
      }
    }
    start();
    return () => { alive = false; window.removeEventListener('hashchange', readHash); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.scrollTo(0, 0);
    content.current?.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [screen, ready]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  function go(next) {
    setError('');
    if (screen !== next) {
      setScreen(next);
      window.location.hash = next;
    }
  }

  function edit(patch) {
    setRecord(previous => ({ ...previous, ...patch }));
  }

  async function task(action, message = 'Nie udało się zapisać. Spróbuj ponownie.') {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try { await action(); }
    catch { setError(message); }
    finally { lock.current = false; setBusy(false); }
  }

  function save(patch, next) {
    if (cloudEnabled && !user) { dialog.current?.showModal(); return; }
    return task(async () => {
      await saveDay(user, day, patch);
      edit(patch);
      if (next) go(next);
    });
  }

  function draw(kind) {
    if (cloudEnabled && !user) { dialog.current?.showModal(); return; }
    return task(async () => {
      const card = await drawCard(user, day, kind, record[kind]);
      if (!card) throw new Error('Deck is empty');
      edit({ [kind]: card });
    }, 'Nie udało się wylosować karty. Spróbuj ponownie.');
  }

  async function authenticate(event) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setAuthError('');
    try {
      if (!sent) {
        await sendCode(email.trim());
        setSent(true);
      } else {
        const sessionUser = await verifyCode(email.trim(), code.trim());
        const saved = await loadDay(sessionUser, day);
        setUser(sessionUser);
        setRecord({ ...fallbackDay, ...saved });
        setSent(false);
        setCode('');
        dialog.current?.close();
      }
    } catch {
      setAuthError(sent ? 'Nie udało się zalogować. Sprawdź kod i spróbuj ponownie.' : 'Nie udało się wysłać kodu. Sprawdź adres i spróbuj ponownie.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const plan = planFor(record);
  const stepIndex = steps.findIndex(step => step.id === screen);
  const step = plan.steps[stepIndex];
  const date = day ? dateLabel(day, { weekday: 'long', day: 'numeric', month: 'long' }) : '';
  const canOpen = !cloudEnabled || user || screen === 'sklep';
  const activeTab = ['dziennik', 'sklep'].includes(screen) ? screen : screen === 'dzis' ? 'dzis' : 'plan';

  function renderScreen() {
    if (!ready) return <Heading label="NAMASTE ALMA" title="Chwila dla siebie." description="Przygotowujemy Twoją przestrzeń…" />;
    if (!canOpen) return <>
      <Heading label="NAMASTE ALMA" title="Chwila dla siebie." description="Zaloguj się, by rozpocząć dzisiejszą praktykę i wracać do własnych wpisów." />
      <Cta onClick={() => dialog.current?.showModal()}>Zaloguj się e-mailem</Cta>
    </>;
    if (screen === 'dzis') return <>
      <div className="day-hero">
        <Heading label={'TWÓJ RYTUAŁ · ' + date} title={<>Zacznijmy od chwili <em>dla Ciebie.</em></>} description="Zatrzymaj się na moment. Sprawdź, czego dziś potrzebujesz." />
      </div>
      <form className="checkin" onSubmit={event => {
        event.preventDefault();
        if (!record.mood) { setError('Zaznacz, jak się dzisiaj czujesz.'); return; }
        save({ mood: record.mood, energy: record.energy, need: record.need || '' }, 'plan');
      }}>
        <fieldset><legend>Jak się dzisiaj czujesz?</legend><div className="moods">
          {moods.map(mood => <label key={mood.id} className="mood" data-mood={mood.id}>
            <input type="radio" name="mood" value={mood.id} checked={record.mood === mood.id} onChange={() => { edit({ mood: mood.id }); setError(''); }} />
            <span className="mood-face"><Icon name={mood.icon} size={24} /></span><span>{mood.label}</span>
          </label>)}
        </div></fieldset>
        <div className="energy"><label htmlFor="energy">Poziom energii <output>{record.energy}%</output></label><input id="energy" type="range" min="0" max="100" step="5" value={record.energy} onChange={event => edit({ energy: Number(event.target.value) })} style={{ '--energy': record.energy + '%' }} /></div>
        <fieldset><legend>Czego dziś najbardziej potrzebujesz?</legend><div className="pills">
          {needs.map(need => <button key={need} type="button" aria-pressed={record.need === need} onClick={() => edit({ need: record.need === need ? '' : need })}>{need}</button>)}
        </div></fieldset>
        <Cta disabled={busy} type="submit">Zobacz mój plan na dziś</Cta>
      </form>
      {record.affirmation && <button className="text-button return-space" type="button" onClick={() => go('przestrzen')}>Wróć do swojej karty i intencji</button>}
      <aside className="quote"><Icon name="spark" size={17} /><p>Nie musisz robić wszystkiego.<br />Wystarczy mały krok.</p></aside>
    </>;
    if (screen === 'plan') return <>
      <SectionBar label="Twój plan na dziś" back={() => go('dzis')} />
      <Heading label="CZTERY MAŁE KROKI" title="Twój plan na dziś" description={plan.rest ? 'Dzisiaj krótsza ścieżka. Daj sobie chwilę odpoczynku.' : 'Znajdź moment na ciało, emocje, umysł i to, co dla Ciebie ważne.'}>
        <div className="duration"><Icon name="clock" size={16} /> Około {plan.steps.reduce((sum, part) => sum + part.minutes, 0)} min <button type="button" onClick={() => go('dzis')}>Zmień</button></div>
      </Heading>
      <div className="plan-list">
        {plan.steps.map(part => <button type="button" className={'plan-row ' + part.color} key={part.id} onClick={() => go(part.id)}>
          <span className="plan-icon"><Icon name={part.icon} size={25} /></span>
          <span><small>{part.label} · {part.minutes} min</small><strong>{part.title}</strong><span>{part.subtitle}</span></span>
          <Icon name="chevron" size={18} />
        </button>)}
      </div>
      <Cta onClick={() => go('oddech')}>Rozpocznij praktyki</Cta>
    </>;
    if (step) {
      const next = steps[stepIndex + 1]?.id ?? 'przestrzen';
      const bar = <SectionBar label={step.label} step={stepIndex + 1} back={() => go(steps[stepIndex - 1]?.id ?? 'plan')} />;
      if (screen === 'oddech') return <>
        {bar}<Heading label="PRAKTYKA DLA CIAŁA" title={step.title} description="Usiądź wygodnie. Oddychaj w swoim rytmie i pozwól sobie zwolnić." />
        <Breath key={day} minutes={step.minutes} />
        <aside className="note"><Icon name="leaf" /><p>Możesz wrócić do naturalnego oddechu w każdej chwili.</p></aside>
        <Cta onClick={() => go(next)}>Zakończ i przejdź dalej</Cta>
      </>;
      if (screen === 'emocje') return <>
        {bar}<Heading label="PRAKTYKA DLA EMOCJI" title={step.title} description="Zatrzymaj się na chwilę. Daj sobie przestrzeń na to, co jest w Tobie." />
        <label className="paper rose">
          <span>{dateLabel(day)}</span><strong>Dziś czuję…</strong>
          <textarea value={record.reflection ?? ''} maxLength={4000} rows={5} onChange={event => edit({ reflection: event.target.value })} placeholder={prompt || plan.question} />
        </label>
        <p className="field-label">Pytania, które mogą pomóc</p>
        <div className="pills prompts">{journalPrompts.map(item => <button type="button" key={item} aria-pressed={item === prompt} onClick={() => setPrompt(item)}>{item}</button>)}</div>
        <Cta disabled={busy} onClick={() => save({ reflection: record.reflection ?? '' }, next)}>Zapisz i idź dalej</Cta>
      </>;
      const kind = screen === 'afirmacja' ? 'affirmation' : 'intention';
      const card = record[kind];
      return <>
        {bar}<Heading label={kind === 'affirmation' ? 'PRAKTYKA DLA UMYSŁU' : 'PRAKTYKA DLA DUCHA'} title={step.title}
          description={kind === 'affirmation' ? 'Odkryj jedną myśl, do której możesz wracać przez cały dzień.' : 'Wylosuj mały kierunek na dziś. Sprawdź, jak Ci z nim jest.'} />
        <div className={'draw-card ' + step.color} data-revealed={card ? true : undefined} aria-live="polite">
          <Icon name={step.icon} size={32} />
          <p className="eyebrow">{card?.tag ?? (kind === 'affirmation' ? 'KARTA AFIRMACJI' : 'KARTA INTENCJI')}</p>
          <p className="draw-text">{card?.body ?? 'Twoja karta czeka.'}</p>
          {!card && <Cta secondary disabled={busy} arrow={false} onClick={() => draw(kind)}>{kind === 'affirmation' ? 'Wylosuj afirmację' : 'Wylosuj intencję'}</Cta>}
        </div>
        <Cta disabled={!card || busy} onClick={() => go(next)}>{kind === 'affirmation' ? 'Zabieram ją na dziś' : 'Zakończ praktyki'}</Cta>
      </>;
    }
    if (screen === 'przestrzen') return <>
      <SectionBar label="Twoja przestrzeń" back={() => go('intencja')} />
      <section className="space-hero">
        <p className="eyebrow">TWOJA PRZESTRZEŃ NA DZIŚ</p>
        <h1>Nie musisz być idealna. Wystarczy, że jesteś.</h1>
        <p>Wróć tu, kiedy zechcesz przypomnieć sobie swoją kartę albo złapać oddech.</p>
      </section>
      <div className="space-cards">
        {record.affirmation && <button type="button" className="note sage" onClick={() => go('afirmacja')}><Icon name="spark" /><span><strong>Twoja afirmacja</strong><span>{record.affirmation.body}</span></span><Icon name="chevron" size={17} /></button>}
        {record.intention && <button type="button" className="note lavender" onClick={() => go('intencja')}><Icon name="moon" /><span><strong>Twoja intencja</strong><span>{record.intention.body}</span></span><Icon name="chevron" size={17} /></button>}
        {!record.affirmation && <button type="button" className="note sage" onClick={() => go('afirmacja')}><Icon name="cards" />Odkryj kartę na dziś<Icon name="chevron" size={17} /></button>}
      </div>
      <Cta onClick={() => go('podsumowanie')}>Wieczorne podsumowanie</Cta>
    </>;
    if (screen === 'podsumowanie') return <>
      <SectionBar label="Podsumowanie" back={() => go('przestrzen')} />
      <Heading label="WIECZORNA CHWILA" title="Jak minął Twój dzień?" description={date} />
      <div className="recap">
        <p className="field-label">Dzisiaj znalazłaś chwilę dla siebie</p>
        {moods.find(mood => mood.id === record.mood) && <p><Icon name="check" size={16} /> Poranny nastrój: {moods.find(mood => mood.id === record.mood).label}</p>}
        {record.need && <p><Icon name="check" size={16} /> Potrzebowałaś dziś: {record.need.toLowerCase()}</p>}
        {record.reflection?.trim() && <p><Icon name="check" size={16} /> Zapisałaś swoją refleksję</p>}
        {record.intention && <p><Icon name="moon" size={16} /> {record.intention.body}</p>}
      </div>
      <label className="paper peach"><strong>Co było dziś dla Ciebie najważniejsze?</strong>
        <textarea value={record.evening ?? ''} maxLength={4000} rows={4} onChange={event => edit({ evening: event.target.value, completed: false })} placeholder="Chcę zapamiętać…" />
      </label>
      <Cta disabled={busy} arrow={false} onClick={async () => {
        await task(async () => {
          await saveDay(user, day, { evening: record.evening ?? '', completed: true });
          edit({ completed: true });
          setNotice('Wieczór zapisany w dzienniku.');
        });
      }}>{record.completed ? 'Zapisano ✓' : 'Zapisz i dobranoc'}</Cta>
      <p className="save-status" role="status">{notice}</p>
    </>;
    if (screen === 'dziennik') return <>
      <Heading label="MOJA PRZESTRZEŃ" title="Twój dziennik" description="Wybierz dzień, by wrócić do tego, co wtedy zapisałaś." />
      <JournalCalendar today={day} user={user} />
    </>;
    return <Shop />;
  }

  return <div className="site">
    <div className="opening" aria-hidden="true">
      <div className="opening-brand">
        <img src="/namaste-alma.png" width="92" height="92" alt="" />
        <p>namaste alma</p><span>CHWILA DLA SIEBIE</span>
      </div>
    </div>
    <header className="site-top">
      <div className="site-top-inner">
        <a className="brand" href="#dzis"><img src="/namaste-alma.png" width="40" height="40" alt="" /><span>namaste alma<small>CHWILA DLA SIEBIE</small></span></a>
        <Navigation activeTab={activeTab} placement="desktop" />
        <button type="button" className="icon-button account" aria-label="Konto i instalacja" onClick={() => dialog.current?.showModal()}><Icon name="account" size={21} /></button>
      </div>
    </header>
    <div className="site-content" ref={content}>
      <main className={'view ' + screen} ref={main} tabIndex={-1} aria-busy={!ready} data-ready={ready && canOpen ? 'true' : undefined}>
        {renderScreen()}
        {error && <p className="error" role="alert">{error}</p>}
      </main>
    </div>
    <Navigation activeTab={activeTab} placement="mobile" />
    <dialog ref={dialog} className="settings" aria-labelledby="settings-title">
      <div className="settings-top"><h2 id="settings-title">Konto i instalacja</h2><button type="button" className="icon-button" aria-label="Zamknij" onClick={() => dialog.current?.close()}><Icon name="close" size={20} /></button></div>
      {cloudEnabled && !user && <form onSubmit={authenticate}>
        <label>Adres e-mail<input type="email" required value={email} readOnly={sent} onChange={event => setEmail(event.target.value)} /></label>
        {sent && <label>Kod z wiadomości<input required value={code} onChange={event => setCode(event.target.value)} inputMode="numeric" autoComplete="one-time-code" /></label>}
        <Cta disabled={busy || !ready} type="submit">{sent ? 'Zaloguj się' : 'Wyślij kod'}</Cta>
        {sent && <button type="button" className="text-button" onClick={() => { setSent(false); setCode(''); setAuthError(''); }}>Zmień adres lub wyślij ponownie</button>}
        {authError && <p className="error" role="alert">{authError}</p>}
      </form>}
      {user && <><p>{user.email}</p><Cta secondary arrow={false} disabled={busy} onClick={() => task(async () => {
        await signOut(); setUser(null); setRecord(fallbackDay); go('dzis'); dialog.current?.close();
      })}>Wyloguj się</Cta></>}
      {!cloudEnabled && <p>Tryb demo. Wpisy zapisują się w tej przeglądarce.</p>}
      <div className="install"><strong>Dodaj ikonę na iPhonie</strong><p>Otwórz stronę w Safari i wybierz „Udostępnij”, „Dodaj do ekranu początkowego”, a potem „Otwórz jako aplikację internetową”.</p></div>
    </dialog>
  </div>;
}

import { useEffect, useState } from 'react';
import { moods } from '../lib/content';
import { dateKey, loadJournal } from '../lib/store';

const weekdays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
const monthFormat = new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' });
const dayFormat = new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function dayDetails(record) {
  const mood = moods.find(item => item.id === record.mood);
  return [
    ['Samopoczucie', mood?.label],
    ['Poziom energii', mood && record.energy != null ? record.energy + '%' : null],
    ['Czego potrzebowałaś', record.need],
    ['Refleksja', record.reflection?.trim()],
    ['Afirmacja', record.affirmation?.body],
    ['Intencja', record.intention?.body],
    ['Wieczorne podsumowanie', record.evening?.trim() || (record.completed ? 'Dzień podsumowany.' : null)],
  ];
}

export default function JournalCalendar({ today, user }) {
  const currentMonth = today.slice(0, 7) + '-01';
  const [month, setMonth] = useState(currentMonth);
  const [selected, setSelected] = useState(today);
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const start = new Date(month + 'T12:00:00');
  const year = start.getFullYear();
  const monthIndex = start.getMonth();
  const nextMonth = dateKey(new Date(year, monthIndex + 1, 1));
  const length = new Date(year, monthIndex + 1, 0).getDate();
  const offset = (start.getDay() + 6) % 7;

  useEffect(() => {
    let active = true;
    loadJournal(user, month, nextMonth).then(records => {
      if (!active) return;
      const entries = new Map();
      for (const record of records) {
        const details = dayDetails(record).filter(([, value]) => value);
        if (details.length) entries.set(record.day, details);
      }
      setResult({ month, entries });
    }).catch(() => {
      if (active) setResult({ month, failed: true });
    });
    return () => { active = false; };
  }, [user, month, nextMonth, attempt]);

  function moveMonth(offset) {
    const target = dateKey(new Date(year, monthIndex + offset, 1));
    setResult(null);
    setMonth(target);
    setSelected(target === currentMonth ? today : target);
  }

  const loaded = result?.month === month ? result : null;
  const selectedLabel = dayFormat.format(new Date(selected + 'T12:00:00'));
  const details = loaded?.entries?.get(selected) ?? [];
  return <>
    <section className="calendar" aria-labelledby="calendar-month">
      <header className="calendar-header">
        <button type="button" className="icon-button calendar-previous" aria-label="Poprzedni miesiąc" onClick={() => moveMonth(-1)}>‹</button>
        <h2 id="calendar-month" aria-live="polite">{monthFormat.format(start)}</h2>
        <button type="button" className="icon-button calendar-next" aria-label="Następny miesiąc" onClick={() => moveMonth(1)} disabled={month >= currentMonth}>›</button>
      </header>
      <div className="calendar-days">
        {weekdays.map(label => <span className="calendar-weekday" key={label}>{label}</span>)}
        {Array.from({ length: offset }, (_, index) => <span key={'empty-' + index} aria-hidden="true" />)}
        {Array.from({ length }, (_, index) => {
          const date = new Date(year, monthIndex, index + 1, 12);
          const key = dateKey(date);
          const saved = loaded?.entries?.has(key);
          return <button type="button" key={key}
            className="calendar-day"
            data-saved={saved || undefined}
            aria-label={dayFormat.format(date) + (saved ? ', zapisany dzień' : '')}
            aria-current={key === today ? 'date' : undefined}
            aria-pressed={key === selected}
            onClick={() => setSelected(key)}>{index + 1}</button>;
        })}
      </div>
      <p className="calendar-key"><i aria-hidden="true" /> Zapisany dzień</p>
    </section>
    <section className="calendar-entry" aria-labelledby="calendar-day-title" aria-busy={!loaded}>
      <h2 id="calendar-day-title">{selectedLabel}</h2>
      {!loaded && <p role="status">Wczytujemy wpisy…</p>}
      {loaded?.failed && <>
        <p className="error" role="alert">Nie udało się wczytać wpisów.</p>
        <button className="text-button" type="button" onClick={() => { setResult(null); setAttempt(value => value + 1); }}>Spróbuj ponownie</button>
      </>}
      {loaded?.entries && (details.length ? <dl>
        {details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl> : <p>Brak zapisanych informacji z tego dnia.</p>)}
    </section>
  </>;
}

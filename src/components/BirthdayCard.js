import React, { useEffect, useState } from 'react';
import { getTodaysBirthdays } from '../services/birthdayService';
import '../styles/tailwind.css';

const ROTATE_INTERVAL_MS = 10000;
// Re-check periodically so a dashboard left open overnight switches to the new day's birthdays.
const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

const initialsOf = (name) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// profilePhoto is a free-form string; only render it when it's something an <img> can load.
const isLoadablePhoto = (photo) => typeof photo === 'string' && /^(https?:|data:image\/|\/)/.test(photo.trim());

function BirthdayAvatar({ person }) {
  const [failed, setFailed] = useState(false);
  if (isLoadablePhoto(person.profilePhoto) && !failed) {
    return (
      <img
        src={person.profilePhoto}
        alt={person.name}
        onError={() => setFailed(true)}
        className="size-24 rounded-full border-4 border-white object-cover shadow-md"
      />
    );
  }
  return (
    <div className="flex size-24 items-center justify-center rounded-full border-4 border-white bg-employee text-2xl font-semibold text-employee-foreground shadow-md">
      {initialsOf(person.name)}
    </div>
  );
}

// "Happy Birthday" card for the employee dashboard. Shows every colleague (same company) whose
// birthday is today, rotating to the next one every 10 seconds. Renders nothing on days with no
// birthdays.
export default function BirthdayCard() {
  const [birthdays, setBirthdays] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const list = await getTodaysBirthdays();
        if (!cancelled) {
          setBirthdays(list);
          setIndex((current) => (current < list.length ? current : 0));
        }
      } catch (err) {
        // Card is decorative - keep whatever was showing on failure.
      }
    };
    load();
    const refreshId = setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(refreshId);
    };
  }, []);

  useEffect(() => {
    if (birthdays.length < 2) return undefined;
    const rotateId = setInterval(() => {
      setIndex((current) => (current + 1) % birthdays.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(rotateId);
  }, [birthdays.length]);

  if (birthdays.length === 0) return null;

  const person = birthdays[index] || birthdays[0];
  const subtitle = [person.designation, person.department].filter(Boolean);

  return (
    <section
      aria-live="polite"
      className="relative overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-[#fff7ed] via-[#fdf2f8] to-[#eef2ff] p-6 text-center shadow-sm dark:from-[#3b2a1a] dark:via-[#3a1f30] dark:to-[#1e2140]"
    >
      <div key={person.empId} className="flex animate-[birthday-fade_600ms_ease-out] flex-col items-center gap-3">
        <h2 className="text-lg font-bold tracking-wide text-foreground">🎉 HAPPY BIRTHDAY! 🎂</h2>

        <BirthdayAvatar person={person} />

        <div>
          <div className="text-lg font-semibold text-foreground">{person.name}</div>
          {subtitle.map((line) => (
            <div key={line} className="text-sm text-muted-foreground">
              {line}
            </div>
          ))}
        </div>

        <p className="max-w-md text-sm italic text-foreground/80">
          "Wishing you happiness, success and great achievements in the year ahead!"
        </p>

        <div className="text-sm font-bold tracking-wide text-foreground">🎈 HAVE A GREAT DAY! 🎈</div>

        {person.companyName && <div className="text-sm text-muted-foreground">— Team {person.companyName}</div>}
      </div>

      {birthdays.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {birthdays.map((b, i) => (
            <button
              key={b.empId}
              type="button"
              aria-label={`Show ${b.name}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${i === index ? 'w-5 bg-employee' : 'w-2 bg-foreground/20'}`}
            />
          ))}
        </div>
      )}

      <style>{'@keyframes birthday-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }'}</style>
    </section>
  );
}

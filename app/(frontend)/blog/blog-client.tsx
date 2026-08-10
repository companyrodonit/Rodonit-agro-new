'use client';

import { useEffect, useState } from 'react';

/* Клієнтські шматки блогу. Все інше в блозі — серверне, щоб текст статей
   потрапляв у HTML і його бачили пошукові боти без виконання JS. */

/** Смужка прогресу читання під хедером. */
export function ReadProgressBar() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      data-testid="read-progress"
      className="fixed inset-x-0 top-0 z-[300] h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-[var(--color-accent)] transition-[width] duration-150 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/**
 * Зміст статті зі скрол-спаєм. Підзаголовки приходять із сервера вже
 * порахованими — тут лише підсвічування активного.
 */
export function TableOfContents({ items }: { items: { id: string; text: string }[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '');

  useEffect(() => {
    if (!items.length) return;
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!headings.length) return;

    const onScroll = () => {
      // Активний — останній підзаголовок, що перетнув лінію 140px від верху:
      // IntersectionObserver тут дає стрибки на довгих розділах.
      let current = headings[0].id;
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= 140) current = h.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="Зміст статті" data-testid="toc" className="hidden lg:block">
      <p className="eyebrow text-[rgba(14,15,12,0.4)]">Зміст</p>
      <ul className="mt-5 space-y-1 border-l border-[rgba(0,0,0,0.1)]">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              className={`-ml-px block border-l-2 py-2 pl-4 text-[14px] leading-[1.45] transition-colors ${
                active === i.id
                  ? 'border-[var(--color-dark)] font-[700] text-[var(--color-dark)]'
                  : 'border-transparent text-[rgba(14,15,12,0.5)] hover:text-[var(--color-text)]'
              }`}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Поділитись. Копіювання посилання — без зовнішніх залежностей. */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const share = (href: string) => () => window.open(href, '_blank', 'noopener,noreferrer,width=640,height=520');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Буфер обміну недоступний (http, старий браузер) — тихо ігноруємо,
      // посилання завжди можна скопіювати з адресного рядка.
    }
  };

  const base =
    'rounded-full border border-[rgba(0,0,0,0.12)] px-4 py-2 text-[13px] font-[700] text-[var(--color-dark)] transition-colors hover:bg-[var(--color-surface)]';

  return (
    <div data-testid="share" className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[13px] text-[rgba(14,15,12,0.45)]">Поділитись:</span>
      <button
        type="button"
        onClick={share(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`)}
        className={base}
      >
        Telegram
      </button>
      <button
        type="button"
        onClick={share(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}
        className={base}
      >
        Facebook
      </button>
      <button
        type="button"
        onClick={share(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`)}
        className={base}
      >
        WhatsApp
      </button>
      <button type="button" onClick={copy} className={base}>
        {copied ? 'Скопійовано ✓' : 'Копіювати'}
      </button>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

export type Milestone = { marker: string; title: string; text: string };

/**
 * Таймлайн за специфікацією стайлгайду (§13): центральна лінія 1px
 * rgba(0,0,0,0.10), чипи-маркери на --color-surface з радіусом full, записи
 * чергують сторони, вузол 10px --color-dark.
 *
 * Анімація — власна, без бібліотек: стайлгайд (§14) прямо забороняє тягнути
 * GSAP чи Framer Motion під це. Лінія заповнюється за прогресом скролу, вузол
 * загорається лаймом, коли лінія його проходить.
 */
export function Timeline({ items }: { items: Milestone[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Повага до prefers-reduced-motion: одразу показуємо лінію повністю,
    // не привʼязуючи її до скролу.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(1);
      return;
    }

    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const anchor = window.innerHeight * 0.72;
      const p = (anchor - r.top) / r.height;
      setProgress(Math.max(0, Math.min(1, p)));
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
    <div ref={ref} data-testid="timeline" className="relative">
      {/* Рейка: на десктопі по центру, на мобільному притиснута ліворуч —
          чергувати сторони на 390px немає куди. */}
      <div className="absolute bottom-0 left-[11px] top-0 w-px bg-[rgba(0,0,0,0.10)] lg:left-1/2" />
      <div
        aria-hidden="true"
        data-testid="timeline-line"
        className="absolute left-[11px] top-0 w-px origin-top bg-[var(--color-dark)] transition-[height] duration-150 ease-out lg:left-1/2"
        style={{ height: `${progress * 100}%` }}
      />

      <ol className="space-y-12 lg:space-y-0">
        {items.map((m, i) => {
          const passed = progress >= (i + 0.5) / items.length;
          const left = i % 2 === 0;
          return (
            <li
              key={m.marker + m.title}
              data-testid={`milestone-${i}`}
              className="relative pl-10 lg:grid lg:grid-cols-2 lg:gap-16 lg:pb-16 lg:pl-0"
            >
              <span
                data-passed={passed}
                className={`absolute left-[7px] top-[7px] h-[10px] w-[10px] rounded-full transition-colors duration-300 lg:left-1/2 lg:-translate-x-1/2 ${
                  passed ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-dark)]'
                }`}
              />

              <div
                className={`${
                  left ? 'lg:col-start-1 lg:pr-4 lg:text-right' : 'lg:col-start-2 lg:pl-4'
                }`}
              >
                {/* Стайлгайд каже «чипи на --color-surface», але секція
                    таймлайну сама на surface — чип зливався з фоном повністю.
                    Тому тут інверсія: чип на --color-bg із бордером. */}
                <span className="inline-block rounded-full border border-[rgba(0,0,0,0.08)] bg-[var(--color-bg)] px-4 py-1.5 text-[12px] font-[700] uppercase tracking-[0.04em] text-[var(--color-dark)]">
                  {m.marker}
                </span>
                <h3 className="mt-4 text-[22px] font-[500] leading-[1.25] text-[var(--color-dark)]">
                  {m.title}
                </h3>
                <p className="mt-3 text-[16px] leading-[1.7] text-[rgba(14,15,12,0.65)]">
                  {m.text}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import {
  distributorFilters,
  distributors,
  heroBackgrounds,
  nav,
  problems,
  products as SLIDER_PRODUCTS,
} from '@/lib/content';

/* ================================================================== ICONS */

export function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
export function Check({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}
export function Chevron({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
export function Close({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
export function Info({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}
export function Phone({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}
export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg className="spinner" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
export function Warning({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

/* ------------------------------------------- ІКОНКИ ПРОБЛЕМ (секція 5)

   По одній на кожен пункт у «З чим приходять аграрії». Мальовані в тій самій
   системі, що й решта: viewBox 24, stroke currentColor, товщина 2, круглі
   кінці, без заливки. Ключ лежить у lib/content.ts (problems[].icon), сама
   мапа — нижче: контент лишається чистими даними й переїде в CMS без JSX. */

function ProblemSvg({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* Плід із розколиною — вершинна гниль і розтріскування.
   Розкол Y-подібний, а не зигзагом: будь-яка ламана всередині кола читається
   блискавкою, хоч на дві коліна, хоч на чотири. Y — впізнаваний саме як
   тріщина й не збігається з жодною іншою іконкою набору. */
export function IconFruitCrack({ size = 26 }: { size?: number }) {
  return (
    <ProblemSvg size={size}>
      <circle cx="12" cy="14.2" r="7.2" />
      <path d="M12 7V4.4c1.7-1.2 3.3-.9 4.3-.2" />
      <path d="M9.2 9.4 12 12.6l2.8-3.2M12 12.6v5.5" />
    </ProblemSvg>
  );
}

/* Перекреслений щит — резистентність до фунгіцидів: захист більше не працює.
   Навмисно проста діагональ, а не друга ламана, щоб іконка не збігалася з
   попередньою: у списку вони стоять поруч. */
export function IconShieldBreak({ size = 26 }: { size?: number }) {
  return (
    <ProblemSvg size={size}>
      <path d="M12 2.8 19 5.6v5.9c0 4.1-2.8 7.4-7 8.7-4.2-1.3-7-4.6-7-8.7V5.6l7-2.8Z" />
      <path d="M7.4 7 16.6 16.2" />
    </ProblemSvg>
  );
}

/* Колос — дефіцит міді та цинку на зернових */
export function IconGrainEar({ size = 26 }: { size?: number }) {
  return (
    <ProblemSvg size={size}>
      <path d="M12 21v-9.5" />
      <path d="M12 11.5 8.2 8.8M12 11.5l3.8-2.7" />
      <path d="M12 15.5 8.2 12.8M12 15.5l3.8-2.7" />
      <path d="M12 7.5 9.4 5.2M12 7.5l2.6-2.3" />
    </ProblemSvg>
  );
}

/* Сонце над листком — стрес після гербіцидів і посухи.
   Листок замкнутою формою, а не двома дугами: дугами він читався морквиною. */
export function IconSunStress({ size = 26 }: { size?: number }) {
  return (
    <ProblemSvg size={size}>
      <circle cx="17.6" cy="6.4" r="2.8" />
      <path d="M17.6 1.8v1.2M22.2 6.4H21M20.9 3.1l-.8.8M20.9 9.7l-.8-.8" />
      <path d="M3.6 20.9c6.4-.7 10-4.3 10.7-10.7-6.4.7-10 4.3-10.7 10.7Z" />
      <path d="m3.6 20.9 5-5" />
    </ProblemSvg>
  );
}

/* Хмара з дощем — змив робочого розчину */
export function IconRainWash({ size = 26 }: { size?: number }) {
  return (
    <ProblemSvg size={size}>
      <path d="M7 14.5a3.7 3.7 0 0 1 .5-7.4 5.2 5.2 0 0 1 9.8 1.3 3.4 3.4 0 0 1-.3 6.1" />
      <path d="M8.5 17.5 7.4 20M12 17.5 10.9 20M15.5 17.5 14.4 20" />
    </ProblemSvg>
  );
}

/* Паросток із ґрунту — слабкий старт і низька схожість */
export function IconSeedSprout({ size = 26 }: { size?: number }) {
  return (
    <ProblemSvg size={size}>
      <path d="M4 20.5h16" />
      <path d="M12 20.5v-7.8" />
      <path d="M12 14.5c-3.4 0-5-1.9-5-4.8 3.4 0 5 1.9 5 4.8Z" />
      <path d="M12 12.8c3.1 0 4.6-1.8 4.6-4.5-3.1 0-4.6 1.8-4.6 4.5Z" />
    </ProblemSvg>
  );
}

/* ------------------------------------------ ІКОНКИ КАТЕГОРІЙ (секція 3)

   Раніше всі чотири картки носили однаковий Leaf — іконка нічого не
   повідомляла. Тепер по одній на категорію. Силуети навмисно різні:
   вертикаль зі стрілкою / листок із краплею / щит / крапля на поверхні —
   щоб розрізнялись боковим зором, не вчитуючись. */

/* Геометрія взята з Lucide — тієї самої родини, з якої вже намальовані
   ArrowRight, Check, Phone і Chevron у цьому файлі. Перший підхід я малював
   безьє від руки: криві виходили нерівні, а по три дрібні елементи в кутах
   полотна на реальних 20px перетворювались на зелену кашу.
   Тепер по одній домінантній формі на іконку: паросток / краплі / щит /
   листок — чотири різні силуети, які не сплутати боковим зором. */

/* Паросток — стимулятори росту */
export function IconGrowth({ size = 28 }: { size?: number }) {
  return (
    <ProblemSvg size={size}>
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </ProblemSvg>
  );
}

/* Краплі робочого розчину — мікродобрива */
export function IconNutrition({ size = 28 }: { size?: number }) {
  return (
    <ProblemSvg size={size}>
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
      <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
    </ProblemSvg>
  );
}

/* Щит — фунгіциди */
export function IconShieldLeaf({ size = 28 }: { size?: number }) {
  return (
    <ProblemSvg size={size}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </ProblemSvg>
  );
}

/* Листок — прилипачі: розчин тримається на рослині */
export function IconStick({ size = 28 }: { size?: number }) {
  return (
    <ProblemSvg size={size}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </ProblemSvg>
  );
}

const CATEGORY_ICONS = {
  growth: IconGrowth,
  nutrition: IconNutrition,
  'shield-leaf': IconShieldLeaf,
  stick: IconStick,
} as const;

export type CategoryIcon = keyof typeof CATEGORY_ICONS;

/* Той самий резолвер, що й для проблем: невідомий ключ нічого не малює
   замість того, щоб валити сторінку.
   Дефолт 28 має збігатися з дефолтом самих іконок — інакше він його тихо
   перебиває (саме через це іконки лишались 20px після збільшення кола). */
export function CategoryIconFor({ name, size = 28 }: { name?: string; size?: number }) {
  const Icon = CATEGORY_ICONS[name as CategoryIcon];
  return Icon ? <Icon size={size} /> : null;
}


const PROBLEM_ICONS = {
  'fruit-crack': IconFruitCrack,
  'shield-break': IconShieldBreak,
  'grain-ear': IconGrainEar,
  'sun-stress': IconSunStress,
  'rain-wash': IconRainWash,
  'seed-sprout': IconSeedSprout,
} as const;

export type ProblemIcon = keyof typeof PROBLEM_ICONS;

/* Резолвер ключ → компонент. Невідомий ключ (наприклад, після редагування
   контенту в CMS) не валить сторінку — просто нічого не малює. */
export function ProblemIconFor({ name, size = 26 }: { name?: string; size?: number }) {
  const Icon = PROBLEM_ICONS[name as ProblemIcon];
  return Icon ? <Icon size={size} /> : null;
}

/* ================================================================= REVEAL */

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3 | 4;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${delay ? `reveal-delay-${delay}` : ''} ${visible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

/* ================================================================ COUNTUP */

export function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1200, 1);
          setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return (
    <span ref={ref} className="tabular">
      {value}
      {suffix}
    </span>
  );
}

/* ================================================================ TOOLTIP */

export function Tooltip({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label="Детальніше"
        aria-describedby={open ? id : undefined}
        className="inline-flex text-[rgba(14,15,12,0.4)] transition-colors hover:text-[var(--color-dark)]"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        <Info />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-[calc(100%+8px)] left-1/2 z-[600] w-[260px] -translate-x-1/2 rounded-xl bg-[var(--color-dark)] px-4 py-3 text-[12px] leading-[1.5] text-[var(--color-bg)]"
        >
          {label}
        </span>
      )}
    </span>
  );
}

/* =================================================================== CTA */

/* Посилання на форму консультації.

   Було просто href="#cta" у хедері, футері й кількох блоках. Секція
   id="cta" є лише на 6 сторінках із 16 (головна, про компанію, картки
   препарату/культури/рішення, стаття) — на решті (контакти, каталоги,
   блог-списки, дистрибʼютори, privacy, terms) клік не робив НІЧОГО.

   Тепер: якщо секція на сторінці є — плавний скрол до неї (як і було);
   якщо немає — звичайний перехід на /contacts#cta, де стоїть та сама
   LeadForm. href лишається справжнім, тож працює і без JS, і на
   середній клік / «відкрити в новій вкладці». */
export function CtaLink({
  className,
  children,
  onNavigate,
}: {
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  const handle = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Не перехоплюємо клік із модифікаторами — хай браузер відкриє вкладку.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const target = document.getElementById('cta');
    if (!target) return; // секції немає — йдемо на /contacts#cta
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', '#cta');
    onNavigate?.();
  };

  return (
    <a href="/contacts#cta" onClick={handle} className={className}>
      {children}
    </a>
  );
}

/* ================================================================= HEADER */

export function SiteHeader({
  nav: navItems = nav,
  phone = { value: '+38 (044) 499-50-49', href: 'tel:+380444995049' },
}: {
  nav?: { label: string; href: string }[];
  phone?: { value: string; href: string };
} = {}) {
  // Хедер — світлий pill на всіх сторінках і з самого верху (правка 28.07).
  // До цього на головній він був прозорий зі світлими лейблами й білішав
  // лише при скролі; тепер вигляд однаковий скрізь, а скрол додає лише
  // щільності фону, щоб контент під ним не просвічував.
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[250]">
        <div
          data-testid="header-pill"
          className={`pointer-events-auto mx-[12.8px] mt-[6.4px] flex h-16 items-center justify-between rounded-[24px] border border-[rgba(0,0,0,0.08)] px-4 backdrop-blur-[12px] transition-[background-color] duration-300 ${
            scrolled ? 'bg-[rgba(255,255,255,0.96)]' : 'bg-[rgba(255,255,255,0.94)]'
          }`}
        >
          {/* На головну, а не на #top: хедер спільний, і на сторінках
              препаратів, каталогу, блогу й дистрибʼюторів якір просто
              скролив угору тієї ж сторінки замість переходу додому. */}
          {/* shrink-0 + nowrap по всьому ряду: після додавання сьомого пункту
              меню («Контакти») хедер став тісним, і флекс почав переносити
              «Агро», «Про компанію» та номер телефону на другий рядок. */}
          <a
            href="/"
            aria-label="Родоніт Агро — на головну"
            className="flex shrink-0 items-center gap-2"
          >
            <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
            <span className="whitespace-nowrap text-[18px] font-[800] tracking-[-0.02em] text-[var(--color-dark)]">
              Родоніт Агро
            </span>
          </a>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Головне меню">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="btn-nav whitespace-nowrap text-[var(--color-dark)] transition-colors hover:text-[color:#03594C]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <a
              href={phone.href}
              className="hidden items-center gap-2 whitespace-nowrap text-[13px] font-[700] text-[var(--color-dark)] transition-colors sm:flex"
            >
              <Phone /> {phone.value}
            </a>
            <span className="hidden sm:block">
              <CtaLink className="btn btn-primary btn-sm whitespace-nowrap">
                Консультація
                <ArrowRight size={14} />
              </CtaLink>
            </span>
            <button
              type="button"
              aria-label="Відкрити меню"
              data-testid="burger"
              onClick={() => setMobileOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-full bg-[var(--color-dark)] text-[var(--color-accent)] lg:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          data-testid="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
          className="fixed inset-0 z-[400] overflow-y-auto bg-[var(--color-bg)] px-5 py-6 text-[var(--color-text)]"
        >
          {/* Світлий фон замість темного градієнта — решта сайту світла, і
              темна шторка читалась як чужий екран. Шапка шторки повторює
              хедер один в один: той самий знак + накреслення назви. */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
              <span className="text-[18px] font-[800] tracking-[-0.02em] text-[var(--color-dark)]">
                Родоніт Агро
              </span>
            </span>
            <button
              type="button"
              aria-label="Закрити меню"
              onClick={() => setMobileOpen(false)}
              className="grid h-11 w-11 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-dark)]"
            >
              <Close />
            </button>
          </div>
          <nav className="mt-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex h-14 items-center border-b border-[rgba(0,0,0,0.08)] text-[22px] text-[var(--color-dark)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <CtaLink onNavigate={() => setMobileOpen(false)} className="btn btn-primary mt-8 w-full">
            Замовити консультацію
            <ArrowRight size={14} />
          </CtaLink>
          <a
            href={phone.href}
            className="mt-4 flex items-center justify-center gap-2 pb-2 text-[16px] font-[700] text-[var(--color-dark)]"
          >
            <Phone size={16} /> {phone.value}
          </a>
        </div>
      )}
    </>
  );
}

/* ========================================================= PRODUCT SLIDER */

export function ProductSlider({
  products = SLIDER_PRODUCTS,
  images,
}: {
  products?: typeof SLIDER_PRODUCTS;
  images?: Record<string, string>;
} = {}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState({ ratio: 0, width: 1 });
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress({ ratio: max > 0 ? el.scrollLeft / max : 0, width: el.clientWidth / el.scrollWidth });
    setAtStart(el.scrollLeft < 8);
    setAtEnd(max - el.scrollLeft < 8);
  };

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const scrollBy = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('[data-card]') as HTMLElement | null;
    // Гап читаємо з рендера, а не константою: він живе в --slider-gap і вже
    // раз мінявся — захардкожене число тихо зсувало крок на кілька пікселів.
    const gap = parseFloat(getComputedStyle(el).columnGap) || 16;
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    const max = el.scrollWidth - el.clientWidth;
    let target = el.scrollLeft + dir * step;
    // Без цього останній крок міг лишити 20-30px хвоста: смужку картки й активну
    // стрілку, а наступний клік зсував на ті ж кілька пікселів.
    if (dir > 0 && max - target < step * 0.5) target = max;
    if (dir < 0 && target < step * 0.5) target = 0;
    el.scrollTo({ left: Math.max(0, Math.min(target, max)), behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        data-testid="product-track"
        className="slider-track no-scrollbar flex snap-x overflow-x-auto pb-2"
      >
        {products.map((p) => (
          <a
            key={p.slug}
            data-card
            href={`/preparaty/${p.slug}`}
            data-testid={`slide-${p.slug}`}
            className="slider-card group flex snap-start flex-col rounded-[24px] bg-[var(--color-surface)] p-7 text-center"
          >
            {/* overflow не ховаємо: висоту тримає max-h самої картинки, а
                overflow-hidden різав тінь товару знизу (тінь падає на 14+24px,
                а слоту лишалось 5px). Правка замовника 28.07. */}
            <div className="mb-6 grid h-[210px] place-items-center">
              <img
                src={images?.[p.slug] ?? `/products/${p.slug}.png`}
                alt={p.name}
                loading="lazy"
                className="max-h-[200px] w-auto object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.16)]"
              />
            </div>
            <p className="text-[12px] font-[700] uppercase tracking-[0.04em] text-[rgba(14,15,12,0.4)]">
              {p.category}
            </p>
            <h3 className="mt-2 text-[22px] font-[500] leading-[1.25] text-[var(--color-dark)]">{p.name}</h3>
            <p className="mt-3 line-clamp-3 text-[15px] leading-[1.55] text-[rgba(14,15,12,0.6)]">{p.description}</p>
            <span className="mt-auto w-full pt-6">
              <span className="btn btn-primary w-full">
                Детальніше <ArrowRight size={14} />
              </span>
            </span>
          </a>
        ))}

        {/* Акцентна картка-вхід — той самий прийом, що й «Build portfolio» у референсі. */}
        <div
          data-card
          className="slider-card flex snap-start flex-col rounded-[24px] bg-[var(--color-accent)] p-7 text-center"
        >
          {/* Фото директора замість спільної іконки-листка: за консультацією
              стоїть конкретна людина, і це працює краще за абстрактний знак.
              Тонка світла обводка відділяє знімок від акцентного фону картки. */}
          <div className="mb-6 grid h-[210px] place-items-center">
            <img
              src="/about/oleh-avatar.jpg"
              alt="Олег Дубина — директор «Родоніт Агро»"
              width={400}
              height={400}
              className="h-[132px] w-[132px] rounded-full object-cover ring-4 ring-[var(--color-bg)]"
            />
          </div>
          <h3 className="text-[22px] font-[500] leading-[1.25] text-[var(--color-text)]">
            Не знаєте, що обрати?
          </h3>
          <p className="mt-3 text-[15px] leading-[1.55] text-[rgba(14,15,12,0.65)]">
            Підкажемо схему під вашу культуру, фазу розвитку й задачу в полі.
          </p>
          <div className="mt-auto w-full pt-6">
            <CtaLink className="btn btn-white w-full">
              Підібрати препарат <ArrowRight size={14} />
            </CtaLink>
          </div>
        </div>
      </div>

      {/* Смуга прогресу — як тонка лінія під треком у референсі */}
      <div className="mt-6 h-[3px] w-full rounded-full bg-[rgba(0,0,0,0.08)]">
        <div
          data-testid="slider-progress"
          className="h-[3px] rounded-full bg-[var(--color-dark)] transition-[margin] duration-200"
          style={{
            width: `${Math.min(progress.width * 100, 100)}%`,
            marginLeft: `${progress.ratio * (100 - Math.min(progress.width * 100, 100))}%`,
          }}
        />
      </div>

      <button
        type="button"
        aria-label="Попередні препарати"
        onClick={() => scrollBy(-1)}
        disabled={atStart}
        className="absolute -left-3 top-[210px] hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-[rgba(0,0,0,0.12)] bg-[var(--color-bg)] transition-opacity disabled:opacity-0 lg:grid"
      >
        <span className="rotate-180 text-[var(--color-dark)]">
          <ArrowRight size={18} />
        </span>
      </button>
      <button
        type="button"
        aria-label="Наступні препарати"
        data-testid="slider-next"
        onClick={() => scrollBy(1)}
        disabled={atEnd}
        className="absolute -right-3 top-[210px] hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[var(--color-accent)] text-[var(--color-text)] transition-opacity disabled:opacity-0 lg:grid"
      >
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

/* =========================================================== PROBLEM PICK */

export function ProblemSolution({ items = problems }: { items?: typeof problems } = {}) {
  const [active, setActive] = useState(0);
  const current = items[active];

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16 [&>*]:min-w-0">
      <div>
        {items.map((p, i) => (
          <button
            key={p.problem}
            type="button"
            data-testid={`problem-${i}`}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
            className={`flex w-full items-start gap-4 border-b border-[rgba(255,255,255,0.12)] py-5 text-left transition-colors ${
              active === i ? 'text-[var(--color-bg)]' : 'text-[rgba(255,255,255,0.6)] hover:text-[var(--color-bg)]'
            }`}
          >
            <span
              className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full transition-colors ${
                active === i
                  ? 'bg-[var(--color-accent)] text-[var(--color-text)]'
                  : 'bg-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.6)]'
              }`}
            >
              <Check size={13} />
            </span>
            <span className="text-[17px] font-[500] leading-[1.4]">{p.problem}</span>
          </button>
        ))}
      </div>

      <div>
        {/* min-h — щоб картка не стрибала при перемиканні проблем: відповіді
            різної довжини давали розкид висоти 367–405px, і білий блок
            «дихав» на кожен клік. Тільки з sm: на мобільному фото стає під
            текст і фіксована висота лишила б порожнечу. */}
        <div className="rounded-[25px] bg-[var(--color-bg)] p-8 sm:min-h-[406px] lg:sticky lg:top-28">
          {/* Іконку проблеми з кутка прибрано 28.07 на вимогу замовника.
              Самі іконки лишились у файлі (PROBLEM_ICONS / ProblemIconFor) і
              ключі в problems[].icon — щоб повернути, досить одного span. */}
          <p className="eyebrow text-[rgba(14,15,12,0.4)]">Рішення</p>
          <h3 data-testid="solution-name" className="text-h4 mt-3">
            {current.product}
          </h3>

          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-7">
            <div className="min-w-0 flex-1">
              <p className="text-[16px] leading-[1.6] text-[rgba(14,15,12,0.7)]">{current.answer}</p>
              <a href={`/preparaty/${current.slug}`} className="btn btn-primary mt-8">
                Перейти до препарату
                <ArrowRight size={14} />
              </a>
            </div>
            <img
              key={current.slug}
              src={`/products/${current.slug}.png`}
              alt={current.product}
              loading="lazy"
              /* max-w обов'язковий: широкі кадри (мішки Верно, Нордокс) при
                 самому max-h вилазили за свою колонку й з'їдали текст. */
              /* На мобільному фото стає одразу під назву (order-first), а не
                 під кнопку: інакше воно відрізане від препарату, до якого
                 належить, і висить хвостом після заклику до дії. */
              className="order-first mx-auto max-h-[130px] w-auto max-w-[150px] shrink-0 object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.14)] sm:order-none sm:mx-0 sm:max-h-[180px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================== DISTRIBUTORS */

export function DistributorList({
  items = distributors,
  filters = distributorFilters,
}: {
  items?: typeof distributors;
  filters?: readonly string[];
} = {}) {
  const [filter, setFilter] = useState(filters[0]);
  const shown = filter === filters[0] ? items : items.filter((d) => d.direction === filter);

  return (
    <div>
      <div role="tablist" aria-label="Напрямки" className="flex flex-wrap gap-1 rounded-[24px] bg-[var(--color-surface)] p-1.5">
        {filters.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            data-testid={`distrib-filter-${f}`}
            onClick={() => setFilter(f)}
            className={`rounded-full px-5 py-2.5 text-[14px] transition-all duration-300 ${
              filter === f
                ? 'bg-[var(--color-bg)] font-[700] text-[var(--color-text)]'
                : 'text-[rgba(14,15,12,0.45)] hover:text-[var(--color-text)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div data-testid="distrib-grid" className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((d) => (
          <div key={d.name} className="card-hover flex h-full flex-col rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-[var(--color-bg)] p-6">
            {/* Логотип замість спільного листка. Бокс фіксованої висоти, лого
                вписується в нього (object-contain) — при різних пропорціях
                оригіналів (квадратні НК Рекорд/Баланс vs витягнуті Biochem/
                Агро Мрія) висота боксу спільна, тож картки не стрибають.
                56px, а не 44: на 44 квадратні лого читались помітно дрібнішими
                за горизонтальні, бо їх обмежувала висота, а не ширина. */}
            <div className="flex h-14 items-center justify-center">
              <img src={d.logo} alt={d.name} className="max-h-14 w-auto max-w-[150px] object-contain" />
            </div>
            <h3 className="mt-5 text-[19px] font-[500] text-[var(--color-dark)]">{d.name}</h3>
            <p className="mt-2 text-[14px] leading-[1.5] text-[rgba(14,15,12,0.55)]">{d.role}</p>
            {d.address && <p className="mt-3 text-[13px] leading-[1.5] text-[rgba(14,15,12,0.45)]">{d.address}</p>}
            <div className="mt-auto pt-5">
              {d.phones.map((ph) => (
                <a
                  key={ph}
                  href={`tel:${ph.replace(/[^\d+]/g, '')}`}
                  className="flex items-center gap-2 py-1 text-[15px] font-[700] text-[var(--color-dark)] hover:text-[color:#03594C]"
                >
                  <Phone /> {ph}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== FORM */

export function LeadForm() {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);

  const digits = phone.replace(/\D/g, '');
  const phoneValid = digits.length >= 10 && digits.length <= 13;
  const nameValid = name.trim().length > 1;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!nameValid || !phoneValid) return;
    setState('loading');
    // Реального ендпоінта тут ще немає — на бойовому сайті це POST /form-submit.
    window.setTimeout(() => setState('success'), 1000);
  };

  if (state === 'success') {
    return (
      <div data-testid="form-success" className="rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-[var(--color-bg)] p-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-accent)] text-[var(--color-text)]">
          <Check size={28} />
        </div>
        <h3 className="text-h4 mt-6">Дякуємо, {name.trim().split(' ')[0]}!</h3>
        <p className="mt-3 text-[16px] text-[rgba(14,15,12,0.6)]">
          Консультант зателефонує на {phone} найближчим часом.
        </p>
        <button
          type="button"
          onClick={() => {
            setState('idle');
            setName('');
            setPhone('');
            setTouched(false);
          }}
          className="btn btn-outline mt-8"
        >
          Надіслати ще одну
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-[var(--color-bg)] p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-name" className="block text-[14px] font-[700]">
            Імʼя
          </label>
          <input
            id="lead-name"
            data-testid="lead-name"
            className={`field mt-2 ${touched && !nameValid ? 'field-error' : ''}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Іван Петренко"
          />
          {touched && !nameValid && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#C4302F]">
              <Warning /> Вкажіть імʼя
            </p>
          )}
        </div>
        <div>
          <label htmlFor="lead-phone" className="block text-[14px] font-[700]">
            Телефон
          </label>
          <input
            id="lead-phone"
            data-testid="lead-phone"
            type="tel"
            className={`field mt-2 ${touched && !phoneValid ? 'field-error' : ''}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="+380 XX XXX XX XX"
            aria-invalid={touched && !phoneValid}
          />
          {touched && !phoneValid && (
            <p data-testid="phone-error" className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#C4302F]">
              <Warning /> Некоректний номер
            </p>
          )}
        </div>
      </div>

      <button type="submit" data-testid="lead-submit" disabled={state === 'loading'} className="btn btn-primary mt-6 w-full">
        {state === 'loading' ? (
          <>
            <Spinner /> Надсилаємо…
          </>
        ) : (
          <>
            Замовити консультацію <ArrowRight size={14} />
          </>
        )}
      </button>
      <p className="mt-4 text-center text-[12px] text-[rgba(14,15,12,0.4)]">
        Натискаючи кнопку, ви погоджуєтесь з{' '}
        <a href="/privacy" className="underline underline-offset-2">
          політикою конфіденційності
        </a>
      </p>
    </form>
  );
}

/* ========================================================= SCROLL TO TOP */

export function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      aria-label="Нагору"
      data-testid="scroll-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-[300] grid h-12 w-12 place-items-center rounded-full bg-[var(--color-dark)] text-[var(--color-accent)]"
    >
      <span className="-rotate-90">
        <ArrowRight />
      </span>
    </button>
  );
}

/* ============================================== PRODUCT: ТАБЛИЦЯ РЕГЛАМЕНТІВ */

export function RegulationTable({ rows }: { rows: { culture: string; rate: string }[] }) {
  const [q, setQ] = useState('');
  const shown = rows.filter((r) => r.culture.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div>
      <label htmlFor="reg-search" className="sr-only">
        Пошук культури
      </label>
      <input
        id="reg-search"
        data-testid="reg-search"
        className="field max-w-[360px]"
        placeholder="Знайти культуру…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="mt-6 overflow-hidden rounded-[24px] border border-[rgba(0,0,0,0.1)]">
        <table className="w-full text-left text-[15px]">
          <thead>
            <tr className="bg-[var(--color-surface)]">
              <th className="eyebrow px-6 py-4 text-[rgba(14,15,12,0.5)]">Культура</th>
              <th className="eyebrow px-6 py-4 text-[rgba(14,15,12,0.5)]">Регламент застосування</th>
            </tr>
          </thead>
          <tbody data-testid="reg-rows">
            {shown.map((r) => (
              <tr key={r.culture} className="border-t border-[rgba(0,0,0,0.06)] align-top">
                <td className="px-6 py-4 font-[700] text-[var(--color-dark)]">{r.culture}</td>
                <td className="px-6 py-4 leading-[1.6] text-[rgba(14,15,12,0.7)]">{r.rate}</td>
              </tr>
            ))}
            {!shown.length && (
              <tr>
                <td colSpan={2} className="px-6 py-10 text-center text-[rgba(14,15,12,0.45)]">
                  Нічого не знайшли. Спробуйте іншу назву або{' '}
                  <CtaLink className="underline underline-offset-2">
                    запитайте консультанта
                  </CtaLink>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-legal mt-4 text-[rgba(14,15,12,0.4)]">
        Норми наведені для орієнтації. Остаточна схема залежить від культури, фази розвитку та умов
        поля — узгоджуйте з агрономом.
      </p>
    </div>
  );
}

/* ================================================ PRODUCT: ІКОНКИ ДОСТАВКИ */

export function DeliveryIcon({ kind }: { kind: 'truck' | 'pin' }) {
  if (kind === 'pin') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 16V6h11v10M14 9h4l3 3v4h-7" />
      <circle cx="7" cy="17.5" r="2" />
      <circle cx="17" cy="17.5" r="2" />
    </svg>
  );
}

/* ============================================ PRODUCT: ЗАСТОСУВАННЯ НА КУЛЬТУРАХ */

export function CultureApplications({ rows }: { rows: { culture: string; rate: string }[] }) {
  const [active, setActive] = useState(0);
  if (!rows.length) return null;
  const current = rows[active];

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {rows.map((r, i) => (
          <button
            key={r.culture}
            type="button"
            data-testid={`culture-chip-${i}`}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
            className={`rounded-full px-5 py-2.5 text-[15px] transition-colors duration-300 ${
              active === i
                ? 'bg-[var(--color-dark)] font-[500] text-[var(--color-bg)]'
                : 'bg-[var(--color-surface)] text-[var(--color-dark)] hover:bg-[#E8EAEC]'
            }`}
          >
            {r.culture}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-[var(--color-surface)] p-8">
        <p data-testid="culture-title" className="text-[19px] font-[700] text-[var(--color-dark)]">
          {current.culture}
        </p>
        <p className="mt-3 text-[16px] leading-[1.65] text-[rgba(14,15,12,0.75)]">
          <span className="text-[rgba(14,15,12,0.45)]">Регламент застосування: </span>
          {current.rate}
        </p>
      </div>
    </div>
  );
}

/* ================================================== PRODUCT: АКОРДЕОН */

export function ProductAccordion({
  sections,
}: {
  sections: { key: string; label: string; render: ReactNode }[];
}) {
  const [open, setOpen] = useState<string | null>(sections[0]?.key ?? null);
  if (!sections.length) return null;

  return (
    <div className="overflow-hidden rounded-[24px] border border-[rgba(0,0,0,0.1)]">
      {sections.map((s, i) => {
        const isOpen = open === s.key;
        return (
          <div key={s.key} className={i ? 'border-t border-[rgba(0,0,0,0.1)]' : ''}>
            <button
              type="button"
              aria-expanded={isOpen}
              data-testid={`acc-${s.key}`}
              onClick={() => setOpen(isOpen ? null : s.key)}
              className="flex w-full items-center justify-between gap-6 bg-[var(--color-bg)] px-8 py-6 text-left transition-colors hover:bg-[var(--color-surface)]"
            >
              <span className="text-[19px] font-[500] text-[var(--color-dark)]">{s.label}</span>
              <Chevron
                className={`shrink-0 text-[var(--color-dark)] transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                size={20}
              />
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="px-8 pb-8">{s.render}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================= HERO: ФОН */

export function HeroBackground({ src }: { src?: string } = {}) {
  // Кадр обрано замовником 28.07 — «Сад на світанку», перший у heroBackgrounds.
  // Перемикач 1–8 і збереження вибору в localStorage прибрані тоді ж: свою
  // роботу вони зробили. Решта кандидатів лишились у lib/content.ts і
  // public/hero/ — якщо колись знадобиться інший кадр, міняється індекс тут.
  const current = heroBackgrounds[0];

  return (
    <>
      <img
        src={src ?? `/hero/${current.file}`}
        alt=""
        data-testid="hero-bg"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Скрим — один шар, обидва градієнти зібрані в .gradient-scrim.
          Другий (рівний вертикальний) прибрано 28.07: він гасив поле по всій
          ширині й фото читалось болотом, тоді як контраст під текстом усе одно
          не тримав. Тепер темна пляма стоїть саме під текстовим блоком. */}
      <div className="gradient-scrim absolute inset-0" />
    </>
  );
}

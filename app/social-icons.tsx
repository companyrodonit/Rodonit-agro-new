/* Іконки соцмереж. Раніше у футері замість них стояли перші дві літери назви
   («FA», «IN», «YO», «TI») — читалось як службова заглушка, а не як бренд.

   Намальовані вручну в тій самій манері, що й решта іконок проєкту (inline
   SVG, viewBox 24×24, currentColor), щоб колір успадковувався від кнопки
   й працював на світлому і на темному фоні без окремих версій файлів.
   Логотипи брендові, тому суцільною заливкою, а не обведенням. */

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {children}
    </svg>
  );
}

function Facebook() {
  return (
    <Svg>
      <path d="M17.5 2.2h-2.8a5.2 5.2 0 0 0-5.2 5.2v2.9H6.8v3.9h2.7v7.6h4v-7.6h2.8l.7-3.9h-3.5V7.7c0-.8.4-1.3 1.3-1.3h2.7z" />
    </Svg>
  );
}

function Instagram() {
  return (
    <Svg>
      {/* Рамка малюється як кільце (evenodd), інакше на заливці зникає
          «вікно» камери й іконка читається суцільним квадратом. */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.6 2.4h8.8a5.2 5.2 0 0 1 5.2 5.2v8.8a5.2 5.2 0 0 1-5.2 5.2H7.6a5.2 5.2 0 0 1-5.2-5.2V7.6a5.2 5.2 0 0 1 5.2-5.2Zm0 2a3.2 3.2 0 0 0-3.2 3.2v8.8a3.2 3.2 0 0 0 3.2 3.2h8.8a3.2 3.2 0 0 0 3.2-3.2V7.6a3.2 3.2 0 0 0-3.2-3.2Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z"
      />
      <circle cx="17.2" cy="6.8" r="1.2" />
    </Svg>
  );
}

function YouTube() {
  return (
    <Svg>
      {/* Трикутник вирізаний тим самим контуром (evenodd), щоб «грав» фон
          кнопки — так іконка лишається читабельною і в темному кружечку. */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.6 7.3a2.9 2.9 0 0 0-2-2C17.8 4.8 12 4.8 12 4.8s-5.8 0-7.6.5a2.9 2.9 0 0 0-2 2C1.9 9.1 1.9 12 1.9 12s0 2.9.5 4.7a2.9 2.9 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.9 2.9 0 0 0 2-2c.5-1.8.5-4.7.5-4.7s0-2.9-.5-4.7ZM10.1 15.4V8.6l5.9 3.4z"
      />
    </Svg>
  );
}

function TikTok() {
  return (
    <Svg>
      <path d="M16.7 2h-3.2v13.6a2.5 2.5 0 1 1-2.5-2.5c.2 0 .4 0 .6.1V9.9a6 6 0 0 0-.6 0 5.8 5.8 0 1 0 5.8 5.8V9.2a7.5 7.5 0 0 0 4.4 1.4V7.4a4.4 4.4 0 0 1-4.5-4.4z" />
    </Svg>
  );
}

const ICONS: Record<string, () => React.ReactElement> = {
  Facebook,
  Instagram,
  YouTube,
  TikTok,
};

/** Невідома назва нічого не малює — не валимо сторінку, якщо в контенті
    з'явиться нова мережа без іконки. */
export function SocialIcon({ name }: { name: string }) {
  const Icon = ICONS[name];
  return Icon ? <Icon /> : null;
}

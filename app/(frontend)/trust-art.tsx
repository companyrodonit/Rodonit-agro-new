/* Векторні ілюстрації для картки «Чому нам довіряють».
   Замінили згенеровані фото — не пасували під плаский мінімалізм сайту.
   Той самий силует, що в маленькій іконці над карткою (медаль/лист/лупа/
   щит), але більший і в заливці (dark + accent), а не тонкий stroke —
   на такому розмірі заливка читається як ілюстрація, а не як велика іконка. */

const DARK = 'var(--color-dark)';
const ACCENT = 'var(--color-accent)';

function ArtFrame({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 200 100"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* Медаль зі стрічкою — OMRI-сертифікат. Раніше всередині був абстрактний
   «листок» — на такому розмірі читався просто як пляма. Замінили на
   чекмарк — однозначно «підтверджено», без здогадок, що там намальовано. */
function ArtCertificate() {
  return (
    <ArtFrame>
      <path d="M92 58 82 92l18-9 18 9-10-34" fill={ACCENT} />
      <circle cx="100" cy="46" r="26" fill={DARK} />
      <path
        d="m88 46 8 8 16-16"
        fill="none"
        stroke={ACCENT}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </ArtFrame>
  );
}

/* Паросток у ґрунті — органічне виробництво */
function ArtOrganic() {
  return (
    <ArtFrame>
      <ellipse cx="100" cy="78" rx="46" ry="12" fill={DARK} />
      <path d="M100 78V46" stroke={ACCENT} strokeWidth="4" strokeLinecap="round" />
      <path
        d="M100 58c-3-10-11-15-22-16 1 10 8 18 22 16Z"
        fill={ACCENT}
      />
      <path
        d="M100 50c3-11 12-16 24-17-1 11-9 19-24 17Z"
        fill={ACCENT}
      />
      <circle cx="146" cy="24" r="8" fill={ACCENT} opacity="0.55" />
    </ArtFrame>
  );
}

/* Лупа з дрібними частинками — мікронізація 1,2 мкм */
function ArtMicron() {
  return (
    <ArtFrame>
      <circle cx="86" cy="46" r="27" fill="none" stroke={DARK} strokeWidth="6" />
      <path d="m106 66 20 20" stroke={DARK} strokeWidth="7" strokeLinecap="round" />
      <circle cx="78" cy="40" r="3.4" fill={ACCENT} />
      <circle cx="92" cy="46" r="4.4" fill={ACCENT} />
      <circle cx="82" cy="55" r="2.6" fill={ACCENT} />
      <circle cx="96" cy="36" r="2.2" fill={ACCENT} />
    </ArtFrame>
  );
}

/* Щит із цифрою «3» — 3 клас небезпечності. Був чекмарк, але це плутало
   з OMRI-карткою (та сама галочка) і не називало сам клас — цифра прямо
   каже, про що пункт. */
function ArtSafe() {
  return (
    <ArtFrame>
      <path
        d="M100 16 130 27v24c0 20-13 32-30 39-17-7-30-19-30-39V27l30-11Z"
        fill={DARK}
      />
      <text
        x="100"
        y="53"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="34"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
        fill={ACCENT}
      >
        3
      </text>
    </ArtFrame>
  );
}

const TRUST_ART = {
  certificate: ArtCertificate,
  organic: ArtOrganic,
  micron: ArtMicron,
  'safe-class': ArtSafe,
} as const;

export function TrustArtFor({ name }: { name?: string }) {
  const Art = TRUST_ART[name as keyof typeof TRUST_ART];
  return Art ? <Art /> : null;
}

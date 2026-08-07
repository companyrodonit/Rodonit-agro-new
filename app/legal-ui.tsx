/* Спільна верстка легальних сторінок: вузька колонка тексту, ті самі
   типографічні класи, що й у блозі. Один компонент на дві сторінки — щоб
   /privacy і /terms не розʼїхались стилями при першій же правці. */

export type LegalBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'note'; text: string };

export function LegalBody({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <div className="max-w-[760px]">
      {blocks.map((b, i) => {
        if (b.type === 'heading') {
          return (
            <h2 key={i} className="text-h4 mt-14 scroll-mt-[120px] first:mt-0 !text-[var(--color-dark)]">
              {b.text}
            </h2>
          );
        }
        if (b.type === 'list') {
          return (
            <ul key={i} className="mt-5 space-y-3">
              {b.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[17px] leading-[1.7] text-[rgba(14,15,12,0.75)]"
                >
                  <span className="mt-[10px] h-[6px] w-[6px] shrink-0 rounded-full bg-[var(--color-accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (b.type === 'note') {
          /* Примітка для замовника й читача — те, що ще потребує уточнення.
             Візуально відділена, щоб її не сплутали з чинною нормою. */
          return (
            <div
              key={i}
              className="mt-8 rounded-[20px] border border-dashed border-[rgba(0,0,0,0.18)] bg-[var(--color-surface)] p-6"
            >
              <p className="text-[15px] leading-[1.7] text-[rgba(14,15,12,0.6)]">{b.text}</p>
            </div>
          );
        }
        return (
          <p key={i} className="mt-5 text-[17px] leading-[1.75] text-[rgba(14,15,12,0.75)]">
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

export function LegalMeta({ updated }: { updated: string }) {
  return <p className="text-[14px] text-[rgba(14,15,12,0.45)]">Востаннє оновлено: {updated}</p>;
}

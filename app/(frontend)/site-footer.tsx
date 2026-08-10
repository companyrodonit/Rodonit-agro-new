import { contacts, footerColumns } from '@/lib/content';
import { ArrowRight, CtaLink } from './interactive';
import { SocialIcon } from './social-icons';

/** Один футер на всі сторінки — той самий, що на головній. */
export function SiteFooter() {
  // Скруглені лише два верхні кути — низ упирається в край сторінки.
  // Футер спільний, тож це діє і на сторінках препаратів: там рамки немає,
  // але скруглений верх на світлому тлі виглядає так само.
  return (
      <footer className="on-dark rounded-t-[32px] bg-[#11120E] text-[var(--color-bg)]">
      <div className="container-page py-20">
        <div className="grid gap-16 lg:grid-cols-[2fr_3fr]">
          <div>
            <div className="flex items-center gap-2">
              {/* На темному фоні лого лишається читабельним: знак світлий
                  контурний, підкладка під нього не потрібна. */}
              <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
              <span className="text-[18px] font-[800]">Родоніт Агро</span>
            </div>
            <h3 className="text-h4 mt-8 !text-[var(--color-bg)]">
              Технології підвищення <em className="accent-word">врожайності</em>
            </h3>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink className="btn btn-primary btn-sm">
                Консультація <ArrowRight size={12} />
              </CtaLink>
              <a href="/contacts" className="btn btn-outline-light btn-sm">
                Контакти
              </a>
            </div>
            <div className="mt-8 flex gap-3">
              {contacts.socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  title={s.name}
                  className="grid h-10 w-10 place-items-center rounded-full bg-[rgba(255,255,255,0.1)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-text)]"
                >
                  <SocialIcon name={s.name} />
                </a>
              ))}
            </div>
            <p className="mt-8 max-w-[320px] text-[14px] leading-[1.6] text-[rgba(255,255,255,0.5)]">
              {contacts.address}
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] uppercase tracking-[0.022em] text-[rgba(255,255,255,0.6)]">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="link-arrow flex items-center justify-between gap-4 text-[14px] text-[rgba(255,255,255,0.85)] transition-colors hover:text-[#FEFEFE]"
                      >
                        {l.label} <ArrowRight size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(255,255,255,0.12)]">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-6 text-[12px] text-[rgba(255,255,255,0.5)]">
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-[#FEFEFE]">
              Політика конфіденційності
            </a>
            <a href="/terms" className="hover:text-[#FEFEFE]">
              Умови використання
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p>© 2026 ТОВ «Родоніт Агро»</p>
            {/* rel="noopener" обовʼязково при target="_blank": без нього
                відкрита вкладка отримує доступ до window.opener. */}
            <a
              href="https://webf.love"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--color-accent)]"
            >
              made by <span className="font-[700]">webf.love</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

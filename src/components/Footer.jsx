// src/components/Footer.jsx
import { Phone, Clock } from "lucide-react";
import { useT } from "../i18n/i18n";

export default function Footer() {
  const y = new Date().getFullYear();
  const t = useT();
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__col">
          <div className="footer__brand">{t("common:brand")}</div>
          <p className="footer__muted">{t("footer:tagline")}</p>
        </div>
        <div className="footer__col">
          <div className="footer__title">{t("footer:contacts")}</div>
          <ul className="footer__list">
            <li className="footer__item">
              <span className="footer__icon" aria-hidden>
                <Phone size={16} strokeWidth={2} />
              </span>
              <span className="footer__item-text">
                {t("footer:for_order")}:
                <a
                  className="footer__contact"
                  href="tel:+998785550404"
                  aria-label="Call +998785550404"
                >
                  +998785550404
                </a>
              </span>
            </li>
            <li className="footer__item">
              <span className="footer__icon" aria-hidden>
                <Clock size={16} strokeWidth={2} />
              </span>
              <span className="footer__item-text">
                {t("footer:working_hours", { from: "09:00", to: "03:00" })}
              </span>
            </li>
          </ul>
        </div>
        <div className="footer__col">
          <div className="footer__title">{t("footer:quick_links")}</div>
          <ul className="footer__links">
            <li>
              <a href="/">{t("footer:menu")}</a>
            </li>
            <li>
              <a href="/cart">{t("common:cart")}</a>
            </li>
            <li>
              <a href="/checkout">{t("footer:payment")}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="subfooter">
        <div className="container subfooter__inner">
          <span>
            © {y} {t("common:brand")}
          </span>
          <span className="footer__muted">{t("footer:made_with")}</span>
        </div>
      </div>
    </footer>
  );
}

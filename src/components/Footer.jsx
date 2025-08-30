// src/components/Footer.jsx
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
            <li>📞 +998 (90) 000‒00‒00</li>
            <li>✉️ support@uzbekdoner.uz</li>
            <li>🕒 10:00 — 23:00</li>
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

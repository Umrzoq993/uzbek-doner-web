import { Link } from "react-router-dom";
import { useCart } from "../store/cart";
import { useT } from "../i18n/i18n";
import { useLangStore } from "../store/lang";

export default function Header() {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const t = useT();
  const { lang, setLang } = useLangStore();

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="brand">
          {t("common:brand")}
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={() => setLang(lang === "uz" ? "ru" : "uz")}
            className="chip"
            style={{ fontSize: 12 }}
            aria-label="Switch language"
          >
            {lang === "uz" ? "RU" : "UZ"}
          </button>
          <Link to="/checkout" className="cart-ind">
            <span>🧺 {t("common:cart")}</span>
            {count > 0 && <span className="cart-ind__badge">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}

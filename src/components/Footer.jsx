// src/components/Footer.jsx
export default function Footer() {
  const y = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__col">
          <div className="footer__brand">UzbekDoner</div>
          <p className="footer__muted">
            Halol, tezkor va mazali taomlar. Onlayn buyurtma bering — biz
            yetkazib beramiz.
          </p>
        </div>
        <div className="footer__col">
          <div className="footer__title">Aloqa</div>
          <ul className="footer__list">
            <li>📞 +998 (90) 000‒00‒00</li>
            <li>✉️ support@uzbekdoner.uz</li>
            <li>🕒 10:00 — 23:00</li>
          </ul>
        </div>
        <div className="footer__col">
          <div className="footer__title">Tez havolalar</div>
          <ul className="footer__links">
            <li>
              <a href="/">Menyu</a>
            </li>
            <li>
              <a href="/cart">Savat</a>
            </li>
            <li>
              <a href="/checkout">To‘lov</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="subfooter">
        <div className="container subfooter__inner">
          <span>© {y} UzbekDoner</span>
          <span className="footer__muted">Made with ❤️</span>
        </div>
      </div>
    </footer>
  );
}

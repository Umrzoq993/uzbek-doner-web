import { Link } from "react-router-dom";
import { useCart } from "../store/cart";

export default function Header() {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="brand">
          UzbekDoner
        </Link>
        <Link to="/checkout" className="cart-ind">
          <span>🧺 Savat</span>
          {count > 0 && <span className="cart-ind__badge">{count}</span>}
        </Link>
      </div>
    </header>
  );
}

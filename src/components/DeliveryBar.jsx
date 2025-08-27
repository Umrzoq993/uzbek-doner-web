import { useCart } from "../store/cart";
import Button from "./ui/Button";

const FREE_LIMIT = Number(import.meta.env.VITE_FREE_DELIVERY_LIMIT || 14900);

export default function DeliveryBar() {
  const cart = useCart();
  const total = cart.total();
  const progress = Math.min(100, Math.round((total / FREE_LIMIT) * 100));
  const left = Math.max(0, FREE_LIMIT - total);

  return (
    <div className="delivery">
      <div className="delivery__inner">
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            🏃‍♂️{" "}
            {left > 0 ? (
              <b>
                {FREE_LIMIT.toLocaleString()} so‘m uchun {left.toLocaleString()}{" "}
                so‘m yetmaydi
              </b>
            ) : (
              <b>Yetkazib berish bepul!</b>
            )}
          </div>
          <div className="progress" style={{ marginTop: 8 }}>
            <div className="progress__bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <Button
          className="btn--primary"
          onClick={() => location.assign("/cart")}
        >
          Savatga o‘tish
        </Button>
      </div>
    </div>
  );
}

import { useCart } from "../store/cart";
import Button from "./ui/Button";
import { useT, useMoneyFormatter } from "../i18n/i18n";
import { useLangStore } from "../store/lang";

const FREE_LIMIT = Number(import.meta.env.VITE_FREE_DELIVERY_LIMIT || 14900);

export default function DeliveryBar() {
  const cart = useCart();
  const total = cart.total();
  const progress = Math.min(100, Math.round((total / FREE_LIMIT) * 100));
  const left = Math.max(0, FREE_LIMIT - total);
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const fmtMoney = useMoneyFormatter();

  return (
    <div className="delivery">
      <div className="delivery__inner">
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            🏃‍♂️{" "}
            {left > 0 ? (
              <b>
                {lang === "ru"
                  ? `До бесплатной доставки осталось ${fmtMoney(
                      left
                    )} (порог ${fmtMoney(FREE_LIMIT)})`
                  : `${fmtMoney(FREE_LIMIT)} uchun ${fmtMoney(left)} yetmaydi`}
              </b>
            ) : (
              <b>{t("checkout:free_delivery")}</b>
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
          {t("common:cart")}
        </Button>
      </div>
    </div>
  );
}

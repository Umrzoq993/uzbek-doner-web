// src/pages/Checkout.jsx
import { useMemo, useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import paymeLogo from "../assets/payme.png";
import clickLogo from "../assets/click.png";
import { useNavigate } from "react-router-dom";
import { useCart } from "../store/cart";
import { useLocationStore } from "../store/location";
import { toast } from "react-toastify";
import { useT, useMoneyFormatter } from "../i18n/i18n";
import { OrderAPI, FlialAPI } from "../lib/api";
import ConfirmModal from "../components/ConfirmModal";
import GeoPicker from "../components/GeoPicker";
import { useLangStore } from "../store/lang";

/* Helpers */
// localized money formatting via hook (legacy fmt kept for fallback if needed)
// legacyFmt removed (use useMoneyFormatter instead)
// Dinamik yetkazib berish narxi (filial API dan olinadi)
const FALLBACK_DELIVERY = 0;
const API_BASE = import.meta?.env?.VITE_API_BASE || "";

/* Telefon: yagona input (mask bilan) +998 prefiksli; faqat 9 ta raqam saqlanadi */
const onlyDigits = (s = "") => s.replace(/\D+/g, "");
const clamp9 = (s) => onlyDigits(s).slice(0, 9);
const toE164 = (nine) => (nine?.length === 9 ? `+998${nine}` : "");
const formatMasked = (nine = "") => {
  const a = nine.padEnd(9, "_");
  return `+998 (${a.slice(0, 2)}) ${a.slice(2, 5)}-${a.slice(5, 7)}-${a.slice(
    7,
    9
  )}`;
};

export default function Checkout() {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const fmtMoney = useMoneyFormatter();
  const nav = useNavigate();
  const { items, clear } = useCart();
  const { place, details, setDetails } = useLocationStore();
  const [geoOpen, setGeoOpen] = useState(false);

  // To'lov usuli
  const [payMethod, setPayMethod] = useState("cash"); // 'cash' | 'payme' | 'click'
  const [phone9, setPhone9] = useState(""); // faqat 9 ta raqam
  const [loading, setLoading] = useState(false);
  const [deliveryPrice, setDeliveryPrice] = useState(FALLBACK_DELIVERY);
  const [flialId, setFlialId] = useState(1);
  const [feeLoading, setFeeLoading] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [distanceKm, setDistanceKm] = useState(null);

  // Confirm modal holati
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [skipConfirm, setSkipConfirm] = useState(() => {
    try {
      return localStorage.getItem("ud_skip_confirm") === "1";
    } catch {
      return false;
    }
  });

  // Derived flags
  const validPhone = phone9.length === 9;

  // Hisob-kitoblar (refaktordan keyin qayta tiklandi)
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0),
    [items]
  );
  const totalQty = useMemo(
    () => items.reduce((s, i) => s + (i.qty || 0), 0),
    [items]
  );
  const total = Math.max(0, subtotal + (deliveryPrice || 0));
  // Buyurtma shartlari (puls faqat tayyor bo'lsa yoqiladi)
  const canOrder =
    items.length > 0 &&
    validPhone &&
    !!place?.label &&
    !feeLoading &&
    deliveryPrice > 0 &&
    !loading;

  // Manzil o'zgarganda delivery price hisoblash
  useEffect(() => {
    const lat = place?.lat;
    const lon = place?.lon;
    if (!lat || !lon) return;
    let cancelled = false;
    (async () => {
      setFeeLoading(true);
      try {
        const data = await FlialAPI.checkPoint({
          latitude: lat,
          longitude: lon,
        });
        if (process.env.NODE_ENV !== "production") {
          console.debug("[Checkout] checkPoint resp", data);
        }
        if (cancelled) return;
        if (data?.status) {
          setDeliveryPrice(Number(data?.price || 0));
          if (data?.flial?.id) setFlialId(data.flial.id);
          setBranchName(data?.flial?.name || "");
          setDistanceKm(
            typeof data?.distance === "number"
              ? Number(data.distance.toFixed(2))
              : null
          );
        } else {
          setDeliveryPrice(FALLBACK_DELIVERY);
          setBranchName("");
          setDistanceKm(null);
        }
      } catch {
        if (process.env.NODE_ENV !== "production") {
          console.debug("[Checkout] checkPoint error");
        }
        if (!cancelled) {
          setDeliveryPrice(FALLBACK_DELIVERY);
          setBranchName("");
          setDistanceKm(null);
        }
      } finally {
        if (!cancelled) setFeeLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [place?.lat, place?.lon]);
  // Buyurtma yuborish (faqat naqd)
  const submitOrder = async () => {
    if (!items.length) return toast?.error?.(t("checkout:toast_cart_empty"));
    if (!place?.label) return toast?.error?.(t("checkout:toast_need_address"));
    if (feeLoading)
      return toast?.error?.(
        lang === "ru"
          ? "Цена доставки рассчитывается"
          : "Yetkazib berish narxi hisoblanmoqda"
      );
    // Yetkazib berish narxi > 0 bo'lishi shart (bepul tarif yo'q)
    if (!deliveryPrice || deliveryPrice <= 0)
      return toast?.error?.(
        lang === "ru"
          ? "Цена доставки не определена"
          : "Yetkazib berish narxi aniqlanmadi"
      );
    if (!validPhone) return toast?.error?.(t("checkout:toast_phone_required"));

    const phoneE164 = toE164(phone9);
    setLoading(true);
    try {
      const addressParts = [
        place?.label || "",
        details?.entrance ? `Подъезд: ${details.entrance}` : "",
        details?.floor ? `Этаж: ${details.floor}` : "",
        details?.apt ? `Кв: ${details.apt}` : "",
      ].filter(Boolean);
      const fullAddress = addressParts.join("; ");
      const payload = {
        source: "web",
        phone: phoneE164 || "",
        address: fullAddress,
        latitude: place?.lat || 0,
        longitude: place?.lon || 0,
        delivery_price: deliveryPrice,
        payment_type: payMethod,
        flial_id: flialId,
        comment: details?.courierNote || "",
        details: items.map((it) => ({ product_id: it.id, number: it.qty })),
      };
      const res = await OrderAPI.create(payload);
      if (res?.status) {
        const oid = res?.order_id ? ` #${res.order_id}` : "";
        toast?.success?.(
          res?.message || t("checkout:toast_cash_success") + oid
        );
      } else {
        toast?.error?.(res?.message || t("checkout:toast_cash_fail"));
        setLoading(false);
        return;
      }
      clear();
      nav("/");
    } catch {
      toast?.error?.(t("checkout:toast_cash_fail"));
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    if (!validPhone) {
      toast?.error?.(t("checkout:toast_phone_required"));
      return;
    }
    if (payMethod !== "cash") {
      toast?.warn?.(
        (lang === "ru"
          ? "Пока что работает только оплата наличными"
          : "Hozircha faqat naqd to'lov ishlaydi") +
          (payMethod === "payme"
            ? " (Payme)"
            : payMethod === "click"
            ? " (Click)"
            : "")
      );
      return;
    }
    if (skipConfirm) {
      submitOrder();
      return;
    }
    setConfirmOpen(true);
  };

  const confirmAndSend = async () => {
    setConfirmOpen(false);
    await submitOrder();
  };

  return (
    <div className="checkout page has-paybar">
      <div className="checkout-grid">
        {/* LEFT */}
        <div className="left">
          {/* Savat */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">{t("checkout:cart")}</h3>
            {items.length === 0 && (
              <div className="checkout-card__muted">
                {t("checkout:cart_empty")}
              </div>
            )}
            <div className="summary-list">
              {items.map((it) => {
                const line = (it.price || 0) * (it.qty || 0);
                // Mahsulot nomini tilga qarab tanlaymiz (raw obyekt mavjud bo'lsa undan olamiz)
                const raw = it.raw || it.product || {};
                const name =
                  lang === "ru"
                    ? raw.name_ru ||
                      raw.name ||
                      it.title ||
                      it.name ||
                      "Mahсulot"
                    : raw.name_uz ||
                      raw.name ||
                      it.title ||
                      it.name ||
                      "Mahsulot";
                return (
                  <div key={it.id} className="summary-row">
                    <div>
                      <div style={{ fontWeight: 800 }}>{name}</div>
                      <small className="checkout-card__muted">
                        {it.qty || 0} × {fmtMoney(it.price || 0)}
                      </small>
                    </div>
                    <div style={{ fontWeight: 700 }}>{fmtMoney(line)}</div>
                  </div>
                );
              })}
            </div>
            {/* Qo'shilgan: umumiy hisob-kitob shu kart ichida */}
            <div
              style={{
                marginTop: 12,
                borderTop: "1px solid var(--line)",
                paddingTop: 12,
                display: "grid",
                gap: 6,
              }}
            >
              <div className="summary-row summary-row--muted">
                <div>{t("checkout:order")}</div>
                <div>{fmtMoney(subtotal)}</div>
              </div>
              <div className="summary-row summary-row--muted">
                <div>{t("checkout:delivery")}</div>
                <div>
                  {feeLoading
                    ? "…"
                    : deliveryPrice > 0
                    ? fmtMoney(deliveryPrice)
                    : "—"}
                </div>
              </div>
              {(branchName || feeLoading) && (
                <div
                  className="summary-row summary-row--muted"
                  style={{ fontSize: 12, opacity: 0.85 }}
                >
                  <div style={{ flex: 1 }}>
                    {feeLoading
                      ? t("checkout:loading_delivery")
                      : branchName || t("checkout:delivery_unavailable")}
                  </div>
                  <div>
                    {!feeLoading && distanceKm != null
                      ? t("checkout:branch_distance_unit", { km: distanceKm })
                      : ""}
                  </div>
                </div>
              )}
              <div className="summary-row summary-row--total">
                <div>{t("checkout:total")}</div>
                <div>{fmtMoney(total)}</div>
              </div>
            </div>
          </div>

          {/* Restoran uchun izoh */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">
              {t("checkout:note_for_restaurant")}
            </h3>
            <textarea
              className="field field--long"
              style={{ width: "100%" }}
              placeholder={t("checkout:note_placeholder")}
              value={details?.courierNote || ""}
              onChange={(e) => setDetails({ courierNote: e.target.value })}
            />
          </div>

          {/* Manzil (soddalashtirilgan) */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">{t("checkout:address")}</h3>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="checkout-card__muted" style={{ flex: 1 }}>
                {place?.label || t("checkout:address_not_selected")}
              </div>
              <button
                type="button"
                className={
                  "checkout-card__addr-btn" + (!place?.label ? " is-pulse" : "")
                }
                onClick={() => setGeoOpen(true)}
                aria-label={
                  place?.label
                    ? lang === "ru"
                      ? "Адрес изменить"
                      : "Manzilni o'zgartirish"
                    : lang === "ru"
                    ? "Выбрать адрес"
                    : "Manzil tanlash"
                }
              >
                <span className="addr-btn__icon" aria-hidden>
                  📍
                </span>
                <span className="addr-btn__text">
                  {place?.label
                    ? lang === "ru"
                      ? "Изменить"
                      : "O'zgartirish"
                    : lang === "ru"
                    ? "Выбрать"
                    : "Tanlash"}
                </span>
              </button>
            </div>
          </div>

          {/* To'lov usuli */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">{t("checkout:pay_method")}</h3>
            <div className="pay-methods">
              {[
                {
                  key: "cash",
                  labelUz: "Naqd",
                  labelRu: "Наличные",
                  icon: "cash",
                },
                {
                  key: "payme",
                  labelUz: "Payme",
                  labelRu: "Payme",
                  icon: "payme",
                },
                {
                  key: "click",
                  labelUz: "Click",
                  labelRu: "Click",
                  icon: "click",
                },
              ].map((m) => {
                const active = payMethod === m.key;
                const lbl = lang === "ru" ? m.labelRu : m.labelUz;
                // Endi barcha usullar uchun matn ko'rsatamiz (yonma-yon)
                const showText = true;
                return (
                  <label
                    key={m.key}
                    className={"pay-method" + (active ? " is-active" : "")}
                    aria-label={lbl}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      value={m.key}
                      checked={active}
                      onChange={() => {
                        setPayMethod(m.key);
                        if (m.key !== "cash") {
                          toast?.info?.(
                            lang === "ru"
                              ? "Скоро будет доступно. Пока что только наличные"
                              : "Tez orada. Hozircha faqat naqd"
                          );
                        }
                      }}
                    />
                    <span
                      className="pay-method__icon"
                      aria-hidden
                      style={
                        m.icon !== "cash"
                          ? {
                              width: 54,
                              height: 54,
                              padding: 4,
                              background: "rgba(255,255,255,0.10)",
                            }
                          : undefined
                      }
                    >
                      {m.icon === "cash" && <DollarSign size={26} />}
                      {m.icon === "payme" && (
                        <img
                          src={paymeLogo}
                          alt={lbl}
                          style={{
                            width: "80%",
                            height: "80%",
                            objectFit: "contain",
                            display: "block",
                          }}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      {m.icon === "click" && (
                        <img
                          src={clickLogo}
                          alt={lbl}
                          style={{
                            width: "80%",
                            height: "80%",
                            objectFit: "contain",
                            display: "block",
                          }}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </span>
                    {showText && (
                      <span className="pay-method__label">{lbl}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Telefon raqami */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">
              {lang === "ru" ? "Телефон" : "Telefon"}
            </h3>
            <div className="field-row" style={{ marginTop: 4 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 8,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    padding: "10px 12px",
                    borderRadius: 999,
                    border: "1px solid var(--line)",
                    background: "var(--surface-2)",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  +998
                </span>
                <input
                  className="field"
                  style={{ width: "100%", letterSpacing: 1 }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={9}
                  placeholder="(__)___-__-__"
                  value={phone9}
                  onChange={(e) => {
                    const v = clamp9(e.target.value);
                    setPhone9(v);
                    setDetails({ phone: toE164(v) || "" });
                  }}
                  aria-label={
                    lang === "ru" ? "Номер телефона" : "Telefon raqami"
                  }
                />
              </div>
              <small
                className="checkout-card__muted"
                style={{
                  marginTop: 8,
                  color: validPhone ? undefined : "#ff6666",
                }}
              >
                {t("checkout:phone_required")} • {formatMasked(phone9)}
                {payMethod !== "cash" && (
                  <span style={{ color: "#e6b300", marginLeft: 6 }}>
                    {lang === "ru" ? "(только наличные)" : "(faqat naqd)"}
                  </span>
                )}
              </small>
            </div>
          </div>
        </div>

        {/* RIGHT panel olib tashlandi – endi hammasi chap kart ichida */}
      </div>

      {/* PAYBAR */}
      <div className="paybar">
        <div className="paybar__inner">
          <div style={{ fontWeight: 800 }}>
            {t("checkout:total")}:&nbsp; {fmtMoney(total)}
          </div>
          <button
            className={"paybar__btn" + (canOrder ? " is-pulse" : "")}
            disabled={!canOrder}
            onClick={(e) => {
              e.preventDefault();
              if (!canOrder) return;
              // Paybar orqali ham buyurtma jarayonini boshlash (naqd) – handlePay ga o'xshash
              if (payMethod !== "cash") return; // hozircha faqat naqd
              if (skipConfirm) submitOrder();
              else setConfirmOpen(true);
            }}
            title={
              canOrder
                ? lang === "ru"
                  ? "Оформить заказ"
                  : "Buyurtma berish"
                : lang === "ru"
                ? "Заполните ma'lumotlarni"
                : "Ma'lumotlarni to'ldiring"
            }
          >
            {canOrder
              ? lang === "ru"
                ? "Оформить"
                : "Buyurtma berish"
              : lang === "ru"
              ? "Заполните"
              : "To'ldiring"}
          </button>
        </div>
      </div>
      {/* GeoPicker modal */}
      <GeoPicker open={geoOpen} onClose={() => setGeoOpen(false)} />
      <ConfirmModal
        open={confirmOpen}
        title={t("checkout:confirm_title")}
        confirmText={lang === "ru" ? "Подтвердить" : "Tasdiqlash"}
        cancelText={lang === "ru" ? "Отмена" : "Bekor qilish"}
        onConfirm={confirmAndSend}
        onCancel={() => setConfirmOpen(false)}
        loading={loading}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontWeight: 600 }}>{t("checkout:confirm_review")}</div>
          <div
            style={{
              fontSize: 12,
              lineHeight: 1.5,
              background: "var(--surface-2)",
              padding: 8,
              borderRadius: 10,
              border: "1px solid var(--line)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <strong>{t("checkout:confirm_address")}:</strong>
              <span style={{ textAlign: "right" }}>{place?.label || "-"}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                marginTop: 4,
              }}
            >
              <strong>{t("checkout:confirm_phone")}:</strong>
              <span style={{ textAlign: "right" }}>
                {details?.phone || formatMasked(phone9)}
              </span>
            </div>
          </div>
          <div
            style={{
              maxHeight: 180,
              overflow: "auto",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: 8,
            }}
          >
            {items.map((it) => {
              const line = (it.price || 0) * (it.qty || 0);
              const raw = it.raw || it.product || {};
              const name =
                lang === "ru"
                  ? raw.name_ru || raw.name || it.title || it.name || "Товар"
                  : raw.name_uz ||
                    raw.name ||
                    it.title ||
                    it.name ||
                    "Mahsulot";
              return (
                <div
                  key={it.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    padding: "4px 0",
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, lineHeight: 1.2 }}>
                      {name}
                    </div>
                    <div style={{ opacity: 0.7 }}>
                      {it.qty} × {fmtMoney(it.price || 0)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                    {fmtMoney(line)}
                  </div>
                </div>
              );
            })}
            {!items.length && (
              <div style={{ opacity: 0.6, fontSize: 13 }}>
                {lang === "ru" ? "Корзина пуста" : "Savat bo'sh"}
              </div>
            )}
          </div>
          <div style={{ fontSize: 13, display: "grid", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{lang === "ru" ? "Товары" : "Mahsulotlar"}</span>
              <strong>{fmtMoney(subtotal)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{lang === "ru" ? "Доставка" : "Yetkazib berish"}</span>
              <strong>
                {deliveryPrice > 0 ? fmtMoney(deliveryPrice) : "—"}
              </strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px dashed var(--line)",
                paddingTop: 6,
                marginTop: 4,
              }}
            >
              <span>{lang === "ru" ? "Итого" : "Jami"}</span>
              <strong>{fmtMoney(total)}</strong>
            </div>
            {branchName && (
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {lang === "ru" ? "Филиал:" : "Filial:"} {branchName}{" "}
                {distanceKm != null ? `• ${distanceKm} km` : ""}
              </div>
            )}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              <input
                type="checkbox"
                checked={skipConfirm}
                onChange={(e) => {
                  const v = e.target.checked;
                  setSkipConfirm(v);
                  try {
                    localStorage.setItem("ud_skip_confirm", v ? "1" : "0");
                  } catch {
                    /* ignore localStorage */
                  }
                }}
              />
              {t("checkout:confirm_dont_ask")}
            </label>
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}

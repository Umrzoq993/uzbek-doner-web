import { useLangStore } from "../store/lang";

export default function Hero() {
  const lang = useLangStore((s) => s.lang);
  const dict = {
    delivery_time: lang === "ru" ? "40–50 минут" : "40–50 daqiqa",
    to_door: lang === "ru" ? "до двери" : "eshikkacha",
    rating: "4.8",
    rating_label: lang === "ru" ? "рейтинг" : "reyting",
    discount: lang === "ru" ? "3% скидка" : "3% chegirma",
    card: lang === "ru" ? "Uzum карта" : "Uzum kartasi",
    prices: lang === "ru" ? "Цены" : "Narxlar",
    as_in_place: lang === "ru" ? "как в зале" : "joyidadek",
  };
  return (
    <section className="hero">
      <div className="hero__banner" />
      <div className="hero__inner">
        <div className="hero__title">UzbekDoner</div>
        <div className="metrics">
          <div className="metric">
            <b>{dict.delivery_time}</b>
            <div className="metric__cap">{dict.to_door}</div>
          </div>
          <div className="metric">
            <b>{dict.rating}</b>
            <div className="metric__cap">{dict.rating_label}</div>
          </div>
          <div className="metric">
            <b>{dict.discount}</b>
            <div className="metric__cap">{dict.card}</div>
          </div>
          <div className="metric">
            <b>{dict.prices}</b>
            <div className="metric__cap">{dict.as_in_place}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

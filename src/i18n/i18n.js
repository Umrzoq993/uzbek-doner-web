// src/i18n/i18n.js
// Extremely small i18n helper (no external deps) with interpolation support.
import { useLangStore } from "../store/lang";

export const resources = {
  uz: {
    common: {
      brand: "UzbekDoner",
      cart: "Savat",
      cart_empty: "Savat bo‘sh",
      add_to_cart: "Savatga qo‘shish",
      add: "Qo‘shish",
      decrease: "Kamaytirish",
      increase: "Ko‘paytirish",
      category: "Kategoriya",
      back_to_top: "Tepaga qaytish",
      loading: "Yuklanmoqda...",
      piece_suffix: "dona",
      select_address_button: "Manzilni tanlash",
      select_address_help: "Buyurtma berish uchun avval manzilingizni tanlang",
    },
    footer: {
      tagline:
        "Halol, tezkor va mazali taomlar. Onlayn buyurtma bering — biz yetkazib beramiz.",
      contacts: "Aloqa",
      quick_links: "Tez havolalar",
      menu: "Menyu",
      payment: "To‘lov",
      made_with: "Made with ❤️",
    },
    checkout: {
      cart: "Savat",
      cart_empty: "Savat bo‘sh",
      note_for_restaurant: "Kuryer uchun izoh",
      note_placeholder: "Izoh ...",
      address: "Manzil",
      address_not_selected: "Manzil tanlanmagan",
      entrance: "Pod’ezd",
      floor: "Qavat",
      apt: "Kv/Ofis",
      courier_note: "Kuryer uchun izoh",
      pay_method: "To‘lov usuli",
      pay_card: "Karta orqali",
      pay_cash: "Naqd to‘lov",
      pay_cash_sub: "Kuryerga naqd pul orqali",
      pay_card_sub: "Uzcard, Humo, Visa, MasterCard",
      phone_required: "Telefon raqami majburiy.",
      phone_optional: "", // not used anymore
      order: "Buyurtma",
      delivery: "Kuryer xizmati",
      total: "Jami",
      about_order: "Buyurtma haqida",
      products_count: "Mahsulotlar soni: {{count}}",
      submitting: "Yuborilmoqda...",
      submit: "Buyurtma berish",
      toast_cart_empty: "Savat bo‘sh",
      toast_need_address: "Iltimos, manzil tanlang",
      toast_phone_required: "Telefon raqamini to‘liq kiriting",
      toast_card_sent: "So‘rov yuborildi. To‘lovni tasdiqlang.",
      toast_card_fail:
        "To‘lovni amalga oshirib bo‘lmadi. Keyinroq urinib ko‘ring.",
      toast_cash_success: "Buyurtma qabul qilindi! Rahmat 😊",
      toast_cash_fail: "Buyurtmani jo‘natib bo‘lmadi.",
      payment: "To‘lov",
      free_delivery: "Yetkazib berish bepul!",
      branch: "Filial",
      branch_distance_unit: "{{km}} km",
      loading_delivery: "Hisoblanmoqda...",
      delivery_unavailable: "Yetkazib berish mavjud emas",
      confirm_title: "Buyurtmani tasdiqlash",
      confirm_review: "Buyurtmani jo'natishdan oldin tekshiring",
      confirm_address: "Manzil",
      confirm_phone: "Telefon",
      confirm_dont_ask: "Keyingi safar so'ramasin",
      delivery_unavailable_title: "Hududingizga yetkazib berish yo'q",
      delivery_unavailable_body:
        "Afsuski, tanlangan manzil bo'yicha xizmat ko'rsatmaymiz. Boshqa manzil tanlashga urinib ko'ring.",
      delivery_unavailable_change: "Manzilni o'zgartirish",
    },
    product: {
      item: "Mahsulot",
      size: "Hajm",
      extras: "Qo‘shimchalar",
      spicy: "Achchiq",
      unit_price: "Bir dona narxi",
      quantity: "Miqdor",
    },
  },
  ru: {
    common: {
      brand: "UzbekDoner",
      cart: "Корзина",
      cart_empty: "Корзина пуста",
      add_to_cart: "Добавить в корзину",
      add: "Добавить",
      decrease: "Уменьшить",
      increase: "Увеличить",
      category: "Категория",
      back_to_top: "Наверх",
      loading: "Загрузка...",
      piece_suffix: "шт.",
      select_address_button: "Выбрать адрес",
      select_address_help: "Чтобы оформить заказ, сначала выберите адрес",
    },
    footer: {
      tagline: "Халал, быстро и вкусно. Делайте заказ онлайн — мы доставим.",
      contacts: "Контакты",
      quick_links: "Быстрые ссылки",
      menu: "Меню",
      payment: "Оплата",
      made_with: "Сделано с ❤️",
    },
    checkout: {
      cart: "Корзина",
      cart_empty: "Корзина пуста",
      note_for_restaurant: "Комментарий для курьера",
      note_placeholder: "Комментарий...",
      address: "Адрес",
      address_not_selected: "Адрес не выбран",
      entrance: "Подъезд",
      floor: "Этаж",
      apt: "Кв/Офис",
      courier_note: "Комментарий для курьера",
      pay_method: "Способ оплаты",
      pay_card: "Картой",
      pay_cash: "Наличные",
      pay_cash_sub: "Курьеру наличными",
      pay_card_sub: "Uzcard, Humo, Visa, MasterCard",
      phone_required: "Номер телефона обязателен.",
      phone_optional: "", // not used anymore
      order: "Заказ",
      delivery: "Доставка",
      total: "Итого",
      about_order: "О заказе",
      products_count: "Количество товаров: {{count}}",
      submitting: "Отправка...",
      submit: "Оформить заказ",
      toast_cart_empty: "Корзина пуста",
      toast_need_address: "Пожалуйста, выберите адрес",
      toast_phone_required: "Введите полный номер телефона",
      toast_card_sent: "Запрос отправлен. Подтвердите оплату.",
      toast_card_fail: "Не удалось выполнить оплату. Попробуйте позже.",
      toast_cash_success: "Заказ принят! Спасибо 😊",
      toast_cash_fail: "Не удалось отправить заказ.",
      payment: "Оплата",
      free_delivery: "Доставка бесплатна!",
      branch: "Филиал",
      branch_distance_unit: "{{km}} км",
      loading_delivery: "Рассчитывается...",
      delivery_unavailable: "Недоступно",
      confirm_title: "Подтверждение заказа",
      confirm_review: "Проверьте детали перед отправкой",
      confirm_address: "Адрес",
      confirm_phone: "Телефон",
      confirm_dont_ask: "Больше не спрашивать",
      delivery_unavailable_title: "Доставка недоступна",
      delivery_unavailable_body:
        "К сожалению, по выбранному адресу мы не доставляем. Попробуйте указать другой адрес.",
      delivery_unavailable_change: "Изменить адрес",
    },
    product: {
      item: "Товар",
      size: "Размер",
      extras: "Дополнительно",
      spicy: "Остро",
      unit_price: "Цена за штуку",
      quantity: "Количество",
    },
  },
};

function lookup(lang, key) {
  const [ns = "common", k = ""] = key.includes(":")
    ? key.split(":")
    : ["common", key];
  return resources?.[lang]?.[ns]?.[k] ?? resources?.uz?.[ns]?.[k] ?? key;
}

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/{{(\w+)}}/g, (_, v) => vars[v] ?? "");
}

export function useT() {
  const lang = useLangStore((s) => s.lang);
  return (key, vars) => interpolate(lookup(lang, key), vars);
}

export function tRaw(lang, key, vars) {
  return interpolate(lookup(lang, key), vars);
}

// Money formatter hook (currency suffix localized)
export function useMoneyFormatter() {
  const lang = useLangStore((s) => s.lang);
  return (n) =>
    `${Number(n || 0).toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ")} ${
      lang === "ru" ? "сум" : "so‘m"
    }`;
}

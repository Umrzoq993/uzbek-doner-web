import { useState } from "react";
import { useCart } from "../store/cart";
import QtyStepper from "../components/QtyStepper";
import NoteSheet from "../components/NoteSheet";
import SuggestRow from "../components/SuggestRow";
import PayBar from "../components/PayBar";
import { Link, useNavigate } from "react-router-dom";

const BAG_PRODUCT = { id: "bag", name: "Paket", price: 1000, imageUrl: "" };

export default function Cart() {
  const nav = useNavigate();
  const { items, setQty, remove, add, total, note, setNote } = useCart();
  const [noteOpen, setNoteOpen] = useState(false);
  const itemsTotal = total();
  const firstCatId = items[0]?.product?.categoryId ?? null;

  const addBag = () => add(BAG_PRODUCT, 1, null);

  return (
    <section className="page has-paybar">
      <div className="container">
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Savat</div>

          {items.length === 0 && (
            <div className="center">
              Savatingiz bo‘sh.{" "}
              <Link to="/" style={{ marginLeft: 6, color: "var(--brand)" }}>
                Menyuga o‘tish →
              </Link>
            </div>
          )}

          {items.map((i, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: 12,
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div>
                <div style={{ fontWeight: 800 }}>{i.product.name}</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  {(i.product.price + (i.priceDelta || 0)).toLocaleString()}{" "}
                  so‘m • {i.qty} dona
                </div>
              </div>
              <QtyStepper value={i.qty} onChange={(v) => setQty(idx, v)} />
              <button className="btn" onClick={() => remove(idx)}>
                🗑
              </button>
            </div>
          ))}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 12,
              alignItems: "center",
              padding: "10px 0",
            }}
          >
            <div>
              <div style={{ fontWeight: 800 }}>Paket</div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                1000 so‘m
              </div>
            </div>
            <button className="btn" onClick={addBag}>
              +
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 14, marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontWeight: 800 }}>Restoran uchun izoh</div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                {note ? (
                  <i>{note}</i>
                ) : (
                  "Agar allergiya yoki istaklaringiz bo‘lsa, yozib qoldiring."
                )}
              </div>
            </div>
            <button className="btn" onClick={() => setNoteOpen(true)}>
              ✎
            </button>
          </div>
        </div>

        <SuggestRow categoryId={firstCatId} />
      </div>

      <PayBar
        label="To‘lovga o‘tish"
        amount={itemsTotal}
        onClick={() => nav("/checkout")}
      />

      <NoteSheet
        open={noteOpen}
        initial={note}
        onClose={() => setNoteOpen(false)}
        onSave={(t) => setNote(t)}
      />
    </section>
  );
}

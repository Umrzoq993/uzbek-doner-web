import { useEffect, useState } from "react";
import Button from "./ui/Button";

export default function NoteSheet({ open, initial = "", onClose, onSave }) {
  const [text, setText] = useState(initial || "");
  useEffect(() => {
    if (open) setText(initial || "");
  }, [open, initial]);
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__head">
          <div className="sheet__title">Restoran uchun izoh</div>
          <button className="btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="sheet__body">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={300}
            rows={4}
            placeholder="Istak va izohlaringizni yozing…"
            style={{
              width: "100%",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: 12,
              background: "var(--surface-2)",
              resize: "vertical",
            }}
          />
          <div style={{ color: "var(--muted)", fontSize: 12 }}>
            {300 - (text?.length || 0)} ta belgi qoldi
          </div>
        </div>
        <div className="sheet__foot">
          <div />
          <Button
            className="btn--primary"
            onClick={() => {
              onSave(text);
              onClose();
            }}
          >
            Saqlash
          </Button>
        </div>
      </div>
    </div>
  );
}

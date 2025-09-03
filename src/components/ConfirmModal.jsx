import React from "react";

export default function ConfirmModal({
  open,
  title = "Tasdiqlash",
  message,
  confirmText = "Ha",
  cancelText = "Bekor qilish",
  onConfirm,
  onCancel,
  loading,
  children,
  disableBackdropClose = false,
}) {
  if (!open) return null;
  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        if (disableBackdropClose) return;
        onCancel?.();
      }}
    >
      <div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 420 }}
      >
        <div className="sheet__head">
          <div className="sheet__title">{title}</div>
          <button className="btn" onClick={onCancel} disabled={loading}>
            ✕
          </button>
        </div>
        <div className="sheet__body" style={{ fontSize: 15, lineHeight: 1.4 }}>
          {children || message || "Buyurtmani tasdiqlaysizmi?"}
        </div>
        <div
          className="sheet__foot"
          style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
        >
          <button className="btn" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button
            className="btn btn--primary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Input({ label, error, ...rest }) {
  return (
    <label className="field">
      {label && <span className="field__label">{label}</span>}
      <input
        className={`field__control ${error ? "is-error" : ""}`}
        {...rest}
      />
      {error && <span className="field__error">{error}</span>}
    </label>
  );
}

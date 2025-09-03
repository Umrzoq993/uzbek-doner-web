export default function CatTabs({ categories = [], activeId, onChange }) {
  return (
    <nav className="tabs">
      {categories.map((c) => (
        <button
          key={c.id}
          className={`tab ${activeId === c.id ? "is-active" : ""}`}
          onClick={() => onChange(c.id)}
          title={c.name}
        >
          {c.name}
        </button>
      ))}
    </nav>
  );
}

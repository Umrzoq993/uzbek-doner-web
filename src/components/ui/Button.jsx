import { forwardRef, useRef } from "react";

const Button = forwardRef(function Button(
  { className = "", children, onClick, ...rest },
  refFromParent
) {
  const ref = useRef(null);

  const handleClick = (e) => {
    // Ripple
    const btn = refFromParent?.current || ref.current;
    if (btn) {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const d = Math.hypot(r.width, r.height);
      const span = document.createElement("span");
      span.className = "ripple";
      span.style.setProperty("--x", `${x}px`);
      span.style.setProperty("--y", `${y}px`);
      span.style.setProperty("--d", `${d}px`);
      btn.appendChild(span);
      setTimeout(() => span.remove(), 600);
    }
    onClick?.(e);
  };

  return (
    <button
      ref={refFromParent || ref}
      className={`btn ${className}`}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;

// src/components/Img.jsx
import noimg from "../assets/no-image.png";
import { useState } from "react";

export default function Img({ src, alt = "", className = "" }) {
  const [ok, setOk] = useState(true);
  const show = ok && src ? src : noimg;
  return (
    <img
      src={show}
      alt={alt}
      className={className}
      onError={() => setOk(false)}
      loading="lazy"
      decoding="async"
    />
  );
}

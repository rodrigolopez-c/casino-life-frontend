import React from "react";
import { useNavigate } from "react-router-dom";

type Variant = "primary" | "secondary";

type LoginButtonProps = {
  text: string;
  variant?: Variant;
  to?: string;
  query?: Record<string, string | number | boolean>;
  widthRem?: number;
  heightRem?: number;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties; // 👈 nuevo prop
};

const PRIMARY_BG = "rgb(46,46,48)"; // #2E2E30
const SECONDARY_BG = "rgba(46,46,48,0.8)";

const LoginButton: React.FC<LoginButtonProps> = ({
  text,
  variant = "primary",
  to,
  query,
  widthRem,
  heightRem,
  onClick,
  className,
  style, // 👈 nuevo prop
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onClick?.();

    if (to) {
      // construye ?param=value si se pasó query
      const search = query
        ? "?" +
          new URLSearchParams(
            Object.entries(query).reduce<Record<string, string>>((acc, [k, v]) => {
              acc[k] = String(v);
              return acc;
            }, {})
          ).toString()
        : "";
      navigate(to + search);
    }
  };

  const baseStyle: React.CSSProperties = {
    width: widthRem ? `${widthRem}rem` : undefined,
    height: heightRem ? `${heightRem}rem` : undefined,
    background: variant === "secondary" ? SECONDARY_BG : PRIMARY_BG,
    color: "#fff",
    border: "none",
    borderRadius: "0.9rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 1.2rem",
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1,
    transition: "transform 120ms ease",
    cursor: "pointer",
    ...style, // 👈 permite sobreescribir o añadir estilos
  };

  return (
    <button
      type="button"
      aria-label={text}
      onClick={handleClick}
      className={className}
      style={baseStyle}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {text}
    </button>
  );
};

export default LoginButton;
import React, { useState, type FormEvent, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginTextInput.scss";

type Props = {
  onSubmit?: (email: string) => Promise<void> | void;
  backTo?: string;
  autoFocus?: boolean;
  loading?: boolean;
  style?: CSSProperties;
  setEmailStep?: React.Dispatch<React.SetStateAction<boolean>>; // 👈 añadimos esto
};

const LoginTextInput: React.FC<Props> = ({
  onSubmit,
  backTo = "/",
  autoFocus = true,
  loading = false,
  style,
  setEmailStep, // 👈 para manipular el estado del padre
}) => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return;
    await onSubmit?.(email.trim());
  };

  const handleBackClick = () => {
    setEmailStep?.(false); // 👈 cambia el estado a false
    navigate(backTo);      // opcional: redirige si lo necesitas
  };

  return (
    <form className="login-text-input" onSubmit={handleSubmit} noValidate style={style}>
      <label className="sr-only" htmlFor="email">Email</label>

      <input
        id="email"
        type="email"
        placeholder="Enter your email adress..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoFocus={autoFocus}
        autoComplete="email"
        spellCheck={false}
        inputMode="email"
      />

      <button
        type="submit"
        disabled={!isValidEmail(email) || loading}
        aria-disabled={!isValidEmail(email) || loading}
      >
        {loading ? "Please wait..." : "Continue with email"}
      </button>

      <button
        type="button"
        className="back-link"
        onClick={handleBackClick} // 👈 aquí el cambio de estado
      >
        Back to login
      </button>
    </form>
  );
};

export default LoginTextInput;
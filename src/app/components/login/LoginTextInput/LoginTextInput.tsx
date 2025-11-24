import React, { useState, type FormEvent, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginTextInput.scss";

type Props = {
  onSubmit?: (email: string, password: string) => Promise<void> | void;
  backTo?: string;
  autoFocus?: boolean;
  loading?: boolean;
  style?: CSSProperties;
  setEmailStep?: React.Dispatch<React.SetStateAction<boolean>>;
};

const LoginTextInput: React.FC<Props> = ({
  onSubmit,
  backTo = "/",
  autoFocus = true,
  loading = false,
  style,
  setEmailStep,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");
  const navigate = useNavigate();

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step === "email") {
      if (!isValidEmail(email)) return;
      setStep("password");
    } else if (step === "password") {
      await onSubmit?.(email.trim(), password);
    }
  };

  const handleBackClick = () => {
    if (step === "password") {
      setStep("email");
      setPassword("");
    } else {
      setEmailStep?.(false);
      navigate(backTo);
    }
  };

  return (
    <form className="login-text-input" onSubmit={handleSubmit} noValidate style={style}>
      <div
        className="input-group"
        style={{ display: step === "email" ? "flex" : "none" }}
      >
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
      </div>
      <div
        className="input-group"
        style={{ display: step === "password" ? "flex" : "none" }}
      >
        <label className="sr-only" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={
          (step === "email" && !isValidEmail(email)) ||
          (step === "password" && password.trim() === "") ||
          loading
        }
        aria-disabled={loading}
      >
        {loading
          ? "Please wait..."
          : step === "email"
          ? "Continue with email"
          : "Log in"}
      </button>

      <button type="button" className="back-link" onClick={handleBackClick}>
        {step === "password" ? "Back" : "Back to home"}
      </button>
    </form>
  );
};

export default LoginTextInput;
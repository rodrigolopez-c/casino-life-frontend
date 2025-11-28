import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginButton from "../components/login/LoginButton";
import TermsText from "../components/login/TermsText/TermsText";
import LoginTextInput from "../components/login/LoginTextInput/LoginTextInput";
import { useAuth } from "../contexts/AuthContext";
import "./login.scss";
import { useBalance } from "../contexts/BalanceContext";

export default function Login() {
  const [emailStep, setEmailStep] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [formLoading, setFormLoading] = useState(false); // 👈 renombrado
  const { refreshBalance } = useBalance();

  const { loginUser, registerUser, user, loading: authLoading } = useAuth(); // 👈 todo de useAuth()
  const navigate = useNavigate();

  // ✅ Si ya hay usuario autenticado, redirige automáticamente
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/board/games", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // ✅ Maneja login / registro
  async function handleSubmit(email: string, password: string) {
    try {
      setFormLoading(true);
      if (isRegister) {
        await registerUser(email, password);
      } else {
        await loginUser(email, password);
      }

      await refreshBalance();
      
      navigate("/board/games");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message || "Error en autenticación");
    } finally {
      setFormLoading(false);
    }
  }

  // ✅ Mientras se valida el token del AuthContext
  if (authLoading) {
    return <div className="loading-text">Cargando sesión...</div>;
  }

  return (
    <main>
      <div className="LoginBackground">
        <div className="top">
          <img src="/GamesCards/game1.png" alt="" />
          <img src="/GamesCards/game2.png" alt="" />
          <img src="/GamesCards/game3.png" alt="" />
          <img src="/GamesCards/game7.png" alt="" />
          <img src="/GamesCards/game8.png" alt="" />
        </div>
        <div className="bottom">
          <img src="/GamesCards/game4.png" alt="" />
          <img src="/GamesCards/game9.png" alt="" />
          <img src="/GamesCards/game10.png" alt="" />
          <img src="/GamesCards/game6.png" alt="" />
          <img src="/GamesCards/game11.png" alt="" />
        </div>
        <div className="BlackBackground"></div>
      </div>

      <div className="MainLogin">
        <section className="title">
          <img src="logo.png" alt="logo" />
          <h1>Step into the game</h1>
        </section>

        <section className="buttons">
          {/* Sign in */}
          <LoginButton
            text="Sign in with Email"
            widthRem={25}
            heightRem={4}
            onClick={() => {
              setIsRegister(false);
              setEmailStep(true);
            }}
            style={emailStep ? { display: "none" } : {}}
          />

          {/* Register */}
          <LoginButton
            text="Create a Player Account"
            widthRem={25}
            heightRem={4}
            variant="secondary"
            onClick={() => {
              setIsRegister(true);
              setEmailStep(true);
            }}
            style={emailStep ? { display: "none" } : { display: "block" }}
          />

          {/* Step Email / Password */}
          {emailStep ? (
            <LoginTextInput
              setEmailStep={setEmailStep}
              backTo="/login"
              loading={formLoading} // 👈 usa el formLoading local
              onSubmit={handleSubmit}
            />
          ) : null}
        </section>

        <section className="terms">
          <TermsText />
        </section>
      </div>
    </main>
  );
}
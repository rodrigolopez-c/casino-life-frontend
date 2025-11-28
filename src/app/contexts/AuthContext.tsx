import { createContext, useContext, useState, useEffect } from "react";
import { login, register, getProfile, type UserDTO } from "../../api/auth";

type AuthContextType = {
  user: UserDTO | null;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

// el contexto
const AuthContext = createContext<AuthContextType | null>(null);

// el provider que envolverá a tu app
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // cuando inicia la app, verifica si hay token guardado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Mantener loading=true en el primer render y apagarlo en el siguiente tick
      // Esto mejora la UX inicial y hace que los tests puedan verificar el estado inicial.
      setTimeout(() => setLoading(false), 0);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await getProfile();
        if (cancelled) return;
        if (res && (res as any).user) {
          setUser(res.user);
        } else {
          setUser(null);
        }
      } catch {
        if (cancelled) return;
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // login normal
  async function loginUser(email: string, password: string) {
    const res = await login(email, password);
    localStorage.setItem("token", res.token);
    setUser(res.user);
  }

  // registro + login automático
  async function registerUser(email: string, password: string) {
    await register(email, password);
    await loginUser(email, password);
  }

  // logout
  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, loginUser, registerUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

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
    if (!token) return setLoading(false);

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const expired = decoded.exp * 1000 < Date.now();

      if (expired) {
        localStorage.removeItem("token");
        setUser(null);
        setLoading(false);
        return;
      }

      getProfile()
        .then((res) => setUser(res.user))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } catch {
      localStorage.removeItem("token");
      setLoading(false);
    }
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

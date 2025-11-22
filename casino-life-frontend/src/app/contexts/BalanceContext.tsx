import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getMyProfile } from "@/api/profile";

type BalanceContextType = {
  balance: number | null;
  setBalance: React.Dispatch<React.SetStateAction<number | null>>;
  loading: boolean;
  refreshBalance: () => Promise<void>;
};

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // ←–––––––––––––––––––––––––––
  // 🔥 FUNCIÓN GLOBAL PARA RECARGAR EL BALANCE
  // ––––––––––––––––––––––––––––→
  const refreshBalance = async () => {
    try {
      const res = await getMyProfile();
      setBalance(res.user.coins);
    } catch (err) {
      console.error("Error fetching balance:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar balance al montar el provider
  useEffect(() => {
    refreshBalance();
  }, []);

  return (
    <BalanceContext.Provider value={{ balance, setBalance, loading, refreshBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = (): BalanceContextType => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};
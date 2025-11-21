// src/app/contexts/BalanceContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getMyProfile } from "@/api/profile";

type BalanceContextType = {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
};

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(100);
  const [loading, setLoading] = useState(true);

  // 🔥 Cargar balance REAL desde el backend
  useEffect(() => {
    async function fetchBalance() {
      try {
        const res = await getMyProfile(); // ← endpoint /api/profile/me
        setBalance(res.user.coins);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, []);

  return (
    <BalanceContext.Provider value={{ balance, setBalance, loading }}>
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
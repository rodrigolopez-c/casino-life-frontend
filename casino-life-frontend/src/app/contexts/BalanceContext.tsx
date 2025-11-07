import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type BalanceContextType = {
    balance: number;
    setBalance: React.Dispatch<React.SetStateAction<number>>;
};

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [balance, setBalance] = useState<number>(100);

    return (
        <BalanceContext.Provider value={{ balance, setBalance }}>
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
import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Page = "games" | "profile" | "ranking";

type PageContextType = {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
};

// Contexto inicial
const PageContext = createContext<PageContextType | undefined>(undefined);

// Provider
export const PageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>("games");

  return (
    <PageContext.Provider value={{ currentPage, setCurrentPage }}>
      {children}
    </PageContext.Provider>
  );
};

// Custom hook para acceder al contexto
// eslint-disable-next-line react-refresh/only-export-components
export const usePage = (): PageContextType => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("usePage must be used within a PageProvider");
  }
  return context;
};

// src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";

export type AuthUser = {
  user_id: number;
  email: string;
  nickname: string;
  role: string;
  status: string;
} | null;

type AuthContextType = {
  user: AuthUser;
  setUser: (u: AuthUser) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

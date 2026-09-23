"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { loginRequest } from "@/services/api";

type AuthModaltype =
  | "login"
  | "register"
  | "recoveryEmail"
  | "recoveryPassword"
  | null;

interface RecoveryData {
  email: string;
  secretQuestion: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthContextTypes {
  user: User | null;
  token: string | null;

  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;

  activeModal: AuthModaltype;
  openLogin: () => void;
  openRegister: () => void;
  openRecoveryEmail: () => void;
  openRecoveryPassword: () => void;
  recoveryData: RecoveryData | null;
  setRecoveryData: (data: RecoveryData) => void;
  closeModal: () => void;
}

const AuthContext = createContext<AuthContextTypes | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<AuthModaltype>(null);
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  async function login(email: string, password: string, remember: boolean) {
    const data = await loginRequest({ email, password });

    const storage = remember ? localStorage : sessionStorage;

    storage.setItem("token", data.token);
    storage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);
  }

  function openLogin() {
    setTimeout(() => {
      setActiveModal(null);
      setActiveModal("login");
    }, 500);
  }

  function openRegister() {
    setTimeout(() => {
      setActiveModal(null);
      setActiveModal("register");
    }, 500);
  }

  function openRecoveryEmail() {
    setActiveModal("recoveryEmail");
  }

  function openRecoveryPassword() {
    setActiveModal("recoveryPassword");
  }

  function closeModal() {
    setActiveModal(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,

        login,
        logout,

        activeModal,
        openLogin,
        openRegister,
        openRecoveryEmail,
        openRecoveryPassword,
        recoveryData,
        setRecoveryData,
        closeModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}

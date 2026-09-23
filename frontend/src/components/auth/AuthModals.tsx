"use client";

import { useAuth } from "@/contexts/AuthContexts";
import LoginPage from "./Login";
import RegisterPage from "./Register";
import RecoveryEmail from "./RecoveryEmail";
import RecoveryPassword from "./RecoveryPassword";

export default function AuthModals() {
  const { activeModal, closeModal } = useAuth();

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-opacity duration-300 ${
        activeModal
          ? "bg-[#00674F80] opacity-100 z-50 visible"
          : "opacity-0 -z-[100] invisible"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="force-light w-full max-w-lg mx-4 max-h-[95vh] rounded-2xl overflow-hidden bg-white shadow-xl"
      >
        <div className="max-h-[95vh] overflow-y-auto custom-scroll">
        {/* 'hidden' para esconder preservando o que foi digitado)*/}
        <div className={activeModal === "login" ? "block" : "hidden"}>
          <LoginPage />
        </div>
        <div className={activeModal === "register" ? "block" : "hidden"}>
          <RegisterPage />
        </div>
        <div className={activeModal === "recoveryEmail" ? "block" : "hidden"}>
          <RecoveryEmail />
        </div>
        <div
          className={activeModal === "recoveryPassword" ? "block" : "hidden"}
        >
          <RecoveryPassword />
        </div>
        </div>
      </div>
    </div>
  );
}

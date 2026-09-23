"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputForm from "../InputForm";
import ButtonForm from "../ButtonForm";

import { useAuth } from "@/contexts/AuthContexts";
import IconClose from "../IconClose";
import { getProfileRequest, loginRequest } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const { openRegister, openRecoveryEmail, closeModal, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const data = await loginRequest({ email, password });

      const token = data.token;
      localStorage.setItem("token", token);

      const profile = await getProfileRequest(token);

      setPassword("");

      closeModal();

      setTimeout(() => {
        if (profile && Object.keys(profile).length > 0) {
          router.push("/dashboard");
        } else {
          router.push("/anamnese");
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative rounded-2xl bg-white w-full shadow-[0px_0px_42.7px_rgba(0,0,0,0.5)] overflow-hidden">
      <IconClose />
      <div className="flex flex-col justify-center w-full px-6 py-8 md:px-8 md:py-10">
          <div className="mb-6">
            <h1 className="text-4xl font-extrabold mb-2 text-secondary-700">
              Bem vindo(a) de volta!
            </h1>
            <p className="text-xl text-secondary-700 font-semibold">
              Faça login para entrar.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email">Insira seu e-mail:</label>
              <InputForm
                type="email"
                idName="email"
                placeholder="joaofitness@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              ></InputForm>
            </div>
            <label htmlFor="password">Digite sua senha:</label>
            <div className="relative">
              <InputForm
                type={showPassword ? "text" : "password"}
                idName="password"
                placeholder="********"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                maxLength={16}
              ></InputForm>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute flex align-middle right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  id="rememberInput"
                  name="rememberInput"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 appearance-none rounded-full border-2 border-secondary-200 checked:bg-green-500 checked:border-green-500 cursor-pointer"
                />
                <label
                  htmlFor="rememberInput"
                  className="text-sm text-secondary-700"
                >
                  Lembre meu acesso
                </label>
              </div>
              <button
                type="button"
                onClick={openRecoveryEmail}
                className="text-sm underline"
              >
                Esqueceu sua senha?
              </button>
            </div>

            <ButtonForm type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </ButtonForm>
          </form>

          <div className="mt-4 pt-4 border-t border-[#E9E7E7] text-center">
            <p className="text-sm text-secondary-700">
              Ou tá chegando agora na plataforma?{" "}
            </p>
            <button
              onClick={openRegister}
              className="text-grey-200 underline font-semibold  hover:text-secondary-300 transition duration-100 ease-in"
            >
              Cadastre-se já!
            </button>
          </div>
        </div>
      </div>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.44 0 .87-.03 1.28-.09" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

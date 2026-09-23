"use client";

import { useState } from "react";
import { resetPasswordRequest } from "@/services/api";
import { useAuth } from "@/contexts/AuthContexts";
import InputForm from "../InputForm";
import ButtonForm from "../ButtonForm";
import IconClose from "../IconClose";

export default function RecoveryPassword() {
  const { closeModal, openLogin, recoveryData } = useAuth();

  if (!recoveryData) return null;

  const { email, secretQuestion } = recoveryData;

  const [answer, setAnswer] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validatePassword(password: string) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])\S+$/;
    return regex.test(password) && password.length >= 8 && password.length <= 16;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validatePassword(password)) {
      setError("Senha fora do padrão de segurança.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPasswordRequest({
        email,
        secretAnswer: answer,
        newPassword: password,
        confirmNewPassword: confirmPassword,
      });

      setSuccess(response.message || "Senha redefinida com sucesso!");

      setTimeout(() => {
        closeModal();
        openLogin();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={closeModal}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-white p-6"
      >
        <button onClick={closeModal} className="absolute right-4 top-4">
          <IconClose />
        </button>

        <h2 className="text-2xl font-semibold text-gray-900">
          Recupere sua senha
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Crie uma nova senha para continuar sua jornada.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-gray-800">
              Pergunta de segurança:
            </p>
            <p className="mt-1 text-sm italic text-gray-600">
              {secretQuestion}
            </p>
          </div>

          <InputForm
            idName="answer"
            placeholder="Resposta"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />

          {/* Nova senha */}
          <div className="relative">
            <InputForm
              idName="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            ></button>
          </div>

          <p className="text-xs text-gray-500">
            8 a 16 caracteres, maiúscula, minúscula, número e caractere especial (@#$%).
          </p>

          {/* Confirmar senha */}
          <div className="relative">
            <InputForm
              idName="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            ></button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {success && <p className="text-sm text-green-600">{success}</p>}

          <ButtonForm type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar nova senha"}
          </ButtonForm>
        </form>
      </div>
    </div>
  );
}

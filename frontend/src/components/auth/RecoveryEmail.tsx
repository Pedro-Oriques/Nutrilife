"use client";

import { useState } from "react";
import { recoverEmailRequest } from "@/services/api";
import { useAuth } from "@/contexts/AuthContexts";
import InputForm from "../InputForm";
import ButtonForm from "../ButtonForm";
import IconClose from "../IconClose";

export default function RecoveryEmail() {
  const { openRecoveryPassword, closeModal, setRecoveryData } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await recoverEmailRequest({ email });

      setSuccess(
        response?.message || "Se o e-mail existir, enviaremos as instruções.",
      );

      setRecoveryData({
        email,
        secretQuestion: response.secretQuestion,
      });

      setEmail("");
      openRecoveryPassword();
    } catch (err: any) {
      setError(err.message || "Erro ao solicitar recuperação de senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-lg rounded-2xl bg-white p-6">
      <IconClose />
      <h2 className="w-full text-4xl font-extrabold text-secondary-700 ">
        Recupere sua senha
      </h2>

      <p className="mt-1 text-base text-secondary-700 font-semibold max-w-[80%]">
        Insira seu e-mail para verificarmos nossa base de dados.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
        <label htmlFor="recoveryEmail" className="text-base">
          Email:
        </label>
        <InputForm
          idName="recoveryEmail"
          type="email"
          placeholder="usuario@nutrilife.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        {success && <p className="text-sm text-green-600">{success}</p>}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <ButtonForm type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Recuperar senha"}
        </ButtonForm>
      </form>
    </div>
  );
}

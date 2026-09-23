"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerRequest } from "@/services/api";
import ButtonForm from "../ButtonForm";
import InputForm from "../InputForm";
import { useAuth } from "@/contexts/AuthContexts";
import IconClose from "../IconClose";

export default function RegisterPage() {
  const router = useRouter();
  const { openLogin, closeModal } = useAuth();

  const [formData, setFormData] = useState({
    role: "user",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    secretQuestion: "",
    secretAnswer: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const fullNameRegex =
    /^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ']*[\s']?(de|do|da|dos|das)?[\s']?)+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ']*$/;
  const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,16})/;

  const secretQuestions = [
    "Qual sua cor favorita ?",
    "Qual o nome do seu primeiro animal de estimação ?",
    "Qual a primeira escola em que você estudou ?",
    "Qual sua comida favorita ?",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullNameRegex.test(formData.fullName)) {
      setError(
        "O nome deve ter pelo menos duas palavras e começar com maiúsculas.",
      );
      return;
    }
    if (!passwordRegex.test(formData.password)) {
      setError(
        "A senha deve ter entre 8 e 16 caracteres, maiúscula, minúscula, número e especial.",
      );
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("A confirmação de senha deve ser igual à senha");
      return;
    }

    if (!formData.secretQuestion) {
      setError("Selecione uma pergunta de segurança.");
      return;
    }

    if (!formData.secretAnswer.trim()) {
      setError("Informe a resposta da pergunta de segurança.");
      return;
    }

    try {
      setLoading(true);
      await registerRequest(formData);
      setFormData({
        role: "user",
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        secretQuestion: "",
        secretAnswer: "",
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        closeModal();
        openLogin();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative bg-white w-full rounded-2xl px-8 py-6 flex flex-col">
      <IconClose />

      <div className="flex flex-col text-[#002017]">
        <div className="mb-4">
          <h1 className="text-[48px] font-extrabold leading-none text-[#002017] mb-1">
            Faça seu cadastro
          </h1>
          <p className="text-[24px] font-semibold text-[#002017] leading-tight">
            Descubra um novo jeito de cuidar da sua alimentação.
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 p-2 bg-green-100 text-green-700 rounded-md text-sm border border-green-200 font-semibold">
            Cadastro realizado com sucesso.
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-2.5">
          <div className="flex flex-col gap-0.5">
            <label htmlFor="fullName" className="text-[20px] font-semibold tracking-[0.0015em] text-[#002017]">Insira seu nome completo:</label>
            <InputForm idName="fullName" placeholder="João Fitness" value={formData.fullName} onChange={handleChange} />
          </div>

          <div className="flex flex-col gap-0.5">
            <label htmlFor="email" className="text-[20px] font-semibold tracking-[0.0015em] text-[#002017]">Insira seu melhor e-mail:</label>
            <InputForm type="email" idName="email" placeholder="joaofitness@gmail.com" value={formData.email} onChange={handleChange} />
          </div>

          <div className="flex flex-col gap-0.5">
            <label htmlFor="password" className="text-[20px] font-semibold tracking-[0.0015em] text-[#002017]">Crie uma senha:</label>
            <div className="relative">
              <InputForm type={showPassword ? "text" : "password"} idName="password" placeholder="********" value={formData.password} onChange={handleChange} maxLength={16} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute flex align-middle right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10">
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <p className="text-[11px] font-bold text-[#002017] leading-tight tracking-[0.0025em]">
              A senha no mínimo deve ter entre 8 e 16 caracteres, com, pelo menos, uma letra maiúscula, minúscula, caractere especial e números.
            </p>
          </div>

          <div className="flex flex-col gap-0.5">
            <label htmlFor="confirmPassword" className="text-[20px] font-semibold tracking-[0.0015em] text-[#002017]">Confirme sua senha:</label>
            <div className="relative">
              <InputForm type={showConfirmPassword ? "text" : "password"} idName="confirmPassword" placeholder="********" value={formData.confirmPassword} onChange={handleChange} maxLength={16} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute flex align-middle right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10">
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <label htmlFor="secretQuestion" className="text-[20px] font-semibold tracking-[0.0015em] text-[#002017]">Pergunta de segurança:</label>
            <p className="text-[11px] font-bold text-[#002017] leading-tight tracking-[0.0025em]">
              Tenha certeza de se recordar da resposta para essa pergunta. Ela é sua única forma de recuperar uma senha esquecida.
            </p>
            <select
              name="secretQuestion"
              id="secretQuestion"
              value={formData.secretQuestion}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#008F6F] px-3 py-2 text-[16px] text-[#002017] focus:outline-none focus:ring-2 focus:ring-[#008F6F]/30"
              required
            >
              <option value="">Selecione uma pergunta</option>
              {secretQuestions.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-0.5">
            
            <InputForm idName="secretAnswer" placeholder="Digite sua resposta" value={formData.secretAnswer} onChange={handleChange} maxLength={50} />
          </div>

          <ButtonForm type="submit" disabled={loading} className="mt-1 py-2.5 text-[20px] font-semibold disabled:opacity-70">
            {loading ? "Cadastrando..." : "Cadastrar"}
          </ButtonForm>
        </form>

        <div className="flex flex-col items-center justify-center mt-3 pt-3 border-t border-[#E9E7E7]">
          <p className="text-[16px] text-[#002017] tracking-[0.005em]">Ou já tá na sua jornada?</p>
          <button onClick={openLogin} className="text-[20px] font-semibold underline text-[#002017] hover:text-secondary-200 transition tracking-[0.0015em]">
            Faça login já!
          </button>
        </div>
      </div>
    </main>
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

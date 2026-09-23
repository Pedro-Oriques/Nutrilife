"use client";

import { useAuth } from "@/contexts/AuthContexts";

export default function CTASection() {
  const { openRegister } = useAuth();

  return (
    <section className="py-14 md:py-20 px-5 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-secondary-300 to-secondary-200 rounded-3xl px-6 md:px-14 py-14 md:py-20 text-center text-white relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full" />
          <h2 className="text-3xl md:text-5xl font-bold mb-4 relative z-10">
            Comece a transformar sua alimentação hoje
          </h2>
          <p className="text-white/80 text-lg mb-10 relative z-10">
            Milhares de pessoas já estão no controle da sua saúde com o NutriLife.<br />
            É gratuito, rápido e feito para você.
          </p>
          <button
            onClick={openRegister}
            className="bg-white text-secondary-300 font-semibold px-10 py-4 rounded-xl text-lg hover:bg-gray-50 transition-colors shadow-md relative z-10"
          >
            Começar agora →
          </button>
        </div>
      </div>
    </section>
  );
}

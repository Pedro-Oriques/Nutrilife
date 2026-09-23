"use client";

import Image from "next/image";

export default function LandingFooter() {
  return (
    <footer className="bg-white border-t border-gray-100 px-5 md:px-8 py-10 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/branding/logo.svg"
                alt="NutriLife"
                width={28}
                height={28}
              />
              <span className="font-bold text-gray-800">NutriLife</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Controle alimentar inteligente e personalizado para uma vida mais
              saudável.
            </p>
          </div>

          {/* Produto */}
          <div>
            <p className="font-semibold text-gray-700 text-sm mb-3">Produto</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="#como-funciona"
                  className="hover:text-secondary-200 transition-colors"
                >
                  Como funciona
                </a>
              </li>
              <li>
                <a
                  href="#beneficios"
                  className="hover:text-secondary-200 transition-colors"
                >
                  Benefícios
                </a>
              </li>
              <li>
                <a
                  href="#relatorios"
                  className="hover:text-secondary-200 transition-colors"
                >
                  Relatórios
                </a>
              </li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <p className="font-semibold text-gray-700 text-sm mb-3">
              Institucional
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="#"
                  className="hover:text-secondary-200 transition-colors"
                >
                  Sobre nós
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-secondary-200 transition-colors"
                >
                  Contato
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-secondary-200 transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="font-semibold text-gray-700 text-sm mb-3">Legal</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="#"
                  className="hover:text-secondary-200 transition-colors"
                >
                  Termos de uso
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-secondary-200 transition-colors"
                >
                  Privacidade
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <span>© 2026 NutriLife. Todos os direitos reservados.</span>
          <span className="font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">v1.8.0</span>
        </div>
      </div>
    </footer>
  );
}

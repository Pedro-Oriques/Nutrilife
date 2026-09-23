import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-5 px-6 md:px-[85px] bg-secondary-700 dark:bg-[#1a2e26] text-white mt-auto flex flex-col md:flex-row items-center gap-3 md:gap-0 justify-between mb-16 md:mb-0">
      <div className="hidden md:flex items-center gap-2 text-xl font-bold tracking-wide">
        <Image src="/branding/logo.svg" alt="NutriLife" width={24} height={24} />
        NutriLife
      </div>
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-gray-200">
        <Link href="/termos" className="hover:text-white transition">Termos e Condições</Link>
        <Link href="/politicas" className="hover:text-white transition">Políticas de Privacidade</Link>
      </div>
      <span className="font-mono text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded">v1.8.1</span>
    </footer>
  );
}
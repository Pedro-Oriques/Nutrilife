"use client";
import { useAuth } from "@/contexts/AuthContexts";
import Image from "next/image";
export default function Header() {
  const { openLogin } = useAuth();
  return (
    <header className="w-full z-3 flex items-center justify-between px-8 py-6">
      <Image src={"/logoHome.png"} alt="Logo da home" width={216} height={64} />

      <button
        onClick={openLogin}
        className="bg-secondary-200 no-underline
 text-grey-100 px-5 py-2 rounded-lg font-semibold text-lg hover:bg-secondary-300 transition shadow-sm"
      >
        Acessar
      </button>
    </header>
  );
}

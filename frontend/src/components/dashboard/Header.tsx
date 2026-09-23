"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import RightChevron from "@/assets/Right-chevron.svg";
import LogoutModal from "./LogoutModal";
import DarkModeButton from "./DarkModeButton";

export default function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState("Usuário");
  const [currentDate, setCurrentDate] = useState("");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(now);
    setCurrentDate(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        const payload = JSON.parse(new TextDecoder("utf-8").decode(bytes));
        if (payload.username) setUserName(payload.username.split(" ")[0]);
      } catch (e) {
        console.error("Não foi possível ler o nome no token.", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    router.push("/");
  };

  return (
    <>
      <div className="flex justify-between items-start w-full gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl lg:text-[36px] [@media(min-height:781px)]:lg:text-[48px] font-extrabold text-secondary-700 leading-tight break-words">
            Seja bem-vindo,<br className="md:hidden" /> {userName}.
          </h1>
          <div className="flex items-center gap-2 mt-3 text-gray-500 font-medium text-sm md:text-base">
            <p>{currentDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DarkModeButton />
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex justify-center items-center px-4 md:px-[26px] py-[6px] gap-2 md:gap-4 bg-secondary-400 shadow-[0_0_8px_rgba(0,0,0,0.25)] rounded-lg text-white font-medium hover:bg-secondary-300 transition cursor-pointer text-sm md:text-base"
          >
            Sair
            <Image src={RightChevron} alt="Sair" width={16} height={16} />
          </button>
        </div>
      </div>

      {isLogoutModalOpen && (
        <LogoutModal onConfirm={handleLogout} onCancel={() => setIsLogoutModalOpen(false)} />
      )}
    </>
  );
}

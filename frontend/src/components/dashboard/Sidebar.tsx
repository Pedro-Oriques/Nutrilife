"use client";

import HomeIcon from "@/assets/Home.svg";
import ProfileIcon from "@/assets/perfil.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type StaticImport } from "next/dist/shared/lib/get-img-props";
import { GiScales, GiTrophy } from "react-icons/gi";
import { MdBarChart } from "react-icons/md";
import { FaHistory } from "react-icons/fa";

type SidebarLink =
  | {
      href: string;
      icon: string | StaticImport;
      alt: string;
      w: number;
      h: number;
      reactIcon?: never;
    }
  | {
      href: string;
      reactIcon: React.ReactNode;
      alt: string;
      w: number;
      h: number;
      icon?: never;
    };

export default function Sidebar() {
  const pathname = usePathname();

  const links: SidebarLink[] = [
    { href: "/dashboard", icon: HomeIcon, alt: "Home", w: 24, h: 24 },
    {
      href: "/peso",
      reactIcon: <GiScales size={22} color="#C94A31" />,
      alt: "Peso",
      w: 22,
      h: 22,
    },
    {
      href: "/report",
      reactIcon: <MdBarChart size={26} color="#C94A31" />,
      alt: "Relatório",
      w: 22,
      h: 22,
    },
    {
      href: "/gamificacao",
      reactIcon: <GiTrophy size={22} color="#C94A31" />,
      alt: "Gamificação",
      w: 22,
      h: 22,
    },
    {
      href: "/gamificacao/pontos",
      reactIcon: <FaHistory size={20} color="#C94A31" />,
      alt: "Histórico de Pontos",
      w: 20,
      h: 20,
    },
    { href: "/perfil", icon: ProfileIcon, alt: "Perfil", w: 20, h: 20 },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[80px] self-stretch bg-[#E9E7E7] shadow-[8px_0_16px_rgba(0,0,0,0.1)] flex-col items-center py-6 z-10 shrink-0">
        <div className="text-2xl pb-4 border-b border-[#F5AEA7] mb-6 w-full flex justify-center">
          <Image
            src="/Nutrilife.svg"
            alt="Icon Nutrilife"
            width={24}
            height={32}
          />
        </div>
        <nav className="flex flex-col gap-6 text-gray-400 text-xl items-center w-full">
          {links.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                className={`hover:opacity-80 transition ${isActive ? "opacity-100" : "opacity-40"}`}
                href={l.href}
              >
                {l.reactIcon ? (
                  l.reactIcon
                ) : (
                  <Image src={l.icon!} alt={l.alt} width={l.w} height={l.h} />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#E9E7E7] border-t border-[#F5AEA7] flex items-center justify-around py-3 px-4">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${pathname === l.href ? "opacity-100" : "opacity-50"}`}
          >
            {l.reactIcon ? (
              l.reactIcon
            ) : (
              <Image src={l.icon!} alt={l.alt} width={l.w} height={l.h} />
            )}
          </Link>
        ))}
      </nav>
    </>
  );
}

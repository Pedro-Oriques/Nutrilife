import HomeIcon from "@/assets/Home.svg";
import FastfoodIcon from "@/assets/Fastfood.svg";
import CalendarClockIcon from "@/assets/CalendarClock.svg";
import CalendarMonthIcon from "@/assets/CalendarMonth.svg";
import FoodBankIcon from "@/assets/FoodBank.svg";
import WaterDropIcon from "@/assets/WaterDrop.svg";
import ProfileIcon from "@/assets/perfil.svg";

import Image from "next/image";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-[80px] min-h-screen bg-[#E9E7E7] shadow-[8px_0_16px_rgba(0,0,0,0.1)] flex flex-col items-center py-6 z-10 relative">
      {/* Logo */}
      <div className="text-2xl pb-4 border-b border-[#F5AEA7] mb-6 w-full flex justify-center">
        <Image
          src="/Nutrilife.svg"
          alt="Icon Nutrilife"
          width={24}
          height={32}
        />
      </div>

      <nav className="flex flex-col gap-6 text-gray-400 text-xl items-center w-full">
        <Link className="hover:opacity-80 transition" href="/dashboard">
          <Image src={HomeIcon} alt="Home" width={24} height={24} />
        </Link>

        

        <Link className="hover:opacity-80 transition" href="#">
          <Image
            src={CalendarMonthIcon}
            alt="Calendar"
            width={24}
            height={24}
          />
        </Link>

        <Link className="hover:opacity-80 transition" href="/perfil">
          <Image src={ProfileIcon} alt="Perfil" width={24} height={24} />
        </Link>
      </nav>
    </aside>
  );
}

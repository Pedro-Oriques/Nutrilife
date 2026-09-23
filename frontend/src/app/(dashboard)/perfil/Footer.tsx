"use client";
import { useAuth } from "@/contexts/AuthContexts";

export default function Footer() {
  const { openLogin } = useAuth();
  return (
    <footer className="w-full flex items-center justify-between px-8 py-6">

    </footer>
  );
}

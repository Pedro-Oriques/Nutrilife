import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContexts";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Nutri Life",
  description: "Frontend Next.js",
  icons: {
    icon: "/branding/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

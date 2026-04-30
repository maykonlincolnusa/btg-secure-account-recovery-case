import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recovery Admin",
  description: "Painel administrativo de recuperação segura"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Recovery",
  description: "Painel de recuperação segura de conta"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

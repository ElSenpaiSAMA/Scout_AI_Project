import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scout",
  description: "Analiza el mercado con IA en tiempo real",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

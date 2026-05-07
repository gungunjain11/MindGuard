import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/src/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "MindGuard AI",
  description: "Burnout monitoring and wellness support app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Smart Prescription System",
  description: "AI-powered prescription management for doctors, patients, and pharmacies",
};

import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import Chatbot from "@/components/Chatbot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SocketProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            {/* Global floating AI chatbot – visible on every page */}
            <Chatbot />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


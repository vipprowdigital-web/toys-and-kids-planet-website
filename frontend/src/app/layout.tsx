import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import Navbar from "../components/home/Navbar";
import Footer from "../components/home/Footer";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import { CustomerProvider } from "@/context/CustomerContext";
import { CartProvider } from "@/context/CartContext";
import AppConfigProvider from "@/components/providers/AppConfigProvider";
import CategoryProvider from "@/components/providers/CategoryProvider";

export const metadata: Metadata = {
  title: "Toys and Kids Planet | Premium Toys for Every Age",
  description:
    "Discover a world of premium, safe, and educational toys for children of all age groups. Shop building blocks, RC toys, soft toys, STEM kits, and more at Toys and Kids Planet.",
  keywords:
    "toys, kids toys, educational toys, building blocks, STEM toys, baby toys, remote control toys",
  openGraph: {
    title: "Toys and Kids Planet",
    description: "Premium toys for every child, every age.",
    siteName: "Toys and Kids Planet",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream font-body antialiased">
        <AppConfigProvider>
          <CategoryProvider>
            <CustomerProvider>
              <CartProvider>
                <AnnouncementBar />
                <Navbar />
                <main>{children}</main>
                <Footer />
              </CartProvider>
            </CustomerProvider>
          </CategoryProvider>
        </AppConfigProvider>
      </body>
    </html>
  );
}

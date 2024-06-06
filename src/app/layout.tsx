import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "@/components/ui/Provider";
import {Toaster} from "react-hot-toast" //used to create alerts



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatPdf",
 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <Provider>    
    <html lang="en">
      <body className={inter.className}>{children}</body>
      <Toaster/>
        </html>
       
        </Provider>
      </ClerkProvider>
  );
}

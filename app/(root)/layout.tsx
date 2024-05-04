import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "../globals.css";
import Topbar from "@/components/shared/Topbar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";
import Bottombar from "@/components/shared/Bottombar";


const inter = Inter({ subsets: ["latin"] });

export const metadata : Metadata = {
  title: "Threads",
  description: "A Next.Js Meta Threads Application",
};

const Rootlayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Topbar />
           <main className="flex flex-row">
            <LeftSidebar />
             <section className="main-container">
              <div className="w-full max-w4xl">
              {children}
              </div>
             </section>
            <RightSidebar />
           </main>
          <Bottombar />
          </body>
      </html>
    </ClerkProvider>
  );
};

export default Rootlayout;
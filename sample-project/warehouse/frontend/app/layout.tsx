import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "./globals.css";
import { ProviderStore } from "./components/ProviderStore";
import localFont from "next/font/local";
// import { ModalProvider } from "./context/ModalContext";

// Dynamically import Navbar with ssr: false (client-side rendering)
const Navbar = dynamic(() => import("./components/Navbar"), { ssr: false });
const AuthInitializer = dynamic(() => import("./components/AuthInitializer"), { ssr: false });

const maisonFont = localFont({
  src: [
    { path: "../assets/fonts/maison-neue/MaisonNeue-Medium.otf", weight: "500", style: "normal" },
    { path: "../assets/fonts/maison-neue/MaisonNeue-Demi.otf", weight: "600", style: "normal" },
    { path: "../assets/fonts/maison-neue/MaisonNeue-Bold.otf", weight: "700", style: "normal" },
    { path: "../assets/fonts/maison-neue/MaisonNeueExtended-Bold.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-maison-neue",
});

export const metadata: Metadata = {
  title: "IGTC Network",
  description: "IGTC Network",
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${maisonFont.variable} bg-black text-white`}>
        <ProviderStore>
          <AuthInitializer />
            <div className="flex flex-col min-h-screen">
              {/* Navbar */}
              <Navbar />
              {/* Content area with Sidebar and Main Content */}
              <div className="flex flex-1 pt-16">
                {/* <SideBar /> */}
                <main className="flex-1 bg-black text-white">
                  {/* Responsive container */}
                  <div className="w-full max-w-screen-xl mx-auto px-4">
                    {children}
                  </div>
                </main>
              </div>
            </div>
        </ProviderStore>
      </body>
    </html>
  );
}

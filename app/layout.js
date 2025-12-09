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

export const metadata = {
  title: "แผนที่รัศมีจรวดกัมพูชา",
  description:
    "เว็บจำลองรัศมีการยิงจรวดจากกัมพูชา เพื่อช่วยคนไทยมองภาพรวมโซนอันตรายและวางแผนอพยพอย่างระมัดระวัง",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">{children}</main>

          <footer className="w-full border-t border-slate-800 bg-slate-950/90 text-[11px] text-slate-500">
            <div className="max-w-6xl mx-auto px-4 py-2 text-center">
              BoatMousay
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist_Mono, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { BANK_NAME } from "@/lib/constants";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://southernridgeudc.org"),
  title: {
    default: BANK_NAME,
    template: `%s · ${BANK_NAME}`,
  },
  description:
    "E-Banking and operations console for Southern Ridge Union De' Creditos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster theme="light" />
      </body>
    </html>
  );
}

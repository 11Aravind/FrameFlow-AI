import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Malayalam Subtitle AI | Speech to English Subtitle Editor",
  description:
    "Web-first local AI editor that transcribes Malayalam speech and generates synchronized English subtitles with zero mandatory cloud fees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-textPrimary flex flex-col font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}

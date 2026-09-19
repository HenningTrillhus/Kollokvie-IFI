import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { I18nProvider } from "@/lib/i18n/client";
import { getPrefs } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getPrefs();
  return {
    title: "Kollokvie@IFI",
    description: translate(lang, "app.description"),
    appleWebApp: {
      capable: true,
      title: "Kollokvie",
      statusBarStyle: "black-translucent",
    },
  };
}

const LIGHT_BG = "#f3f8fe";
const DARK_BG = "#16181a";

export async function generateViewport(): Promise<Viewport> {
  const { theme } = await getPrefs();
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor:
      theme === "light"
        ? LIGHT_BG
        : theme === "dark"
          ? DARK_BG
          : [
              { media: "(prefers-color-scheme: light)", color: LIGHT_BG },
              { media: "(prefers-color-scheme: dark)", color: DARK_BG },
            ],
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { lang, theme } = await getPrefs();

  return (
    <html
      lang={lang}
      data-theme={theme === "system" ? undefined : theme}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <I18nProvider lang={lang} theme={theme}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

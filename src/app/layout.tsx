import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import { OfflineBanner } from "@/components/offline-banner";
import { OfflineNavigationGuard } from "@/components/offline-navigation-guard";
import { PwaRegister } from "@/components/pwa-register";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FlashyCardyCourse",
  description: "Learn with flashcards",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FlashyCardyCourse",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
      appearance={{ 
        baseTheme: dark,
        elements: {
          formFieldInput__firstName: { display: 'none' },
          formFieldInput__lastName: { display: 'none' },
          formFieldLabel__firstName: { display: 'none' },
          formFieldLabel__lastName: { display: 'none' },
          formFieldRow__firstName: { display: 'none' },
          formFieldRow__lastName: { display: 'none' },
          formFieldRow__name: { display: 'none' },
        }
      }}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en" className="dark">
        <body
          className={`${poppins.variable} antialiased overflow-x-hidden`}
        >
          <PwaRegister />
          <OfflineBanner />
          <OfflineNavigationGuard />
          <SiteHeader />
          {children}
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}

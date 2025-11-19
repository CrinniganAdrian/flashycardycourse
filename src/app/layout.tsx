import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import {
  ClerkProvider,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FlashyCardyCourse",
  description: "Learn with flashcards",
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
          className={`${poppins.variable} antialiased`}
        >
          <header className="flex justify-between items-center p-4 border-b">
            <h1 className="text-xl font-semibold">FlashyCardyCourse</h1>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}

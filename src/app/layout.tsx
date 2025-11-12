import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Button } from "@/components/ui/button";
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
      appearance={{ baseTheme: dark }}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en" className="dark">
        <body
          className={`${poppins.variable} antialiased`}
        >
          <header className="flex justify-between items-center p-4 border-b">
            <h1 className="text-xl font-semibold">FlashyCardyCourse</h1>
            <div className="flex gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button 
                    variant="outline" 
                    className="hover:bg-blue-500/20 hover:border-blue-500 transition-colors"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button 
                    variant="default"
                    className="bg-primary hover:bg-green-600 hover:scale-105 transition-all"
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

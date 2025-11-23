import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton, SignedOut, SignedIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  // If user is already signed in, redirect to dashboard
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">
            FlashyCardy
          </h1>
          <p className="text-2xl text-muted-foreground">
            Your personal flashcard platform
          </p>
        </div>
        
        <SignedOut>
          <div className="flex gap-4 justify-center">
            <SignUpButton mode="modal">
              <Button size="lg">Sign Up</Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button size="lg" variant="outline">Sign In</Button>
            </SignInButton>
          </div>
        </SignedOut>
        
        <SignedIn>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </SignedIn>
      </div>
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        {/* Hero Section */}
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Master Any Subject with
            <span className="text-primary"> Flashcards</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create, organize, and study flashcards efficiently. 
            FlashyCardyCourse helps you learn smarter, not harder.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <SignUpButton mode="modal">
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-lg px-8 py-6 bg-primary hover:bg-green-600 hover:scale-105 transition-all"
            >
              Get Started Free
            </Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-lg px-8 py-6 hover:bg-blue-500/20 hover:border-blue-500 transition-colors"
            >
              Sign In
            </Button>
          </SignInButton>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Organize Decks</h3>
            <p className="text-muted-foreground">
              Create and manage multiple flashcard decks for different subjects
            </p>
          </div>
          
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">Smart Learning</h3>
            <p className="text-muted-foreground">
              Track your progress and focus on what you need to review
            </p>
          </div>
          
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Study Anywhere</h3>
            <p className="text-muted-foreground">
              Access your flashcards from any device, anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

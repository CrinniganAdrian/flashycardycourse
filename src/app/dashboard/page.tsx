import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to learn with flashcards?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Total Decks</h3>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first deck to get started
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Cards Studied</h3>
            <p className="text-3xl font-bold">0</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start studying to track progress
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Study Streak</h3>
            <p className="text-3xl font-bold">0 days</p>
            <p className="text-sm text-muted-foreground mt-2">
              Study daily to build your streak
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-4 px-6 rounded-lg transition-colors text-left">
              <div className="text-lg font-semibold mb-1">
                📚 Create New Deck
              </div>
              <div className="text-sm opacity-90">
                Start organizing your flashcards
              </div>
            </button>

            <button className="bg-secondary hover:bg-secondary/80 font-medium py-4 px-6 rounded-lg transition-colors text-left">
              <div className="text-lg font-semibold mb-1">
                ✏️ Study Mode
              </div>
              <div className="text-sm opacity-90">
                Review your flashcards
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


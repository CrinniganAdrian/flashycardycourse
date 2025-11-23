import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg">
          Start with our free plan or upgrade to Pro for unlimited decks and AI features
        </p>
      </div>
      
      <PricingTable />
    </div>
  );
}


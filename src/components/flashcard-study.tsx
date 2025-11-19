"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Check, X } from "lucide-react";
import type { Card as CardType } from "@/db/queries/types";

interface FlashcardStudyProps {
  cards: CardType[];
  deckId: number;
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function FlashcardStudy({ cards, deckId }: FlashcardStudyProps) {
  const [shuffledCards, setShuffledCards] = useState<CardType[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewedCards, setViewedCards] = useState<Set<number>>(new Set([0]));
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [answeredCards, setAnsweredCards] = useState<Set<number>>(new Set());
  const [showSummary, setShowSummary] = useState(false);
  
  const currentCard = shuffledCards[currentIndex];
  const totalCards = shuffledCards.length;
  const progress = Math.round(((currentIndex + 1) / totalCards) * 100);
  const accuracy = useMemo(() => {
    const total = correctCount + incorrectCount;
    return total > 0 ? Math.round((correctCount / total) * 100) : 0;
  }, [correctCount, incorrectCount]);
  
  // Check if study session is complete
  const isSessionComplete = showSummary;
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setIsFlipped(false);
      setViewedCards((prev) => new Set(prev).add(nextIndex));
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setIsFlipped(false);
    }
  };
  
  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewedCards(new Set([0]));
    setCorrectCount(0);
    setIncorrectCount(0);
    setAnsweredCards(new Set());
    setShowSummary(false);
  };
  
  const handleShuffle = () => {
    setShuffledCards(shuffleArray(cards));
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewedCards(new Set([0]));
    setCorrectCount(0);
    setIncorrectCount(0);
    setAnsweredCards(new Set());
    setShowSummary(false);
  };
  
  const handleCorrect = () => {
    if (!answeredCards.has(currentIndex)) {
      setCorrectCount((prev) => prev + 1);
      setAnsweredCards((prev) => {
        const newAnswered = new Set(prev).add(currentIndex);
        // Check if this was the last card
        if (currentIndex === totalCards - 1) {
          // Use setTimeout to ensure state updates complete before showing summary
          setTimeout(() => setShowSummary(true), 0);
        }
        return newAnswered;
      });
    }
    handleNext();
  };
  
  const handleIncorrect = () => {
    if (!answeredCards.has(currentIndex)) {
      setIncorrectCount((prev) => prev + 1);
      setAnsweredCards((prev) => {
        const newAnswered = new Set(prev).add(currentIndex);
        // Check if this was the last card
        if (currentIndex === totalCards - 1) {
          // Use setTimeout to ensure state updates complete before showing summary
          setTimeout(() => setShowSummary(true), 0);
        }
        return newAnswered;
      });
    }
    handleNext();
  };
  
  // Global keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "y" || e.key === "Y") {
        // Mark as correct - only works when card is flipped
        if (!isFlipped) return; // Ignore if card is not flipped
        
        e.preventDefault();
        // Check if not already answered
        if (!answeredCards.has(currentIndex)) {
          // Update all state separately to avoid nested updates
          setCorrectCount((count) => count + 1);
          setAnsweredCards((answered) => new Set(answered).add(currentIndex));
          
          // Check if this was the last card
          if (currentIndex === totalCards - 1) {
            // Use setTimeout to ensure state updates complete before showing summary
            setTimeout(() => setShowSummary(true), 0);
          }
        }
        
        // Move to next card
        if (currentIndex < totalCards - 1) {
          setIsFlipped(false);
          setViewedCards((viewed) => new Set(viewed).add(currentIndex + 1));
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (e.key === "n" || e.key === "N") {
        // Mark as incorrect - only works when card is flipped
        if (!isFlipped) return; // Ignore if card is not flipped
        
        e.preventDefault();
        // Check if not already answered
        if (!answeredCards.has(currentIndex)) {
          // Update all state separately to avoid nested updates
          setIncorrectCount((count) => count + 1);
          setAnsweredCards((answered) => new Set(answered).add(currentIndex));
          
          // Check if this was the last card
          if (currentIndex === totalCards - 1) {
            // Use setTimeout to ensure state updates complete before showing summary
            setTimeout(() => setShowSummary(true), 0);
          }
        }
        
        // Move to next card
        if (currentIndex < totalCards - 1) {
          setIsFlipped(false);
          setViewedCards((viewed) => new Set(viewed).add(currentIndex + 1));
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentIndex > 0) {
          setIsFlipped(false);
          setCurrentIndex((prev) => prev - 1);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentIndex < totalCards - 1) {
          setIsFlipped(false);
          setViewedCards((viewed) => new Set(viewed).add(currentIndex + 1));
          setCurrentIndex((prev) => prev + 1);
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, totalCards, isFlipped, answeredCards]); // Add dependencies for state checks
  
  return (
    <div className="max-w-3xl mx-auto">
      {!isSessionComplete && (
        <>
          {/* Stats Bar */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <div className="text-2xl font-bold">{currentIndex + 1}/{totalCards}</div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{correctCount}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{incorrectCount}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
          </div>
          
          {/* Accuracy Bar */}
          {(correctCount + incorrectCount) > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Accuracy</span>
                <span className="text-sm font-medium">{accuracy}%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all duration-300"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Flashcard */}
          <div className="perspective-1000 mb-6">
        <div
          className={`relative w-full h-[400px] transition-transform duration-500 transform-style-3d cursor-pointer ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          onClick={handleFlip}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front of card */}
          <Card
            className={`absolute inset-0 backface-hidden flex items-center justify-center p-8 hover:shadow-xl transition-shadow ${
              !isFlipped ? "z-10" : "z-0"
            }`}
            style={{
              backfaceVisibility: "hidden",
            }}
          >
            <CardContent className="w-full text-center">
              <Badge className="mb-4" variant="secondary">
                Front
              </Badge>
              <p className="text-2xl font-medium whitespace-pre-wrap break-words">
                {currentCard.front}
              </p>
              <p className="text-sm text-muted-foreground mt-8">
                Click or press Space to reveal answer
              </p>
            </CardContent>
          </Card>
          
          {/* Back of card */}
          <Card
            className={`absolute inset-0 backface-hidden flex items-center justify-center p-8 hover:shadow-xl transition-shadow ${
              isFlipped ? "z-10" : "z-0"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <CardContent className="w-full text-center">
              <Badge className="mb-4" variant="default">
                Back
              </Badge>
              <p className="text-2xl font-medium whitespace-pre-wrap break-words mb-8">
                {currentCard.back}
              </p>
              
              {/* Correct/Incorrect Buttons - only show on back */}
              {isFlipped && (
                <div className="flex gap-3 justify-center mt-6">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIncorrect();
                    }}
                    variant="destructive"
                    size="lg"
                    disabled={answeredCards.has(currentIndex)}
                  >
                    <X className="h-5 w-5 mr-2" />
                    Incorrect
                    <span className="ml-2 text-xs opacity-70 font-mono">(N)</span>
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCorrect();
                    }}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                    size="lg"
                    disabled={answeredCards.has(currentIndex)}
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Correct
                    <span className="ml-2 text-xs opacity-70 font-mono">(Y)</span>
                  </Button>
                </div>
              )}
              
              {answeredCards.has(currentIndex) && (
                <p className="text-sm text-muted-foreground mt-4">
                  Already answered • Click card to flip back
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          size="lg"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleFlip} size="lg">
            Flip Card
          </Button>
          
          <Button variant="outline" onClick={handleShuffle} size="lg">
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle
          </Button>
          
          <Button variant="outline" onClick={handleRestart} size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart
          </Button>
        </div>
        
        <Button
          variant="default"
          onClick={handleNext}
          disabled={currentIndex === totalCards - 1}
          size="lg"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      
      {/* Keyboard shortcuts hint */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p className="font-medium mb-2">Keyboard Shortcuts</p>
        <div className="flex justify-center gap-6 flex-wrap">
          <span>← Previous</span>
          <span>Space/Enter - Flip</span>
          <span>→ Next</span>
          <span>N - Incorrect</span>
          <span>Y - Correct</span>
        </div>
      </div>
        </>
      )}
      
      {/* Completion message */}
      {isSessionComplete && (
        <div className="mt-6 p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">🎉 Study Session Complete!</h2>
            <p className="text-muted-foreground">
              You've reviewed all {totalCards} cards in this deck.
            </p>
          </div>
          
          {/* Stats Summary */}
          {(correctCount + incorrectCount) > 0 ? (
            <div className="mb-6 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4 bg-background/80 rounded-lg border">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {correctCount}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center p-4 bg-background/80 rounded-lg border">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {incorrectCount}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center p-4 bg-background/80 rounded-lg border">
                <div className="text-3xl font-bold text-primary mb-1">
                  {accuracy}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center p-4 bg-background/80 rounded-lg border max-w-md mx-auto">
              <p className="text-muted-foreground">
                You reviewed all cards but didn't mark any answers.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Use Y (Correct) or N (Incorrect) to track your progress!
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 justify-center flex-wrap">
            <Button
              onClick={handleRestart}
              variant="default"
              size="lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Study Again
            </Button>
            <Button
              onClick={handleShuffle}
              variant="outline"
              size="lg"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle & Restart
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
            >
              <Link href={`/decks/${deckId}`}>
                Back to Deck
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


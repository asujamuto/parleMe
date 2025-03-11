"use client";

import { useState } from "react";
import { FlashcardComponent } from "./ui/flashcard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Flashcard } from "@/app/types/flashcard";

interface StudySessionProps {
  cards: Flashcard[];
  onComplete: () => void;
}

export function StudySession({ cards, onComplete }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studiedCards, setStudiedCards] = useState<Flashcard[]>([...cards]);

  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleConfidenceUpdate = (id: string, confidence: 1 | 2 | 3 | 4 | 5) => {
    setStudiedCards(cards.map(card => 
      card.id === id ? { ...card, confidence, lastReviewed: new Date() } : card
    ));
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground mt-2">
          Card {currentIndex + 1} of {cards.length}
        </p>
      </div>

      <FlashcardComponent
        card={studiedCards[currentIndex]}
        onConfidenceUpdate={handleConfidenceUpdate}
      />

      <div className="flex justify-center mt-8">
        <Button onClick={handleNext}>
          {currentIndex < cards.length - 1 ? "Next Card" : "Complete Session"}
        </Button>
      </div>
    </div>
  );
}
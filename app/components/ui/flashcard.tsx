"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Flashcard } from "@/app/types/flashcard";

interface FlashcardProps {
  card: Flashcard;
  onConfidenceUpdate: (id: string, confidence: 1 | 2 | 3 | 4 | 5) => void;
}

export function FlashcardComponent({ card, onConfidenceUpdate }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="perspective-1000 w-full max-w-md mx-auto">
      <motion.div
        className="relative w-full h-64 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <Card className="absolute w-full h-full p-6 backface-hidden">
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold mb-4">{card.italian}</h2>
            {card.example && (
              <p className="text-sm text-muted-foreground italic">{card.example}</p>
            )}
          </div>
        </Card>

        <Card 
          className="absolute w-full h-full p-6 backface-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold mb-4">{card.polish}</h2>
            <div className="flex gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((level) => (
                <Button
                  key={level}
                  variant={card.confidence === level ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfidenceUpdate(card.id, level as 1 | 2 | 3 | 4 | 5);
                  }}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
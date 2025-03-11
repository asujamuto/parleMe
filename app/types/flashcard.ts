import type { Category } from "@/app/data/initial-cards";

export interface Flashcard {
  id: string;
  italian: string;
  polish: string;
  category: Category;
  example?: string;
  lastReviewed?: Date;
  confidence: 1 | 2 | 3 | 4 | 5; // 1 = struggling, 5 = mastered
};
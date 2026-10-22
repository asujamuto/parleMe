'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  cardSides,
  createSession,
  currentCard,
  getSessionSummary,
  sessionReducer,
  type FlashcardSession as Session,
  type Rating,
  type SessionAction,
} from '@/lib/flashcards/session';
import { formatWordCount } from '@/lib/word-sets/format';
import type { WordEntry, WordSet } from '@/lib/word-sets/types';
import { FlipCard } from './FlipCard';
import { SessionSummary } from './SessionSummary';

type Action = SessionAction | { type: 'restart'; session: Session };

function reducer(state: Session, action: Action): Session {
  return action.type === 'restart' ? action.session : sessionReducer(state, action);
}

interface FlashcardSessionProps {
  set: WordSet;
  entries: WordEntry[];
}

export function FlashcardSession({ set, entries }: FlashcardSessionProps) {
  const router = useRouter();
  const [session, dispatch] = useReducer(reducer, undefined, () =>
    createSession(set.id, entries, { now: Date.now() }),
  );
  const cardRef = useRef<HTMLButtonElement>(null);
  const card = currentCard(session);

  const flip = useCallback(() => dispatch({ type: 'flip' }), []);
  const rate = useCallback((rating: Rating) => {
    dispatch({ type: 'rate', rating, now: Date.now() });
    cardRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      const onControl = target?.closest('button, a, input, textarea, select');

      if ((event.key === ' ' || event.key === 'Enter') && !onControl) {
        event.preventDefault();
        flip();
      } else if (event.key === 'ArrowRight' || event.key === '1') {
        rate('known');
      } else if (event.key === 'ArrowLeft' || event.key === '2') {
        rate('unknown');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flip, rate]);

  const restart = () => dispatch({ type: 'restart', session: createSession(set.id, entries, { now: Date.now() }) });

  if (!card) {
    return <SessionSummary summary={getSessionSummary(session)} onRestart={restart} />;
  }

  const sides = cardSides(card, session.direction);
  const total = session.cards.length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="font-medium">
            Znane: {session.knownCount} / {total}
          </span>
          {entries.length > total && (
            <span className="text-muted-foreground">
              Runda: {total} z {formatWordCount(entries.length)}
            </span>
          )}
        </div>
        <Progress value={(session.knownCount / total) * 100} aria-label="Postęp rundy" />
      </div>

      <FlipCard
        ref={cardRef}
        text={session.flipped ? sides.back : sides.front}
        lang={session.flipped ? sides.backLang : sides.frontLang}
        context={session.flipped ? { text: sides.front, lang: sides.frontLang } : undefined}
        flipped={session.flipped}
        cardKey={card.id}
        onFlip={flip}
      />

      <p aria-live="polite" className="sr-only">
        {session.flipped ? `Tłumaczenie: ${sides.back}` : ''}
      </p>

      {session.flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="h-14 text-base" onClick={() => rate('unknown')}>
            <X className="mr-2 h-5 w-5" aria-hidden="true" />
            Nie znam
          </Button>
          <Button type="button" className="h-14 text-base" onClick={() => rate('known')}>
            <Check className="mr-2 h-5 w-5" aria-hidden="true" />
            Znam
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Spacja — odwróć · ← / 2 — nie znam · → / 1 — znam
        </p>
      )}

      <div className="flex justify-center">
        <Button type="button" variant="ghost" className="h-11" onClick={() => router.push('/')}>
          Zakończ
        </Button>
      </div>
    </div>
  );
}

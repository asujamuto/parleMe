'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  cardSides,
  createSession,
  currentCard,
  getSessionSummary,
  sessionReducer,
  type Direction,
  type FlashcardSession as Session,
  type Rating,
  type SessionAction,
} from '@/lib/flashcards/session';
import type { WordProgress } from '@/lib/progress/types';
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
  progress: Record<string, WordProgress>;
  onRate: (rating: { entryId: string; rating: Rating; firstInSession: boolean }) => void;
  initialDirection: Direction;
  onDirectionChange: (direction: Direction) => void;
  /** Dokąd prowadzą „Zakończ” i „Wróć do zestawu” (panel zestawu). */
  exitHref: string;
}

export function FlashcardSession({
  set,
  entries,
  progress,
  onRate,
  initialDirection,
  onDirectionChange,
  exitHref,
}: FlashcardSessionProps) {
  const router = useRouter();
  const [session, dispatch] = useReducer(reducer, undefined, () =>
    createSession(set.id, entries, { now: Date.now(), progress, direction: initialDirection }),
  );
  // Stan liczony synchronicznie, aby szybkie wielokrotne naciśnięcia nie zapisały oceny dwa razy.
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const cardRef = useRef<HTMLButtonElement>(null);
  const card = currentCard(session);

  const flip = useCallback(() => dispatch({ type: 'flip' }), []);
  const rate = useCallback(
    (rating: Rating) => {
      const before = sessionRef.current;
      const rated = currentCard(before);
      const action: SessionAction = { type: 'rate', rating, now: Date.now() };
      const after = sessionReducer(before, action);
      if (!rated || after === before) return;

      sessionRef.current = after;
      onRate({ entryId: rated.id, rating, firstInSession: !(rated.id in before.firstRatings) });
      dispatch(action);
      cardRef.current?.focus();
    },
    [onRate],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      // Strzałki w przełączniku kierunku przenoszą fokus — nie mogą oceniać karty.
      if (target?.closest('[data-no-card-shortcuts]')) return;
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

  const restart = () =>
    dispatch({
      type: 'restart',
      session: createSession(set.id, entries, { now: Date.now(), progress, direction: session.direction }),
    });

  const changeDirection = (direction: Direction) => {
    dispatch({ type: 'setDirection', direction });
    onDirectionChange(direction);
  };

  if (!card) {
    return <SessionSummary summary={getSessionSummary(session)} onRestart={restart} exitHref={exitHref} />;
  }

  const sides = cardSides(card, session.direction);
  const total = session.cards.length;

  return (
    <div className="space-y-6">
      <div data-no-card-shortcuts className="flex justify-center">
        <ToggleGroup
          type="single"
          variant="outline"
          value={session.direction}
          onValueChange={(value) => {
            if (value === 'it-pl' || value === 'pl-it') changeDirection(value);
          }}
          aria-label="Kierunek fiszek"
        >
          <ToggleGroupItem value="it-pl" className="h-11 px-4">
            IT → PL
          </ToggleGroupItem>
          <ToggleGroupItem value="pl-it" className="h-11 px-4">
            PL → IT
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

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
        <Button type="button" variant="ghost" className="h-11" onClick={() => router.push(exitHref)}>
          Zakończ
        </Button>
      </div>
    </div>
  );
}

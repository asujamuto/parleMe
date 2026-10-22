'use client';

import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FlipCardProps {
  text: string;
  lang: string;
  /** Po odwróceniu: tekst przedniej strony pokazany mniejszym drukiem. */
  context?: { text: string; lang: string };
  flipped: boolean;
  cardKey: string;
  onFlip: () => void;
}

function textSizeClass(text: string) {
  if (text.length <= 30) return 'text-3xl';
  if (text.length <= 80) return 'text-2xl';
  return 'text-xl';
}

export const FlipCard = forwardRef<HTMLButtonElement, FlipCardProps>(function FlipCard(
  { text, lang, context, flipped, cardKey, onFlip },
  ref,
) {
  const reduceMotion = useReducedMotion();

  return (
    <button
      ref={ref}
      type="button"
      onClick={onFlip}
      aria-label={flipped ? undefined : `${text}. Dotknij, aby odwrócić`}
      className="block w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{ perspective: 1000 }}
    >
      <motion.div
        key={`${cardKey}-${flipped ? 'back' : 'front'}`}
        initial={reduceMotion ? false : { rotateY: -90, opacity: 0.4 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
        className={cn(
          'flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm',
          flipped && 'border-primary/40 bg-primary/5',
        )}
      >
        {context && (
          <span lang={context.lang} className="break-words text-center text-sm text-muted-foreground">
            {context.text}
          </span>
        )}
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {lang === 'it' ? 'Włoski' : 'Polski'}
        </span>
        <span lang={lang} className={cn('break-words text-center font-bold', textSizeClass(text))}>
          {text}
        </span>
        {!flipped && <span className="text-sm text-muted-foreground">Dotknij, aby odwrócić</span>}
      </motion.div>
    </button>
  );
});

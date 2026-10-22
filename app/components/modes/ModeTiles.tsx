import Link from 'next/link';
import { Blocks, Footprints, Layers, Timer, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { STUDY_MODES, getTileState, modeHref, type StudyMode, type StudyModeId } from '@/lib/modes/catalog';
import { cn } from '@/lib/utils';

const ICONS: Record<StudyModeId, LucideIcon> = {
  flashcards: Layers,
  'word-tower': Blocks,
  matching: Timer,
  'grammar-runner': Footprints,
};

interface ModeTilesProps {
  setId: string;
  wordCount: number;
  lastModeId?: StudyModeId | null;
}

export function ModeTiles({ setId, wordCount, lastModeId = null }: ModeTilesProps) {
  return (
    <section aria-labelledby="modes-heading" className="space-y-3">
      <h2 id="modes-heading" className="text-xl font-semibold">
        Tryby nauki
      </h2>
      <ul className="grid grid-cols-2 gap-3">
        {STUDY_MODES.map((mode) => (
          <li key={mode.id}>
            <ModeTile mode={mode} setId={setId} wordCount={wordCount} isLast={mode.id === lastModeId} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ModeTile({ mode, setId, wordCount, isLast }: { mode: StudyMode; setId: string; wordCount: number; isLast: boolean }) {
  const Icon = ICONS[mode.id];
  const state = getTileState(mode, wordCount);
  const href = state === 'available' ? modeHref(mode.id, setId) : null;

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <Icon className="h-7 w-7 shrink-0" aria-hidden="true" />
        {isLast && href && <Badge variant="secondary">Ostatnio</Badge>}
      </div>
      <span className="break-words text-base font-semibold leading-tight">{mode.name}</span>
      <span className="text-xs text-muted-foreground sm:text-sm">{mode.description}</span>
      {state === 'coming-soon' && <span className="text-xs font-medium uppercase tracking-wide">Wkrótce</span>}
      {state === 'too-few-words' && (
        <span className="text-xs font-medium">
          Wymaga co najmniej {mode.minWords} {mode.minWords === 1 ? 'słówka' : 'słówek'}
        </span>
      )}
    </>
  );

  const baseClass = 'flex h-full min-h-[44px] flex-col gap-2 rounded-xl border p-4';

  if (!href) {
    return (
      <div aria-disabled="true" className={cn(baseClass, 'border-dashed bg-muted/40 text-muted-foreground')}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        baseClass,
        'bg-card text-card-foreground shadow-sm transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
    >
      {content}
    </Link>
  );
}

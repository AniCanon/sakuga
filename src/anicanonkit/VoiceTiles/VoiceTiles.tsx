import { useRef } from 'react';
import { Icon } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { useRoving } from '../../internal/roving';
import '../../base.css';
import './VoiceTiles.css';

/** Characters: voices to cast from, each in a few words. */
export interface VoiceTilesProps {
  /** The voices: a name, a value and a line on how it sounds. */
  options: { label: string; value?: string; description?: string }[];
  /** The voice chosen. */
  value?: string;
  /** Tiles to a row. */
  columns?: number;
  /** Names the choice for screen readers. */
  label?: string;
  /** No play mark: the choice has nothing to hear yet. */
  silent?: boolean;
  /** Called with the value chosen. */
  onChange?: (value: string) => void;
  /** Extra class on the root element. */
  className?: string;
}

/* Characters: voices to cast from. Each tile is a voice in a few words; choosing one plays it. `silent` tiles have nothing to play
   (an archetype, not a voice yet), so they draw no play mark. */
/**
 * Voices to cast from, each a tile with its name and a few words on how it sounds ("Bright, determined"). Choosing a tile plays
 * the voice and selects it; five across.
 *
 * Not for hearing the voice already cast (`AudioPlayer`); choosing among sound options in the cut (`Waveform`); a direction
 * choice drawn as icons (`OptionTiles`).
 *
 * Accessibility: A radio group named by `label` and one Tab stop: arrows move to a voice and choose it through `onChange`, each
 * a radio read by its name and description and "checked" when chosen; the play mark is hidden.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function VoiceTiles({ options, value, columns, label, silent, onChange, className }: VoiceTilesProps) {
  const box = useRef<HTMLDivElement>(null), keys = useRoving(box, { selector: '.sk-voice', select: true });
  return (
    <div ref={box} onKeyDown={keys} className={cx('sk-voices', className)} role="radiogroup" aria-label={label} style={{ gridTemplateColumns: 'repeat(' + (columns || 5) + ', minmax(0, 1fr))' }}>
      {(options || []).map((o) => {
        const v = o.value !== undefined ? o.value : o.label, on = v === value;
        return (
          <button key={v} type="button" role="radio" aria-checked={on ? 'true' : 'false'} className="sk-voice" onClick={onChange ? () => onChange(v) : undefined}>
            {!silent && <span className="sk-voice__play" aria-hidden="true"><Icon name="play" size="var(--voice-play-icon-size)" /></span>}
            <span className="sk-voice__text"><b>{o.label}</b>{o.description && <small>{o.description}</small>}</span>
          </button>
        );
      })}
    </div>
  );
}

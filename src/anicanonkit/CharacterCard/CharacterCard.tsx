import { AudioPlayer, Icon, type IconName } from '@anicanon/sakuga/ui';
import { CutFace } from '../../ui/CutFace/CutFace';
import { cx } from '../../internal/cx';
import { CharacterStats, type CharacterStat } from '../CharacterStats/CharacterStats';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './CharacterCard.css';

export interface CharacterCardProps {
  /** The character's name, the card's title. */
  name: string;
  /** A one-line role under the name. */
  role?: string;
  /** A portrait stands head to toe at 9:16, as it is drawn; `creature` makes it 16:9. */
  stage?: {
    kind: 'icon' | 'avatar' | 'portrait';
    /** A creature's portrait: 16:9 (a character's is 9:16). */
    creature?: boolean;
    image?: string;
    icon?: IconName;
    alt?: string;
    /** From Sakuga.cropStyle: an avatar stage follows a Cropper as it moves. */
    imageStyle?: string;
  };
  /** Drawn as `CharacterStats` tiles; `changed` rings a stat edited in this session. */
  stats?: (CharacterStat & { icon: IconName })[];
  /** Traits as chips under the stats, each with its icon. */
  traits?: { icon: IconName; label: string }[];
  /** Listen-only player. */
  voice?: { duration: number; value?: number; seed?: number; playing?: boolean; onToggle?: (playing: boolean) => void; onSeek?: (seconds: number) => void };
  /** A quiet line at the card's foot. */
  note?: string;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * A character as one card: stage (silhouette, avatar or 9:16 portrait; 16:9 with `stage.creature`), role, name, stat tiles,
 * traits, an optional listen-only voice and a note. The same card in creation, editing, looks, voice and face flows. Built only
 * from core components and tokens; it lives in AniCanonKit, not the core.
 *
 * Not for a cast member on the cast page (`CastCard`); a character's facts on their own, across their page (`CharacterStats`);
 * a character's face and name in a row or on a series page (`CastAvatar`); one look of a character (`LookPlate`); a place or
 * backdrop being made (`PlaceCard`).
 *
 * Accessibility: A complementary region named by `name` (or "Character"); a portrait's alt is `stage.alt` or the name, an
 * avatar's is `stage.alt` (empty, so hidden, by default), and the silhouette is hidden. The role, name, stats, traits and note
 * read as text, the voice's play button is named for it ("Play Aiko's voice"), and with `voice.onSeek` its waveform is a
 * slider.
 *
 * @version 1.3
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function CharacterCard({ name, role, stage, stats, traits, voice, note, className }: CharacterCardProps) {
  const tx = useWords(ownWords);
  const st = stage || ({} as Partial<NonNullable<CharacterCardProps['stage']>>);
  const pic = st.kind === 'portrait' ? <img className="sk-ccard__portrait" src={st.image} alt={st.alt || name} />
    : st.kind === 'avatar' ? <CutFace src={st.image || ''} imageStyle={st.imageStyle} className="sk-ccard__avatar" alt={st.alt} />
    : <span className="sk-ccard__silhouette" aria-hidden="true"><Icon name={st.icon || 'characters'} size="var(--character-card-silhouette-icon-size)" /></span>;
  return (
    <aside className={cx('sk-ccard', st.kind === 'portrait' && 'sk-ccard--portrait', st.creature && 'sk-ccard--creature', className)} aria-label={name || tx('character')}>
      <div className="sk-ccard__stage">{st.kind === 'portrait' ? <span className="sk-clip">{pic}</span> : pic}</div>
      <div className="sk-ccard__body">
        {role && <span className="sk-ccard__role">{role}</span>}
        <span className="sk-ccard__name">{name}</span>
        {stats && <CharacterStats stats={stats} />}
        {traits && <div className="sk-ccard__traits">{traits.map((t) => <span key={t.label} className="sk-ccard__trait"><Icon name={t.icon} size="var(--character-card-trait-icon-size)" />{t.label}</span>)}</div>}
        {voice && (
          <div className="sk-ccard__voice">
            <AudioPlayer size="sm" duration={voice.duration || 4} value={voice.value || 0} seed={voice.seed}
              label={name ? tx('voiceOf', { name }) : tx('voice')} playing={voice.playing} onToggle={voice.onToggle} onSeek={voice.onSeek} />
          </div>
        )}
        {note && <span className="sk-ccard__note">{note}</span>}
      </div>
    </aside>
  );
}

import { useEffect, useRef, type DragEvent, type MouseEvent, type MouseEventHandler } from 'react';
import { cx } from '../../internal/cx';
import { announce, statusWords } from '../../internal/live';
import { useUid } from '../../internal/uid';
import { Icon, type IconName } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import { Thumb } from '../Thumb/Thumb';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { useLoader } from '../../internal/loader';
import '../../base.css';
import './DropZone.css';

export interface DropZoneProps {
  /** Filled with a picture: the tile shows it (a Thumb) at its own size. Never an icon and a file name for a photo. */
  image?: string;
  /** Filled with a picture: names it. */
  alt?: string;
  /** Filled with a picture: CSS placing it in the tile. */
  imageStyle?: string;
  /** Its Remove in the corner. */
  onRemove?: () => void;
  /** Its Remove in the corner, named "Remove {title}". */
  removeLabel?: string;
  /** `empty`, `busy` while the file is read, or `filled`. */
  state?: 'empty' | 'busy' | 'filled';
  /** What goes here ("Drop a clip, or choose a file"); once filled, the file's name. */
  title?: string;
  /** A quiet line under the title: what it takes. */
  hint?: string;
  /** Default upload. */
  icon?: IconName;
  /** Its height in px. */
  height?: number;
  /** Runs first when it is pressed; call preventDefault to keep the file chooser closed. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** With it, a press opens the file chooser and a drop hands the files over. */
  onFiles?: (files: File[]) => void;
  /** The file chooser's accepted types, as on an input. */
  accept?: string;
  /** Takes several files at once. */
  multiple?: boolean;
  /** Extra class on the root element. */
  className?: string;
}

/* Named by its title, hint and state alone, so the busy loader inside it does not say the title twice. With onFiles a press opens
   the file chooser and a drop hands the files over; onClick runs first and can preventDefault to take the press itself. */
/**
 * Where a file goes: drop or choose. Shows empty, busy (reading the file) and filled states.
 *
 * Not for a page or a list with nothing in it yet (`EmptyState`); a frame waiting for a picture that will be made (`Thumb`);
 * choosing one thing already in the story, such as a place (`Picker`).
 *
 * Accessibility: A button that Tab reaches, named by its `title` and `hint` (and "added" once filled), with the icon hidden;
 * filled with an `image` it is a group named by `title`, its picture's alt is `alt`, and its Remove is a button of its own;
 * while busy it carries aria-busy, says its title and hint once through the page's live region as it starts, and its loader
 * stays quiet. With `onFiles`, Enter, Space or a click open the file chooser (after `onClick`, which can prevent it) and a drop
 * hands the files over.
 *
 * @version 1.2
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function DropZone(props: DropZoneProps) {
  return props.state === 'filled' && props.image ? <Picture {...props} image={props.image} /> : <Zone {...props} />;
}

/* Filled with a picture: a group named by its title, the picture at the tile's own size, and its Remove a button of its own */
function Picture({ image, alt, imageStyle, onRemove, removeLabel, title, height, className }: DropZoneProps & { image: string }) {
  const tx = useWords(ownWords);
  return (
    <div className={cx('sk-drop sk-drop--picture', className)} style={height ? { height } : undefined} role="group" aria-label={title}>
      <Thumb image={image} imageStyle={imageStyle} alt={alt || ''} width="100%" height="100%" radius="md" />
      {onRemove && <span className="sk-drop__remove"><IconButton variant="solid" icon="close" label={removeLabel || tx('removeItem', { name: title || tx('thePicture') })} onClick={onRemove} /></span>}
    </div>
  );
}

function Zone({ state = 'empty', title, hint, icon, height, onClick, onFiles, accept, multiple, className }: DropZoneProps) {
  const AppLoader = useLoader();
  const id = useUid('sk-drop'), file = useRef<HTMLInputElement>(null);
  function hand(list: FileList | null | undefined) { if (onFiles && list && list.length) onFiles(Array.prototype.slice.call(list)); }
  function click(e: MouseEvent<HTMLButtonElement>) {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && onFiles && file.current) file.current.click();
  }
  const drop = onFiles ? { onDragOver: (e: DragEvent) => e.preventDefault(), onDrop: (e: DragEvent) => { e.preventDefault(); hand(e.dataTransfer && e.dataTransfer.files); } } : null;
  const names = [title && id + '-t', hint && id + '-h', state === 'filled' && id + '-s'].filter(Boolean).join(' ');
  /* Busy is said once, through the page's live region, as it starts: the loader inside the button keeps quiet */
  useEffect(() => { if (state === 'busy') announce(statusWords(title, hint)); }, [state]);
  return (
    <>
      <button
        type="button" className={cx('sk-drop', 'sk-drop--' + state, className)} style={height ? { height } : undefined} aria-busy={state === 'busy' ? 'true' : undefined}
        aria-labelledby={names || undefined} onClick={click} {...drop}
      >
        {state === 'busy'
          ? <AppLoader size="var(--drop-loader-size)" label={title} />
          : <span className="sk-drop__icon" aria-hidden="true"><Icon name={state === 'filled' ? 'image' : (icon || 'upload')} size="var(--drop-icon-size)" /></span>}
        {title && <b id={id + '-t'}>{title}</b>}
        {hint && <span id={id + '-h'}>{hint}</span>}
        {state === 'filled' && <span id={id + '-s'} className="sk-sr">added</span>}
      </button>
      {onFiles && <input ref={file} type="file" hidden tabIndex={-1} accept={accept} multiple={multiple} onChange={(e) => { hand(e.target.files); e.target.value = ''; }} />}
    </>
  );
}

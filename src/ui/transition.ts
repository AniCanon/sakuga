import { flushSync } from 'react-dom';
import { soundSurface } from './sound/sound';

/* View transitions are newer than TypeScript 5.5's DOM types */
type ViewTransitionLike = { finished: Promise<void>; ready: Promise<void>; updateCallbackDone: Promise<void>; skipTransition(): void };
type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => ViewTransitionLike };

export interface TransitionOptions {
  /** page: the sk-page rises in. view (default): the sk-view slides in from the side it was chosen on. takeover: a full-screen flow
      rising over the page it came from; 'back' drops it and uncovers that page. */
  kind?: 'page' | 'view' | 'takeover';
  /** `back` reverses it: a view slides in from the other side, a takeover drops away. */
  direction?: 'forward' | 'back';
}

/* Moving between states (README · Motion · Between states): a page arriving, a view swapped inside a page, a flow step. The
   update runs inside a view transition, so the old state is a still that leaves while the new one arrives. A page moves its
   sk-page (everything beside the navigation), rising in; a view or a step moves its sk-view, sliding in from the side it was
   chosen on. What is outside them, the chrome, stays put. A takeover (a full-screen flow, the one with the X) rises over the page it
   was opened from, which dims under it and is uncovered again as the flow drops away on direction 'back'; it is a surface, so with
   sound on it plays open and close. Under reduced motion it crossfades on motion-instant; without view
   transitions it switches at once. */
/**
 * Runs `update` inside a view transition, so a page rises in, a view slides in from the side it was chosen on, or a full-screen
 * flow rises over the page. It returns the transition, or null where there is none.
 */
export function transition(update: () => void, options?: TransitionOptions): ViewTransitionLike | null {
  const doc = document as ViewTransitionDocument, root = doc.documentElement, o = options || {};
  const run = () => flushSync(update);
  if (!doc.startViewTransition) { run(); return null; }
  const back = o.direction === 'back';
  const done = () => { root.removeAttribute('data-sk-move'); root.removeAttribute('data-sk-reduced'); };
  /* The marks go on before the transition starts, since its old still is taken with them; if starting it throws, they come off
     and the state switches at once, so the page is never left dimmed */
  let t: ViewTransitionLike;
  try {
    root.setAttribute('data-sk-move', o.kind === 'page' ? 'page' : o.kind === 'takeover' ? (back ? 'takeover-back' : 'takeover') : back ? 'back' : 'forward');
    if (o.kind === 'takeover') soundSurface(back);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) root.setAttribute('data-sk-reduced', '');
    t = doc.startViewTransition(run);
  } catch {
    done(); run(); return null;
  }
  t.finished.then(done, done);
  return t;
}

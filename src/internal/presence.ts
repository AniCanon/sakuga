import { useEffect, useState } from 'react';
import { motionMs, type MotionName } from './motion';

/* Keeps a closing surface mounted while its exit (class is-leaving) plays, then lets it go. */
export function usePresence(open: boolean, exit: MotionName | `--${string}`): { mounted: boolean; leaving: boolean } {
  const [shown, setShown] = useState(open);
  /* An opening is recorded during render, so the open subtree commits once; from an effect it committed twice */
  if (open && !shown) setShown(true);
  useEffect(() => {
    if (open || !shown) return undefined;
    const t = setTimeout(() => setShown(false), motionMs(exit));
    return () => clearTimeout(t);
  }, [open, shown, exit]);
  return { mounted: open || shown, leaving: !open && shown };
}

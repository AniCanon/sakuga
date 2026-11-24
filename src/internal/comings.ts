import { useLayoutEffect, useRef, useState, type Key } from 'react';
import { motionMs, type MotionName } from './motion';

export interface Coming<T> {
  item: T;
  state: 'arriving' | 'leaving' | null;
}
interface Leaving<T> { item: T; at: number }
interface History<T> {
  keys: (Key | null)[];
  list: T[];
  arriving: Set<Key | null>;
  leaving: Leaving<T>[];
}

/* Render derives arrivals from React state. Only committed lists become the source of exit content;
   suspended renders never change that history. Layout reconciliation retains exits before paint. */
export function useComings<T extends { key: Key | null }>(list: T[], exit: MotionName | `--${string}`): Coming<T>[] {
  const keys = list.map(x => x.key);
  const [history, setHistory] = useState<History<T>>(() => ({ keys, list, arriving: new Set(), leaving: [] }));
  const committed = useRef(list);
  const timers = useRef(new Map<Key | null, ReturnType<typeof setTimeout>>());
  const changed = keys.length !== history.keys.length || keys.some((key, i) => key !== history.keys[i]);
  const present = new Set(keys);
  const arriving = changed ? new Set(keys.filter(key => !history.keys.includes(key))) : history.arriving;

  useLayoutEffect(() => {
    if (changed) {
      const removed = committed.current.map((item, at) => ({ item, at })).filter(x => !present.has(x.item.key));
      const removedKeys = new Set(removed.map(x => x.item.key));
      setHistory({ keys, list, arriving, leaving: history.leaving.filter(x => !present.has(x.item.key) && !removedKeys.has(x.item.key)).concat(removed) });
    }
    committed.current = list;
  });
  useLayoutEffect(() => {
    const leaving = new Set(history.leaving.map(x => x.item.key));
    for (const [key, timer] of timers.current) {
      if (!leaving.has(key)) { clearTimeout(timer); timers.current.delete(key); }
    }
    for (const key of leaving) {
      if (timers.current.has(key)) continue;
      timers.current.set(key, setTimeout(() => {
        timers.current.delete(key);
        setHistory(h => ({ ...h, leaving: h.leaving.filter(x => x.item.key !== key) }));
      }, motionMs(exit)));
    }
  }, [history.leaving, exit]);
  useLayoutEffect(() => () => {
    for (const timer of timers.current.values()) clearTimeout(timer);
    timers.current.clear();
  }, []);

  const out: Coming<T>[] = list.map(item => ({ item, state: arriving.has(item.key) ? 'arriving' : null }));
  const provisional = changed ? history.list.map((item, at) => ({ item, at })).filter(x => !present.has(x.item.key)) : [];
  const exits = new Map(history.leaving.map(x => [x.item.key, x]));
  provisional.forEach(x => exits.set(x.item.key, x));
  [...exits.values()].filter(x => !present.has(x.item.key)).forEach(x => {
    out.splice(Math.min(x.at, out.length), 0, { item: x.item, state: 'leaving' });
  });
  return out;
}

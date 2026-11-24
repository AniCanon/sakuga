import type { ButtonTrailing } from '@anicanon/sakuga/ui';
import { FragmentSoul } from './FragmentSoul/FragmentSoul';
import { type Words } from '../internal/words';

/* AniCanonKit's spend parts: the core's Button and OptionTiles with AniCanon's price in their neutral slots, the fragment mark before it.
   A screen reader hears "fragments" right after the number, before any unit: "~100 fragments", "~10 fragments a second". */
export function fragmentPrice(v: string | undefined, size: string, tx: Words): ButtonTrailing | undefined {
  if (!v) return undefined;
  const m = /^(\S+)(\s.+)$/.exec(v);
  return {
    mark: <FragmentSoul size={size} />,
    value: m ? <>{m[1]}<span className="sk-sr">{' ' + tx('fragmentsUnit')}</span>{m[2]}</> : v,
    label: m ? undefined : tx('fragmentsUnit'),
  };
}

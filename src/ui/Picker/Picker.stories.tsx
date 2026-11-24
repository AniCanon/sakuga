import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { Picker, type PickerProps } from './Picker';

export default { title: 'Sakuga / Containers / Picker' } satisfies StoryDefault;

/* An anchored picker drops under what opened it (the relative box), so each story leaves it room below */
const room = { minHeight: 380 } as const;
const stage = { position: 'relative', width: 340 } as const;

const cast: PickerProps['groups'] = [
  { title: 'Matches', options: [{ label: 'Kiko', hint: 'E.R.A. · at Sé station', initial: 'K' }, { label: 'Ken', hint: 'Heros', initial: 'K' }] },
  { title: 'Already at Sé station', options: [{ label: 'Smith', hint: 'At Sé station', initial: 'S', selected: true }] },
];

function Opened({ label, ...rest }: Omit<PickerProps, 'open' | 'onClose'> & { label: string }) {
  const [open, set] = useState(true);
  return (
    <div style={room}><div style={stage}>
      <Button variant="secondary" size="sm" icon="plus" aria-expanded={open ? 'true' : 'false'} onClick={() => set(!open)}>{label}</Button>
      <Picker {...rest} label={label} open={open} />
    </div></div>
  );
}

export const WithSearch: Story = () => <Opened label="Add someone at Sé station" search={{ defaultValue: 'K' }} groups={cast} />;

export const Options: Story = () => (
  <Opened label="Weather" groups={[{ options: [{ label: 'Clear', icon: 'weather-clear', selected: true }, { label: 'Rain', icon: 'weather-rain', hint: 'Light' }, { label: 'Storm', icon: 'weather-storm', dim: true, hint: 'Not in this season' }] }]} />
);

/* A picture the product draws in an option's slot: AniCanon passes its event glyphs */
export const Media: Story = () => (
  <Opened label="Kind of event" groups={[{ options: [{ label: 'Twist', media: <Icon name="effect-sparks" size="var(--picker-slot-icon-size)" />, selected: true }, { label: 'Clue', media: <Icon name="search" size="var(--picker-slot-icon-size)" />, hint: 'Found later' }] }]} />
);

/* Options that carry a description: aligned to the button's start, the picker is as wide as its options, up to a reading measure */
export const Aligned: Story = () => (
  <Opened label="Use in Studio" align="start" groups={[{ options: [{ label: 'As the opening frame', hint: 'The clip starts on this picture', icon: 'image' }, { label: 'As a reference', hint: 'Studio draws from it, the shot is new', icon: 'bookmark' }] }]} />
);

/* Levels: a place with more than one view opens onto them in the Picker's place, with Back and its title; a place with one view is that view */
export const Levels: Story = () => {
  const [place, setPlace] = useState<string | null>(null);
  const places = [{ title: 'Places', options: [{ label: 'Kagari Lighthouse', hint: '3 views', icon: 'place' as const, opens: true }, { label: 'Low Harbor', hint: '1 view · The quay at dusk', icon: 'place' as const }] }];
  const views = [{ options: [{ label: 'Fresnel Lens Mechanism', icon: 'image' as const }, { label: 'Keeper’s Watch Room', icon: 'image' as const }, { label: 'Spiral Stairwell', icon: 'image' as const }] }];
  return <Opened label="Places" groups={place ? views : places} back={place ? { to: 'Places', title: place, onBack: () => setPlace(null) } : undefined} onSelect={(o) => o.opens && setPlace(o.label)} />;
};

export const Playground: Story<PickerProps> = (args) => <div style={room}><div style={stage}><Picker {...args} groups={cast} /></div></div>;
Playground.args = { label: 'Add someone', open: true, anchored: true };

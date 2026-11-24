import { useState } from 'react';
import type { Story, StoryDefault } from '@ladle/react';
import { Chip, type ChipProps } from './Chip';

export default { title: 'Sakuga / Actions / Chip' } satisfies StoryDefault;

const kinds = ['All', 'Episodes', 'Shorts', 'Manga', 'Following'];

export const Filter: Story = () => {
  const [on, setOn] = useState('All');
  return <Chip.Group label="What to show">{kinds.map((k) => <Chip key={k} selected={on === k} onClick={() => setOn(k)}>{k}</Chip>)}</Chip.Group>;
};

export const Scroll: Story = () => (
  <div style={{ maxWidth: 320 }}>
    <Chip.Group label="What to show" scroll>{kinds.map((k, i) => <Chip key={k} selected={i === 0}>{k}</Chip>)}</Chip.Group>
  </div>
);

export const WithIcon: Story = () => (
  <Chip.Group label="Mood">
    <Chip icon="trait-fierce" selected>Fierce</Chip>
    <Chip icon="heart">Tender</Chip>
  </Chip.Group>
);

export const Soft: Story = () => {
  const [on, setOn] = useState<string[]>(['Fierce', 'Loyal']);
  const toggle = (t: string) => setOn(on.includes(t) ? on.filter((x) => x !== t) : [...on, t]);
  return (
    <Chip.Group label="Traits">
      {['Fierce', 'Loyal', 'Curious', 'Stubborn'].map((t) => <Chip key={t} variant="soft" icon={t === 'Fierce' ? 'trait-fierce' : undefined} selected={on.includes(t)} onClick={() => toggle(t)}>{t}</Chip>)}
    </Chip.Group>
  );
};

/* A choice already made that a press takes away: drawn chosen, named "Remove …" */
export const Removable: Story = () => {
  const [left, setLeft] = useState(['Smith', 'Kiko']);
  return (
    <Chip.Group label="Shown on the map">
      {left.map((n) => <Chip key={n} removable icon="close" onClick={() => setLeft(left.filter((x) => x !== n))}>{n}</Chip>)}
      <Chip variant="soft" removable icon="close">Lisa</Chip>
    </Chip.Group>
  );
};

export const Playground: Story<ChipProps> = (args) => <Chip.Group label="Playground"><Chip {...args} /></Chip.Group>;
Playground.args = { children: 'Episodes', selected: false };
Playground.argTypes = { variant: { options: [undefined, 'soft'], control: { type: 'radio' } } };

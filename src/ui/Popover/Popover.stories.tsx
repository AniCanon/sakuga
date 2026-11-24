import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Popover, type PopoverProps } from './Popover';

export default { title: 'Sakuga / Containers / Popover' } satisfies StoryDefault;

/* An anchored popover drops under what opened it (the relative box), so each story leaves it room below */
const room = { minHeight: 200 } as const;
const stage = { position: 'relative', width: 280 } as const;

function Card() {
  return (
    <>
      <b>The Professor</b>
      <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Held in London since Arthur taken.</span>
      <Button variant="ghost" size="sm" icon="bookmark">Open in Story</Button>
    </>
  );
}

export const HoverCard: Story = () => (
  <div style={room}><div style={stage}>
    <Button variant="secondary" size="sm">The Professor</Button>
    <Popover label="The Professor" style={{ gap: 10, padding: 14 }}><Card /></Popover>
  </div></div>
);

export const Menu: Story = () => {
  const [open, set] = useState(true);
  return (
    <div style={room}><div style={stage}>
      <Button variant="secondary" size="sm" aria-expanded={open ? 'true' : 'false'} onClick={() => set(!open)}>The Professor</Button>
      <Popover open={open} onClose={() => set(false)} label="The Professor" style={{ gap: 10, padding: 14 }}><Card /></Popover>
    </div></div>
  );
};

export const AlignEnd: Story = () => (
  <div style={{ ...room, width: 280, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
    <div style={{ position: 'relative' }}>
      <Button variant="secondary" size="sm">More</Button>
      <Popover label="More" align="end" style={{ padding: 14 }}><span>Lined up with the end edge.</span></Popover>
    </div>
  </div>
);

export const Playground: Story<PopoverProps> = (args) => (
  <div style={room}><div style={stage}>
    <Button variant="secondary" size="sm">The Professor</Button>
    <Popover {...args} style={{ gap: 10, padding: 14 }}><Card /></Popover>
  </div></div>
);
Playground.args = { open: true, label: 'The Professor', anchored: true };
Playground.argTypes = { align: { options: [undefined, 'start', 'end'], control: { type: 'radio' } } };

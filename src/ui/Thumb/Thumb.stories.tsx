import { useState } from 'react';
import type { Story, StoryDefault } from '@ladle/react';
import art from '@design/blobs/70a79c6a67f31e4250d80f3e68d60502.jpg';
import lightMap from '@design/blobs/a50c2f5f4cf861f2a608ea7e6b427222.webp';
import { IconButton } from '../IconButton/IconButton';
import { Thumb, type ThumbProps } from './Thumb';

export default { title: 'Sakuga / Content / Thumb' } satisfies StoryDefault;

const row = { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' } as const;

export const Takes: Story = () => {
  const [on, setOn] = useState(1);
  return (
    <div style={row}>
      {[0, 1, 2].map((i) => <Thumb key={i} image={art} lightMap={lightMap} width={128} height={72} muted={i === 2} selected={on === i} label={'Take ' + (i + 1)} onClick={() => setOn(i)} />)}
    </div>
  );
};

export const Selected: Story = () => <div style={row}><Thumb image={art} alt="Take 2" width={128} height={72} selected /></div>;

export const Muted: Story = () => <div style={row}><Thumb image={art} alt="Take 3" width={128} height={72} muted /></div>;

export const Captioned: Story = () => (
  <div style={{ width: 220 }}>
    <Thumb image={art} alt="" title="Sé station" meta="Backdrop · night" />
  </div>
);

/* Studio's Frames row: a frame's Remove over its top corner */
export const Action: Story = () => (
  <div style={{ width: 160 }}>
    <Thumb image={art} alt="" title="Frame 2" meta="Storyboard" label="Frame 2" onClick={() => {}}
      action={<IconButton variant="media" icon="close" label="Remove Frame 2" />} />
  </div>
);

export const Placeholder: Story = () => <div style={row}><Thumb placeholder="Board drawn when you approve the cut" width={220} height={124} /></div>;

export const PlaceholderFigure: Story = () => <div style={row}><Thumb placeholder="No portrait yet" placeholderIcon="age-adult" width={144} height={256} radius="xl" /></div>;

export const Drawing: Story = () => <div style={{ maxWidth: 320 }}><Thumb placeholder="Drawing the banner" drawing radius="xl" /></div>;

export const Radius: Story = () => (
  <div style={row}>
    <Thumb image={art} width={96} height={96} radius="none" />
    <Thumb image={art} width={96} height={96} radius="md" />
    <Thumb image={art} width={96} height={96} radius="lg" />
    <Thumb image={art} width={96} height={96} radius="xl" />
    <Thumb image={art} width={96} height={96} radius="full" imageStyle="object-position:30% 40%" />
  </div>
);

export const Paper: Story = () => <div style={row}><Thumb image={art} width={96} height={128} fit="contain" paper /></div>;

export const Playground: Story<ThumbProps> = (args) => <div style={{ maxWidth: 320 }}><Thumb image={art} {...args} /></div>;
Playground.args = { alt: 'Sé station', selected: false, muted: false, paper: false };
Playground.argTypes = {
  radius: { options: ['none', 'md', 'lg', 'xl', 'full'], control: { type: 'select' } },
  fit: { options: ['cover', 'contain'], control: { type: 'radio' }, defaultValue: 'cover' },
};

export const Linked: Story = () => (
  <div style={{ width: 260 }}>
    <Thumb image={art} lightMap={lightMap} alt="" title="Sé station" meta="5 views · Centro" href="/places/se-station">
      <span slot="action"><button type="button">Shoot it</button></span>
    </Thumb>
  </div>
);

export const Insertable: Story = () => {
  const [on, setOn] = useState(0);
  const [added, setAdded] = useState<string[]>([]);
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={row}>
        {[0, 1, 2].map((i) => <Thumb key={i} image={art} width={128} height={72} selected={on === i} label={'Take ' + (i + 1)} onClick={() => setOn(i)}
          onInsert={() => setAdded((a) => [...a, 'Take ' + (i + 1)])} dragData={{ kind: 'video', length: 4 }} />)}
      </div>
      <p style={{ margin: 0, color: 'var(--text-secondary)', font: '400 13px/18px var(--font-sans)' }}>{added.length ? 'Added ' + added.join(', ') : 'Nothing added yet'}</p>
    </div>
  );
};

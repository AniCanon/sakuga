import type { Story, StoryDefault } from '@ladle/react';
import { useState, type MouseEvent } from 'react';
import art from '@design/blobs/70a79c6a67f31e4250d80f3e68d60502.jpg';
import lightMap from '@design/blobs/a50c2f5f4cf861f2a608ea7e6b427222.webp';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { List } from '../List/List';
import { Switch } from '../Switch/Switch';
import { ListRow, type ListRowProps } from './ListRow';

export default { title: 'Sakuga / Content / ListRow' } satisfies StoryDefault;

const box = { maxWidth: 520 } as const;
const stay = (e: MouseEvent) => e.preventDefault();

export const Rows: Story = () => (
  <div style={box}>
    <List label="Tracks">
      <ListRow icon="video" title="Takes’ own sound" sub="Voices and sound from each take"><Switch on label="Takes’ own sound" /></ListRow>
      <ListRow icon="volume" title="Cue 2 · wind" sub="Music"><Switch on={false} label="Cue 2" /></ListRow>
    </List>
  </div>
);

export const Selected: Story = () => (
  <div style={box}>
    <List label="Tracks">
      <ListRow icon="volume" title="Cue 1 · rain" sub="Music" />
      <ListRow icon="volume" title="Cue 2 · wind" sub="Music" selected />
    </List>
  </div>
);

export const Attention: Story = () => <div style={box}><List label="Takes"><ListRow image={art} imageWidth={56} imageHeight={32} title="2C · take 3" sub="Waits for your pick" attention /></List></div>;

export const Picture: Story = () => (
  <div style={box}>
    <List label="Takes">
      <ListRow image={art} lightMap={lightMap} imageWidth={56} imageHeight={32} title="2C · take 3" sub="No lines yet"><Button variant="secondary" size="sm">Caption</Button></ListRow>
      <ListRow image={art} imageWidth={56} imageHeight={32} title="2C · take 2" sub="Rejected" muted />
    </List>
  </div>
);

export const Linked: Story = () => (
  <div style={box}>
    <List label="Takes">
      <ListRow image={art} lightMap={lightMap} imageWidth={56} imageHeight={32} title="2A · take 1" sub="Opens in Cut" href="#" onClick={stay} />
      <ListRow title="Lines" sub="Opens the script" onClick={() => undefined} chevron />
    </List>
  </div>
);

export const Meta: Story = () => (
  <div style={box}>
    <List label="Lines">
      <ListRow meta="2:23 + 00f" title="Just once more." sub="Lisa · 2A" href="#" onClick={stay} />
      <ListRow meta="2:31 + 12f" title="Then go." sub="Ren · 2A" href="#" onClick={stay} />
    </List>
  </div>
);

export const Checked: Story = () => {
  const [on, setOn] = useState<Record<string, boolean>>({ a: true });
  const flip = (k: string) => (v: boolean) => setOn({ ...on, [k]: v });
  return (
    <div style={box}>
      <List label="Takes">
        <ListRow title="2A · take 1" sub="Opens in Cut" href="#" onClick={stay} checked={!!on.a} onCheck={flip('a')} />
        <ListRow title="2A · take 2" sub="Opens in Cut" href="#" onClick={stay} checked={!!on.b} onCheck={flip('b')} />
        <ListRow title="2A · take 3" sub="Kept" checked={!!on.c} onCheck={flip('c')} />
      </List>
    </div>
  );
};

export const Loose: Story = () => (
  <div style={box}>
    <List label="Settings" surface>
      <ListRow loose icon="volume" title="Sound" sub="Presses and arrivals"><Switch on label="Sound" /></ListRow>
      <ListRow loose icon="video" title="Autoplay" sub="Takes play as you scroll" chevron href="#" onClick={stay} />
    </List>
  </div>
);

export const Slots: Story = () => (
  <div style={box}>
    <List label="Sounds">
      <ListRow title="Wind">
        <span slot="lead"><IconButton variant="plain" icon="play" label="Play wind" /></span>
        <span slot="main"><b>Wind</b><small>0:12</small></span>
      </ListRow>
    </List>
  </div>
);

export const Playground: Story<ListRowProps> = (args) => <div style={box}><List label="Rows"><ListRow {...args} /></List></div>;
Playground.args = { icon: 'volume', title: 'Cue 2 · wind', sub: 'Music', meta: '', selected: false, attention: false, loose: false, chevron: false };

export const Insertable: Story = () => {
  const [added, setAdded] = useState<string[]>([]);
  return (
    <div style={box}>
      <List label="Sounds">
        {['Rain on glass · 0:12', 'Train doors · 0:04', 'Crowd murmur · 0:20'].map((t, i) => (
          <ListRow key={t} title={t} selected={i === 0} onInsert={() => setAdded((a) => [...a, t])} dragData={{ kind: 'audio', length: 4 }} />
        ))}
      </List>
      <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', font: '400 13px/18px var(--font-sans)' }}>{added.length ? 'Added ' + added.join(', ') : 'Nothing added yet'}</p>
    </div>
  );
};

/* A take that adds itself keeps its More, after Insert, its own stop (1.5) */
export const InsertWithAction: Story = () => (
  <div style={box}><List label="Takes">
    <ListRow image={art} lightMap={lightMap} imageWidth={56} imageHeight={32} title="2C · take 3" sub="Ready" selected onInsert={() => {}} dragData={{ kind: 'video', length: 3 }}
      action={<IconButton variant="plain" icon="more" label="More for 2C · take 3" />} />
    <ListRow image={art} lightMap={lightMap} imageWidth={56} imageHeight={32} title="2C · take 2" sub="Ready" onInsert={() => {}} dragData={{ kind: 'video', length: 3 }}
      action={<IconButton variant="plain" icon="more" label="More for 2C · take 2" />} />
  </List></div>
);


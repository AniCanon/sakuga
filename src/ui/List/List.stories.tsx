import { useState } from 'react';
import type { Story, StoryDefault } from '@ladle/react';
import { ListRow } from '../ListRow/ListRow';
import { Switch } from '../Switch/Switch';
import { List, type ListProps } from './List';

export default { title: 'Sakuga / Content / List' } satisfies StoryDefault;

const rows = [
  <ListRow key="a" icon="video" title="Takes’ own sound" sub="Voices and sound from each take"><Switch on label="Takes’ own sound" /></ListRow>,
  <ListRow key="b" icon="volume" title="Cue 2 · wind" sub="Music"><Switch on={false} label="Cue 2" /></ListRow>,
];

export const Plain: Story = () => <div style={{ maxWidth: 520 }}><List label="Sound">{rows}</List></div>;

export const Surface: Story = () => <div style={{ maxWidth: 520 }}><List label="Sound" surface>{rows}</List></div>;

const drafts = [
  <ListRow key="a" title="Episode 2" sub="Episode · 4:10" href="#episode-2" />,
  <ListRow key="b" title="The popcorn incident" sub="Short · 0:42" href="#popcorn" />,
  <ListRow key="c" title="Volume 1" sub="Manga issue" href="#volume-1" />,
];

/* Two up from a 900 wide list; narrower, the rows stack in one column */
export const Columns: Story = () => <div style={{ maxWidth: 1112 }}><List label="In progress" columns={2}>{drafts}</List></div>;

export const Playground: Story<Omit<ListProps, 'children'>> = (args) => <div style={{ maxWidth: 520 }}><List {...args}>{rows}</List></div>;
Playground.args = { label: 'Sound', surface: true };

/* A grip on each row: drag it, or Up and Down on it */
export const Reorder: Story = () => {
  const [order, setOrder] = useState(['Voices', 'Music', 'Sound']);
  return <div style={{ maxWidth: 520 }}><List label="Tracks" onReorder={(from, to) => setOrder((o) => { const n = [...o]; n.splice(to, 0, n.splice(from, 1)[0]); return n; })}>
    {order.map((t) => <ListRow key={t} icon={t === 'Voices' ? 'mic' : t === 'Music' ? 'volume' : 'sound'} title={t} />)}
  </List></div>;
};


import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { StoryScrubber, type StoryScrubberProps } from './StoryScrubber';

export default { title: 'AniCanonKit / Story / StoryScrubber' } satisfies StoryDefault;

const col = { width: 640 };
const events = (n: number): StoryScrubberProps['events'] => [
  { type: 'event', title: 'Arthur taken', told: ['play'] }, { type: 'clue', title: 'Smoke', told: ['manga'] }, { type: 'twist', title: 'The doors close', told: ['play', 'manga'] },
  { type: 'event', title: 'Fire at Sé', told: ['shorts'], mark: true }, { type: 'revelation', title: 'Cell four', told: ['play'] }, { type: 'goal', title: 'Find Arthur', told: ['image'] },
].map((e, i) => ({ ...e, inside: i < n })) as StoryScrubberProps['events'];
const arcs = (n: number) => [{ name: 'Arc 1', count: 3, on: n > 0 }, { name: 'Arc 2', count: 3, on: n > 3 }];

export const Moment: Story = () => <div style={col}><StoryScrubber events={events(4)} arcs={arcs(4)} handles={[{ at: 4, label: 'After Fire at Sé' }]} fill={[0, 4]} unplaced={{ state: 'none' }} /></div>;

export const Now: Story = () => <div style={col}><StoryScrubber events={events(6)} arcs={arcs(6)} handles={[{ at: 6, label: 'Now' }]} fill={[0, 6]} unplaced={{ on: true, icon: 'image' }} filter="ep" /></div>;

export const Compare: Story = () => <div style={col}><StoryScrubber events={events(4).map((e, i) => ({ ...e, inside: i >= 1 && i < 4 }))} arcs={arcs(4)} handles={[{ at: 1, label: 'After Arthur taken' }, { at: 4, label: 'After Fire at Sé' }]} fill={[1, 4]} unplaced={{ state: 'none' }} filter={false} /></div>;

export const Moving: Story = () => {
  const [at, set] = useState(3), [filter, setFilter] = useState('all');
  const ev = events(at);
  return <div style={col}><StoryScrubber events={ev} arcs={arcs(at)} handles={[{ at, label: at === 6 ? 'Now' : 'After ' + ev[at - 1]?.title }]} fill={[0, at]} onChange={set} filter={filter} onFilter={setFilter} unplaced={{ state: 'none' }} /></div>;
};

/* A long story scrolls, never squeezes: 26 events in a 400 px pane, Now at the end, the earlier events a chevron away */
const long = (at: number): StoryScrubberProps['events'] => Array.from({ length: 26 }, (_, i) => ({ type: (['event', 'clue', 'twist', 'event', 'revelation'] as const)[i % 5], title: 'Event ' + (i + 1), told: [i % 3 ? 'play' : 'manga'], inside: i < at })) as StoryScrubberProps['events'];
export const Long: Story = () => <div style={{ width: 400 }}><StoryScrubber events={long(26)} arcs={[]} handles={[{ at: 26, label: 'Now' }]} fill={[0, 26]} unplaced={{ state: 'none' }} filter={false} /></div>;

/* Opened earlier with start: the handle at the end is held at that edge, named, and pressing it brings it back */
export const LongHeld: Story = () => <div style={{ width: 400 }}><StoryScrubber events={long(26)} arcs={[]} handles={[{ at: 26, label: 'Now' }]} fill={[0, 26]} start={0} unplaced={{ state: 'none' }} filter={false} /></div>;

export const Playground: Story<StoryScrubberProps> = (args) => <div style={col}><StoryScrubber {...args} /></div>;
Playground.args = { events: events(2), arcs: arcs(2), handles: [{ at: 2, label: 'After Smoke' }], fill: [0, 2], unplaced: { state: 'none' }, filter: 'all' };

export const Told: Story = () => <div style={col}><StoryScrubber events={events(6).map((e, i) => ({ ...e, told: i % 2 ? [{ icon: 'play', label: 'Episode 2' }] : [{ icon: 'manga', label: 'Manga issue 1' }, { icon: 'shorts', label: 'Short' }] }))} arcs={arcs(6)} handles={[{ at: 6, label: 'Now' }]} fill={[0, 6]} unplaced={{ state: 'none' }} filter={false} /></div>;

export const AtTheSameTime: Story = () => <div style={col}><StoryScrubber events={events(4).map((e, i) => (i === 2 ? { ...e, with: [{ type: 'twist', title: 'Kiko’s offer', told: [{ icon: 'manga', label: 'Manga issue 1' }] }] } : e))} arcs={arcs(4)} handles={[{ at: 4, label: 'Now' }]} fill={[0, 4]} unplaced={{ state: 'none' }} filter={false} /></div>;

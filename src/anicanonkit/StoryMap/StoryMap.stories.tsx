import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import ken from '@design/blobs/322a5d0e1f576b54cdd579a1f4bf2a2f.jpg';
import station from '@design/blobs/28395b51c4b11a6da6b67d8ff9d1b3e2.jpg';
import { StoryMap, type StoryMapProps } from './StoryMap';

/* The map flows down, as a page lays it out: characters on top, the events in their arcs, places at the foot */
export default {
  title: 'AniCanonKit / Story / StoryMap',
  decorators: [(Story) => <div style={{ width: 760 }}><Story /></div>],
} satisfies StoryDefault;

const hubs: StoryMapProps['hubs'] = [
  { id: 'kiko', kind: 'character', x: 140, y: 60, image: kiko, label: 'Kiko', sub: 'Heros' },
  { id: 'ken', kind: 'character', x: 380, y: 60, image: ken, label: 'Ken', sub: 'Heros' },
  { id: 'smith', kind: 'character', x: 620, y: 60, label: 'Smith', badge: { label: 'Dead', variant: 'alert' }, muted: true },
  { id: 'se', kind: 'place', x: 260, y: 470, image: station, label: 'Sé station', badge: { label: 'Burning', variant: 'alert', icon: 'trait-fierce' } },
  { id: 'harbor', kind: 'place', x: 560, y: 470, label: 'Low Harbor' },
];
const events: StoryMapProps['events'] = [
  { id: 'fire', x: 260, y: 200, type: 'event', label: 'Fire at Sé', sub: 'Episode 1' },
  { id: 'doors', x: 260, y: 290, type: 'twist', label: 'The doors close behind the last train', sub: 'Episode 1' },
  { id: 'ticket', x: 560, y: 245, type: 'clue', label: 'A ticket stub', sub: 'Manga' },
];
const links: StoryMapProps['links'] = [
  { from: 'kiko', to: 'fire' }, { from: 'ken', to: 'doors' }, { from: 'smith', to: 'ticket' },
  { from: 'fire', to: 'se' }, { from: 'doors', to: 'se' }, { from: 'ticket', to: 'harbor' },
];
const groups: StoryMapProps['groups'] = [
  { label: 'Arc 1 · The fire', x0: 140, y0: 150, x1: 380, y1: 340 },
  { label: 'Not placed', x0: 440, y0: 195, x1: 680, y1: 295, dashed: true },
];
const base = { width: 760, height: 540, flow: 'down' as const, hubs, events, links, groups };

export const Map: Story = () => <StoryMap {...base} interactive fit />;

export const Selection: Story = () => (
  <StoryMap {...base} fit chip="Fire at Sé"
    hubs={hubs.map((h) => ({ ...h, state: h.id === 'kiko' || h.id === 'se' ? 'focus' : 'dim' }))}
    events={events.map((e) => ({ ...e, state: e.id === 'fire' ? 'focus' : e.id === 'ticket' ? 'ghost' : 'dim' }))}
    links={links.map((l) => (l.from === 'fire' || l.to === 'fire' ? { ...l, tone: 'accent' } : { ...l, dim: true }))}
    arcs={[{ from: 'fire', to: 'doors', bend: 20 }]} />
);

export const Proposed: Story = () => (
  <StoryMap {...base} fit links={[...links, { from: 'smith', to: 'call', dashed: true, tone: 'accent' }]}
    events={[...events, { id: 'call', x: 620, y: 360, type: 'goal', label: 'Smith calls', state: 'proposed' }, { id: 'stub', x: 140, y: 380, type: 'revelation', label: 'The name on it', state: 'new', badge: { label: 'New', variant: 'new' }, unplaced: true }]} />
);

/* A cause that comes after its effect: the arc in amber over the rest, and both events read "a link with a warning" */
export const Warning: Story = () => (
  <StoryMap {...base} fit links={links} arcs={[{ from: 'doors', to: 'fire', tone: 'warning' }, { from: 'fire', to: 'ticket' }]} />
);

/* Two events of one title: each led by its number, which is never the part cut; the longest line gives way after it */
export const SameTitle: Story = () => (
  <StoryMap {...base} fit links={[]}
    events={[
      { id: 'fire', x: 260, y: 200, type: 'revelation', label: 'Mio watches the rain', lead: 'Event 21', sub: 'Short · video' },
      { id: 'doors', x: 260, y: 290, type: 'event', label: 'Mio watches the rain', lead: 'Event 20', sub: 'Short · still' },
      events[2],
    ]} />
);

export const NoPicture: Story = () => (
  <StoryMap {...base} fit hubs={hubs.map((h) => ({ ...h, image: undefined, figure: h.id === 'ken' ? 'age-child' : undefined }))} />
);

export const KeyOpen: Story = () => <StoryMap {...base} interactive fit keyOpen />;

export const Moving: Story = () => {
  const [moved, set] = useState<Record<string, { x: number; y: number }>>({});
  return (
    <StoryMap {...base} interactive overview zoom={1.5} onMove={(id, x, y) => set((m) => ({ ...m, [id]: { x, y } }))}
      hubs={hubs.map((h) => ({ ...h, ...moved[h.id] }))} events={events.map((e) => ({ ...e, ...moved[e.id] }))} />
  );
};

export const Selectable: Story = () => {
  const [at, set] = useState('fire');
  return (
    <StoryMap {...base} interactive fit legend={false} onSelect={(id) => set(id)}
      hubs={hubs.map((h) => ({ ...h, state: h.id === at ? 'focus' : undefined }))} events={events.map((e) => ({ ...e, state: e.id === at ? 'focus' : undefined }))} />
  );
};

/* A long story: stretches of five, opened on the moment's stretch at 100%; the cast a link runs to, out of view, held at the edge */
const stretch = (c: number) => Array.from({ length: 5 }, (_, i) => ({ id: 's' + c + i, x: 160 + c * 260, y: 190 + i * 76, type: (['event', 'clue', 'twist', 'revelation', 'goal'] as const)[i], label: 'Event ' + (c * 5 + i + 1), sub: 'Episode ' + (c + 1) }));
const longEvents = [0, 1, 2, 3, 4].flatMap(stretch);
const longGroups = [0, 1, 2, 3, 4].map((c) => ({ label: 'Events ' + (c * 5 + 1) + '–' + (c * 5 + 5), x0: 40 + c * 260, y0: 140, x1: 280 + c * 260, y1: 560 }));
const longHubs: StoryMapProps['hubs'] = [
  { id: 'mio', kind: 'character', x: 160, y: 60, image: kiko, label: 'Mio', sub: '8 events' },
  { id: 'genzo', kind: 'character', x: 1200, y: 60, label: 'Genzo', badge: { label: 'Dead', variant: 'alert' }, muted: true },
  { id: 'kagari', kind: 'place', x: 680, y: 640, image: station, label: 'Kagari Lighthouse' },
];
const longLinks = [{ from: 'mio', to: 's44', tone: 'accent' as const }, { from: 'genzo', to: 's44', tone: 'accent' as const }, { from: 's44', to: 'kagari', tone: 'accent' as const }];
export const Long: Story = () => (
  <StoryMap width={1400} height={700} flow="down" hubs={longHubs} events={longEvents.map((e) => ({ ...e, state: e.id === 's44' ? 'focus' : undefined }))} links={longLinks} groups={longGroups}
    frame={stretch(4).map((e) => e.id)} interactive overview held />
);

export const Playground: Story<StoryMapProps> = (args) => <StoryMap {...args} />;
Playground.args = { ...base, label: 'Story map', tools: true, legend: true, interactive: true, overview: true, fit: true, chip: '' };

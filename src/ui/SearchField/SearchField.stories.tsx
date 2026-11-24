import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { SearchField, type SearchFieldProps } from './SearchField';

export default { title: 'Sakuga / Forms / SearchField' } satisfies StoryDefault;

const col = { display: 'grid', gap: 8, maxWidth: 360 } as const;
/* The results drop over what is under the field; the room under it keeps them inside the story */
const room = (px: number) => ({ ...col, paddingBottom: px });

const ALL: NonNullable<SearchFieldProps['results']> = [
  { title: 'Characters', options: [{ label: 'Kiko', hint: 'E.R.A. · Rua da Sé', initial: 'K' }, { label: 'Ken', hint: 'Heros', initial: 'K' }] },
  { title: 'Places', options: [{ label: 'Kioto Station', hint: 'Night market', icon: 'place' }] },
];
const filter = (t: string) => ALL.map((g) => ({ title: g.title, options: g.options.filter((o) => t.trim() && o.label.toLowerCase().startsWith(t.trim().toLowerCase())) })).filter((g) => g.options.length);

export const Rest: Story = () => <div style={col}><SearchField label="Search the series" placeholder="Characters, places, episodes" /></div>;

export const Typed: Story = () => <div style={col}><SearchField label="Search the library" value="rooftop chase" /></div>;

export const Results: Story = () => {
  const [t, setT] = useState('Ki');
  return <div style={room(180)}><SearchField label="Search the series" placeholder="Characters, places, episodes" value={t} results={filter(t)} emptyText="Nothing in this series matches" onChange={setT} onSelect={(o) => setT(o.label)} /></div>;
};

export const ResultsClosed: Story = () => <div style={col}><SearchField label="Search the series" value="Ki" results={filter('Ki')} open={false} /></div>;

export const Searching: Story = () => <div style={room(90)}><SearchField label="Search the series" value="Sé" results={[]} busy /></div>;

export const NothingMatches: Story = () => <div style={room(90)}><SearchField label="Search the series" value="Zubat" results={[]} emptyText="Nothing in this series matches" /></div>;

export const Playground: Story<SearchFieldProps> = (args) => <div style={room(180)}><SearchField {...args} results={filter(args.value || '')} /></div>;
Playground.args = { label: 'Search the series', value: 'K', placeholder: 'Characters, places, episodes', busy: false, busyText: 'Searching', emptyText: 'Nothing matches', open: true, autoFocus: false };

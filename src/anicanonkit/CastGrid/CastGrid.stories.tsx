import type { Story, StoryDefault } from '@ladle/react';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import prof from '@design/blobs/5537a7e99565fd443a8937608d47f460.jpg';
import { CastGrid, type CastGridProps } from './CastGrid';

export default { title: 'AniCanonKit / Characters / CastGrid' } satisfies StoryDefault;

const items: CastGridProps['items'] = [
  { name: 'Kiko', image: kiko, role: 'Leads the E.R.A.', meta: '2 looks', href: '#' },
  { name: 'Rick', initial: 'R', action: { label: 'Face sheet ready, review', tone: 'attention' }, href: '#' },
  { name: 'Sophia', initial: 'S', action: { label: 'Continue setup', tone: 'draft' }, href: '#' },
  { name: 'Tattoo', initial: 'T', action: { label: 'Designing the look', tone: 'busy', time: '0:31' }, href: '#' },
  { name: 'The Professor', image: prof, role: 'Arthur Penhaligon', state: { label: '1 look waiting on you', tone: 'attention' }, href: '#' },
  { name: 'Felix', initial: 'F', href: '#' },
];

export const Six: Story = () => <CastGrid label="Cast" items={items} />;

export const Columns: Story = () => <CastGrid label="Cast" columns={3} items={items} />;

export const Playground: Story<CastGridProps> = (args) => <CastGrid {...args} />;
Playground.args = { label: 'Cast', columns: 3, items };

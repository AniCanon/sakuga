import type { Story, StoryDefault } from '@ladle/react';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import prof from '@design/blobs/5537a7e99565fd443a8937608d47f460.jpg';
import { CastStack, type CastStackProps } from './CastStack';

export default { title: 'Sakuga / Content / CastStack' } satisfies StoryDefault;

const row = { display: 'flex', gap: 40, alignItems: 'center' } as const;
const k = { name: 'Kiko', image: kiko }, p = { name: 'The Professor', image: prof };

export const One: Story = () => <div style={row}><CastStack people={[k]} /></div>;

export const Initials: Story = () => <div style={row}><CastStack people={[k, p, { name: 'Ken' }]} /></div>;

export const More: Story = () => <div style={row}><CastStack people={[k, p, { name: 'Ken' }, { name: 'Lisa' }, { name: 'Smith' }, { name: 'Toddy' }]} /></div>;

export const Size: Story = () => <div style={row}><CastStack people={[k, p, { name: 'Ken' }]} size={32} /></div>;

export const Playground: Story<CastStackProps> = (args) => <CastStack {...args} />;
Playground.args = { people: [k, p, { name: 'Ken' }, { name: 'Lisa' }, { name: 'Smith' }], max: 4, size: 24 };

import type { Story, StoryDefault } from '@ladle/react';
import { FactList, type FactListProps } from './FactList';

export default { title: 'Sakuga / Content / FactList' } satisfies StoryDefault;

const measured = [{ label: 'Brightness', value: '2C is 12% brighter' }, { label: 'Contrast', value: '−4%' }, { label: 'Place and light', value: 'Same · night' }];
const who = [
  { label: 'Age', value: '17', note: 'since Fire at Sé' },
  { label: 'Home', value: 'Lisbon', note: 'from Ep 1' },
  { label: 'Wants', value: 'Her brother back' },
  { label: 'Fears', value: 'The river', note: 'since Ep 3' },
];

export const Columns: Story = () => <div style={{ width: 260 }}><FactList items={measured} /></div>;

export const Grid: Story = () => <div style={{ width: 420 }}><FactList layout="grid" columns={2} items={who} /></div>;

export const Playground: Story<FactListProps> = (args) => <div style={{ width: 420 }}><FactList {...args} /></div>;
Playground.args = { items: who, layout: 'grid', columns: 2 };
Playground.argTypes = { layout: { options: ['columns', 'grid'], control: { type: 'radio' } } };

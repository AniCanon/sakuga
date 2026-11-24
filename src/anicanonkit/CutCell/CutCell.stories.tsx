import type { Story, StoryDefault } from '@ladle/react';
import { CutCell, type CutCellProps } from './CutCell';

export default { title: 'AniCanonKit / Productions / CutCell' } satisfies StoryDefault;

export const Approved: Story = () => <CutCell number="2A" state="approved" />;

export const Waiting: Story = () => <CutCell number="2B" state="waiting" />;

export const WithNote: Story = () => <CutCell number="2C" state="approved" note="V3" />;

export const Playground: Story<CutCellProps> = (args) => <CutCell {...args} />;
Playground.args = { number: '2A', note: 'V3', stateLabel: '' };
Playground.argTypes = { state: { options: ['approved', 'waiting'], control: { type: 'radio' }, defaultValue: 'approved' } };

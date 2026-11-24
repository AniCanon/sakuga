import type { Story, StoryDefault } from '@ladle/react';
import { Button } from '../../ui/Button/Button';
import { ViewHeader, type ViewHeaderProps } from './ViewHeader';

export default { title: 'AniCanonKit / Productions / ViewHeader' } satisfies StoryDefault;

const box = { maxWidth: 720 } as const;

export const View: Story = () => (
  <div style={box}>
    <ViewHeader eyebrow="Plan" title="#5 · Red Line · Sé station" meta="4 of 6 cuts approved · 0:52 of 0:55">
      <Button variant="secondary" size="sm">Ask Maki</Button>
      <Button variant="primary" size="sm">Approve 2 cuts</Button>
    </ViewHeader>
  </div>
);

export const LongTitle: Story = () => (
  <div style={{ maxWidth: 420 }}>
    <ViewHeader eyebrow="Script" title="#5 · Red Line · Sé station, the night the watch stopped" meta="5 scenes">
      <Button variant="primary" size="sm">Plan it</Button>
    </ViewHeader>
  </div>
);

export const Playground: Story<ViewHeaderProps> = (args) => <div style={box}><ViewHeader {...args}><Button variant="primary" size="sm">Approve 2 cuts</Button></ViewHeader></div>;
Playground.args = { eyebrow: 'Plan', title: '#5 · Red Line · Sé station', meta: '4 of 6 cuts approved · 0:52 of 0:55' };

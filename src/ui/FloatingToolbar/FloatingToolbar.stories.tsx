import type { Story, StoryDefault } from '@ladle/react';
import { Button } from '../Button/Button';
import { FloatingToolbar, type FloatingToolbarProps } from './FloatingToolbar';

export default { title: 'Sakuga / Containers / FloatingToolbar' } satisfies StoryDefault;

export const Selection: Story = () => (
  <FloatingToolbar>
    <Button variant="ghost" size="sm" icon="plus">Make it an event</Button>
    <Button variant="ghost" size="sm">Ask Maki</Button>
  </FloatingToolbar>
);

export const OverText: Story = () => (
  <div style={{ position: 'relative', maxWidth: 520, paddingTop: 56, font: '400 16px/26px var(--font-sans)' }}>
    <FloatingToolbar label="Selected words" style={{ position: 'absolute', top: 0, left: 80 }}>
      <Button variant="ghost" size="sm" icon="plus">Make it an event</Button>
      <Button variant="ghost" size="sm">Ask Maki</Button>
    </FloatingToolbar>
    <p style={{ margin: 0 }}>Lisa ran down to the river before the bells, and the fire at Sé had already started.</p>
  </div>
);

export const SelectedTakes: Story = () => (
  <FloatingToolbar label="Selected takes" count="3 selected" onClear={() => undefined}>
    <Button variant="ghost" size="sm" icon="folder">Move to…</Button>
    <Button variant="ghost" size="sm" icon="download">Download</Button>
    <Button variant="ghost" size="sm" icon="trash">Delete</Button>
  </FloatingToolbar>
);

export const Playground: Story<FloatingToolbarProps> = (args) => (
  <FloatingToolbar {...args}>
    <Button variant="ghost" size="sm" icon="plus">Make it an event</Button>
    <Button variant="ghost" size="sm">Ask Maki</Button>
  </FloatingToolbar>
);
Playground.args = { label: 'Selection' };

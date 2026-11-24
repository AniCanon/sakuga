import type { Story, StoryDefault } from '@ladle/react';
import { Text, type TextProps } from './Text';

export default { title: 'Sakuga / Foundations / Text' } satisfies StoryDefault;

const column = { display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520 } as const;

export const Scale: Story = () => (
  <div style={column}>
    <Text variant="eyebrow">Script</Text>
    <Text variant="title-1">The Winter</Text>
    <Text variant="title-2">#5 · Red Line · Sé station</Text>
    <Text variant="title-3">Scene 5</Text>
    <Text variant="title-4">Cut 12</Text>
    <Text variant="body">Kiko steps out of the smoke and stops between them.</Text>
    <Text variant="label">Take 3</Text>
    <Text variant="caption">Arrived 4 min ago · <b>to review</b></Text>
    <Text variant="small">Saved a moment ago</Text>
    <Text variant="micro">Notes</Text>
  </div>
);

export const DisplayAndLead: Story = () => (
  <div style={column}>
    <Text variant="display">Kiko</Text>
    <Text variant="lead">A courier who never looks back, until the night the Red Line stops at a station that closed in 1987.</Text>
  </div>
);

export const Tones: Story = () => (
  <div style={column}>
    <Text variant="body" tone="primary">Primary</Text>
    <Text variant="body" tone="secondary">Secondary</Text>
    <Text variant="body" tone="muted">Muted</Text>
    <Text variant="caption" tone="accent">Waits for you</Text>
    <Text variant="body">A sentence with <Text tone="accent">one coloured word</Text> inside it.</Text>
  </div>
);

export const OnMedia: Story = () => (
  <div style={{ ...column, padding: 24, borderRadius: 12, background: '#2a2140' }}>
    <Text variant="title-3" tone="on-media">The Winter · Episode 1</Text>
    <Text variant="caption" tone="on-media-muted">24 min · Premieres Friday</Text>
  </div>
);

export const Numeric: Story = () => (
  <div style={column}>
    <Text variant="small" numeric>0+00 – 5+00 · 120 frames</Text>
    <Text variant="small" numeric>1+12 – 9+04 · 188 frames</Text>
  </div>
);

export const Mark: Story = () => (
  <div style={column}>
    <Text variant="body">Kiko <Text mark>takes the last train north</Text>, though the story has the line closed.</Text>
    <Text variant="body">She <Text mark="stated">grew up above the bakery</Text> and <Text mark="inferred">never forgave her brother</Text>.</Text>
  </div>
);

export const Playground: Story<TextProps> = (args) => <Text {...args} />;
Playground.args = { children: 'Kiko steps out of the smoke.', numeric: false };
Playground.argTypes = {
  variant: { options: ['display', 'title-1', 'title-2', 'title-3', 'title-4', 'lead', 'body', 'label', 'caption', 'small', 'micro', 'eyebrow'], control: { type: 'select' }, defaultValue: 'body' },
  tone: { options: ['primary', 'secondary', 'muted', 'accent', 'on-media', 'on-media-muted'], control: { type: 'select' } },
};

import type { Story, StoryDefault } from '@ladle/react';
import { EventGlyph, GLYPH_TYPES, type EventGlyphProps } from './EventGlyph';

export default { title: 'AniCanonKit / Story / EventGlyph' } satisfies StoryDefault;

const row = { display: 'flex', gap: 16 };

export const Types: Story = () => <div style={row}>{GLYPH_TYPES.map((t) => <EventGlyph key={t} type={t} size={16} />)}</div>;

export const Muted: Story = () => <div style={row}>{GLYPH_TYPES.map((t) => <EventGlyph key={t} type={t} size={16} tone="muted" />)}</div>;

export const Accent: Story = () => <div style={row}>{GLYPH_TYPES.map((t) => <EventGlyph key={t} type={t} size={16} tone="accent" />)}</div>;

export const Playground: Story<EventGlyphProps> = (args) => <EventGlyph {...args} />;
Playground.args = { type: 'twist', size: 16, tone: 'auto' };
Playground.argTypes = {
  type: { options: GLYPH_TYPES, control: { type: 'select' } },
  tone: { options: ['auto', 'primary', 'accent', 'muted'], control: { type: 'radio' } },
};

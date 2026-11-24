import type { Story, StoryDefault } from '@ladle/react';
import bruce from '@design/blobs/f317ac32ab39c79831025401ea5f69c0.jpg';
import flat from '@design/blobs/b799d8163a18cdbc7695a6064ca99a58.jpg';
import take from '@design/blobs/70a79c6a67f31e4250d80f3e68d60502.jpg';
import { MentionChip, type MentionChipProps } from './MentionChip';

export default { title: 'AniCanonKit / Manga / MentionChip' } satisfies StoryDefault;

const row = { display: 'flex', gap: 8, flexWrap: 'wrap' as const };

export const Kinds: Story = () => (
  <div style={row}>
    <MentionChip name="Bruce" note="Winter coat · tired" image={bruce} />
    <MentionChip kind="place" name="Bruce’s apartment" image={flat} />
    <MentionChip kind="reference" name="rain-look" note="the light" image={take} />
    <MentionChip kind="prop" name="The phone" />
  </div>
);

export const Link: Story = () => <div style={row}><MentionChip name="Bruce" note="Winter coat · tired" image={bruce} href="#bruce" /></div>;

export const Button: Story = () => (
  <div style={row}>
    <MentionChip name="Bruce" note="Winter coat · tired" image={bruce} onClick={() => undefined} expanded={false} controls="cast" label="Bruce, Winter coat, tired. Edit cast" />
  </div>
);

export const Media: Story = () => (
  <div style={{ ...row, padding: 16, background: `center / cover url(${take})` }}>
    <MentionChip tone="media" name="Bruce" note="tired" image={bruce} />
    <MentionChip tone="media" kind="place" name="Bruce’s apartment" image={flat} />
  </div>
);

/* Maki's context and "named here": labels, a live status, an event, an object, one deleted since, each removable */
export const Rich: Story = () => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: 420 }}>
    <MentionChip name="Bruce" image={bruce} note="E.R.A. · lead" removable />
    <MentionChip name="Genzo" figure="age-adult" status={{ label: 'Dead', variant: 'alert' }} removable />
    <MentionChip kind="place" name="Bruce’s apartment" image={flat} status={{ label: 'Burning', variant: 'alert', icon: 'trait-fierce' }} />
    <MentionChip kind="event" type="clue" name="A ticket stub" />
    <MentionChip kind="object" name="The logbook" />
    <MentionChip kind="faction" name="Harbor Watch" />
    <MentionChip kind="object" name="The red watch" missing />
  </div>
);

export const Playground: Story<MentionChipProps> = (args) => <MentionChip {...args} />;
Playground.args = { name: 'Bruce', note: 'Winter coat · tired', image: bruce, kind: 'character' };
Playground.argTypes = { kind: { options: ['character', 'place', 'reference', 'object', 'event', 'faction'], control: { type: 'radio' } } };

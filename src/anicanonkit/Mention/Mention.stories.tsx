import type { Story, StoryDefault } from '@ladle/react';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import { Mention, type MentionProps } from './Mention';

export default { title: 'AniCanonKit / Writing / Mention' } satisfies StoryDefault;

export const InProse: Story = () => <p>After the fire, <Mention>Toddy</Mention> wires a watch in <Mention kind="place">Toddy’s bedroom</Mention>, as in <Mention kind="reference">rain-look</Mention>.</p>;

export const Active: Story = () => <p><Mention active>Toddy</Mention> waits at <Mention kind="place" active>the platform</Mention>.</p>;

export const Missing: Story = () => <p>Cut from <Mention kind="reference">last-train</Mention> to <Mention kind="reference" missing>platform-edge</Mention> as <Mention missing>Toddy</Mention> runs.</p>;

/* Maki's words: every name shows who or what it is, at the size of the words, so the line keeps its height */
export const Rich: Story = () => (
  <p style={{ width: 360 }}><Mention image={kiko}>Mio Arata</Mention> finds <Mention kind="object">The logbook</Mention> after <Mention figure="age-adult">Genzo Arata</Mention> dies, in <Mention kind="event" type="revelation" told="Ep 1">Mio finds the logbook in the ashes</Mention>.</p>
);

export const Playground: Story<MentionProps> = (args) => <p>After the fire, <Mention {...args} /> waits.</p>;
Playground.args = { kind: 'character', active: false, children: 'Toddy' };
Playground.argTypes = { kind: { options: ['character', 'place', 'reference', 'object', 'event'], control: { type: 'radio' } } };

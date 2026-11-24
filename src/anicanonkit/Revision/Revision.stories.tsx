import type { Story, StoryDefault } from '@ladle/react';
import { Revision, type RevisionProps } from './Revision';

export default { title: 'AniCanonKit / Productions / Revision' } satisfies StoryDefault;

const line = { fontSize: 14, width: 420 } as const;

export const Change: Story = () => <p style={line}><Revision before="Kiko comes down the stairs and" after="Kiko steps out of the smoke and" /> stops between them.</p>;

export const Insertion: Story = () => <p style={line}>The doors close. <Revision after="She does not look back." /></p>;

export const Playground: Story<RevisionProps> = (args) => <p style={line}><Revision {...args} /></p>;
Playground.args = { before: 'Kiko comes down the stairs', after: 'Kiko steps out of the smoke' };

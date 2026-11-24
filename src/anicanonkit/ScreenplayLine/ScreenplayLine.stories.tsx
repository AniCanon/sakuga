import type { Story, StoryDefault } from '@ladle/react';
import { ScreenplayLine, type ScreenplayLineProps } from './ScreenplayLine';

export default { title: 'AniCanonKit / Productions / ScreenplayLine' } satisfies StoryDefault;

const box = { width: 560 } as const;

export const Scene: Story = () => (
  <div style={box}>
    <ScreenplayLine type="slug">INT. WHITE ROOM - NIGHT</ScreenplayLine>
    <ScreenplayLine type="action">A white room with no windows. A watch lies face down.</ScreenplayLine>
    <ScreenplayLine type="cue">Professor</ScreenplayLine>
    <ScreenplayLine type="dialogue">You kept it.</ScreenplayLine>
    <ScreenplayLine type="cue" extension="O.S.">Kiko</ScreenplayLine>
    <ScreenplayLine type="paren">(not looking at it)</ScreenplayLine>
    <ScreenplayLine type="dialogue">It kept me.</ScreenplayLine>
    <ScreenplayLine type="transition">Cut to:</ScreenplayLine>
  </div>
);

export const Flagged: Story = () => <div style={box}><ScreenplayLine type="action" flagged>A white room with no windows. A watch lies face down.</ScreenplayLine></div>;

export const Playground: Story<ScreenplayLineProps> = (args) => <div style={box}><ScreenplayLine {...args}>Kiko</ScreenplayLine></div>;
Playground.args = { extension: 'O.S.', flagged: false };
Playground.argTypes = { type: { options: ['slug', 'action', 'cue', 'paren', 'dialogue', 'transition'], control: { type: 'radio' }, defaultValue: 'cue' } };

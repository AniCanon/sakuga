import type { Story, StoryDefault } from '@ladle/react';
import { Select, type SelectProps } from './Select';

export default { title: 'Sakuga / Forms / Select' } satisfies StoryDefault;

const factions = [{ label: 'Heros', icon: 'faction-hero' as const, hint: '8' }, { label: 'E.R.A.', icon: 'faction-villain' as const, hint: '8' }, { label: 'Unaligned', icon: 'faction-independent' as const, hint: '7' }];
const box = { maxWidth: 320 } as const;

export const Closed: Story = () => <div style={box}><Select label="Faction" value="Heros" options={factions} hint="Who he stands with." /></div>;

/* The menu drops over what is under the field, so the story leaves it room */
export const Open: Story = () => <div style={{ ...box, minHeight: 220 }}><Select label="Faction" value="Heros" options={factions} open /></div>;

export const Empty: Story = () => <div style={box}><Select label="Faction" placeholder="Pick a faction" options={factions} /></div>;

export const DisplayOnly: Story = () => <div style={box}><Select label="Shot" value="Medium close-up" icon="shot-medium-closeup" /></div>;

export const Highlight: Story = () => <div style={box}><Select label="When it happens" value="Episode 3, scene 2" highlight /></div>;

export const Optional: Story = () => <div style={box}><Select label="Faction" optional options={factions} /></div>;

/* Studio's What it is for, on a plan with no room for another frame */
export const DisabledOption: Story = () => <div style={{ ...box, minHeight: 260 }}><Select label="What it is for" placeholder="What is it for?" open options={[{ label: 'Source still', value: 'SOURCE_STILL' }, { label: 'Storyboard frame', value: 'STORYBOARD_FRAME', disabled: true, reason: 'Pro sends 12 storyboard frames, and this clip has 12.' }, { label: 'Place lock', value: 'ENVIRONMENT_LOCK' }]} /></div>;

export const Playground: Story<SelectProps> = (args) => <div style={{ ...box, minHeight: 220 }}><Select key={String(args.open) + args.value} {...args} options={factions} /></div>;
Playground.args = { label: 'Faction', value: 'Heros', placeholder: 'Pick a faction', hint: '', optional: false, highlight: false, open: false };

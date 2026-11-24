import type { Story, StoryDefault } from '@ladle/react';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import { DropZone, type DropZoneProps } from './DropZone';

export default { title: 'Sakuga / Forms / DropZone' } satisfies StoryDefault;

const box = { maxWidth: 320 } as const;

export const Empty: Story = () => <div style={box}><DropZone title="Drop a clip, or choose a file" hint="Audio or video · up to 30 seconds" onFiles={() => undefined} /></div>;

export const Busy: Story = () => <div style={box}><DropZone state="busy" title="Extracting the audio" hint="hero-shout.mp4" /></div>;

export const Filled: Story = () => <div style={box}><DropZone state="filled" title="front.jpg" /></div>;

export const FilledWithAPicture: Story = () => <div style={box}><DropZone state="filled" title="front.jpg" image={kiko} alt="The front" height={180} onRemove={() => undefined} /></div>;

export const CustomIcon: Story = () => <div style={box}><DropZone icon="image" title="Drop a picture" hint="PNG or JPG" height={160} /></div>;

export const Playground: Story<DropZoneProps> = (args) => <div style={box}><DropZone {...args} /></div>;
Playground.args = { state: 'empty', title: 'Drop a clip, or choose a file', hint: 'Audio or video · up to 30 seconds' };
Playground.argTypes = { state: { options: ['empty', 'busy', 'filled'], control: { type: 'radio' } } };

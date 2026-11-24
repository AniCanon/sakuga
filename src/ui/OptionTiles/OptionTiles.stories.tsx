import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { OptionTiles, type OptionTilesProps, type TileOption } from './OptionTiles';

export default { title: 'Sakuga / Actions / OptionTiles' } satisfies StoryDefault;

const shots: TileOption[] = [{ value: 'Auto', label: 'Auto', icon: 'auto' }, { value: 'Extreme', label: 'Extreme', icon: 'shot-extreme' }, { value: 'Close-up', label: 'Close-up', icon: 'shot-closeup' }, { value: 'Med close', label: 'Med close', icon: 'shot-medium-closeup' }, { value: 'Medium', label: 'Medium', icon: 'shot-medium' }, { value: 'Full', label: 'Full', icon: 'shot-full' }, { value: 'Wide', label: 'Wide', icon: 'shot-wide' }, { value: 'Ext wide', label: 'Ext wide', icon: 'shot-extreme-wide' }];
const help = { title: 'Defines how much of the subject and environment is visible.', text: 'Examples: close-up for emotion, medium shot for dialogue, wide shot for location context.' };
const ways: TileOption[] = [
  { value: 'prompt', label: 'From words', icon: 'document', description: 'Describe the look and we draw it.', cost: '~10 a second', footnote: 'Best for a first idea' },
  { value: 'photo', label: 'From a photo', icon: 'image', description: 'Start from a picture you have.', cost: '~12 a second', badge: 'New' },
  { value: 'sheet', label: 'From a sheet', icon: 'collection', description: 'A character sheet you drew.', disabled: true, badge: 'Coming soon' },
];
/* A flat stand-in scene, wider than 3:2, so the story shows the crop */
const scene = (sky: string, ground: string) => 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="' + sky + '"/><rect y="130" width="400" height="70" fill="' + ground + '"/><circle cx="200" cy="100" r="40" fill="#fff"/></svg>');
const scenes: TileOption[] = [
  { value: 'people', label: 'People', image: scene('#4a6fa5', '#2e3b4e'), description: 'Human bodies and faces.' },
  { value: 'animal', label: 'Animal people', image: scene('#a5674a', '#4e382e'), description: 'Animals who walk and talk like people.' },
  { value: 'creatures', label: 'Creatures', image: scene('#4aa57a', '#2e4e3d'), description: 'Bodies neither human nor animal-people.' },
];

function One(props: Omit<OptionTilesProps, 'value' | 'onChange'> & { start: string }) {
  const [v, set] = useState(props.start);
  return <OptionTiles {...props} value={v} onChange={(x) => set(x === v ? 'Auto' : x)} />;
}

export const Single: Story = () => <div style={{ maxWidth: 360 }}><One label="Shot type" start="Close-up" options={shots} help={help} note="Fills the frame with the face: for emotion." /></div>;

export const HelpOpen: Story = () => <div style={{ maxWidth: 360, padding: '120px 0 0 120px' }}><One label="Shot type" start="Wide" options={shots} help={help} helpOpen /></div>;

export const Multiple: Story = () => {
  const [v, set] = useState(['Rain']);
  return (
    <div style={{ maxWidth: 360 }}>
      <OptionTiles label="Effects" multiple columns={3} value={v} onChange={(x) => set(v.includes(x) ? v.filter((y) => y !== x) : [...v, x])}
        options={[{ value: 'Rain', label: 'Rain', icon: 'effect-rain' }, { value: 'Fog', label: 'Fog', icon: 'effect-fog' }, { value: 'Sparks', label: 'Sparks', icon: 'effect-sparks' }]} />
    </div>
  );
};

export const Large: Story = () => <div style={{ maxWidth: 720 }}><One label="How to make it" size="lg" start="prompt" options={ways} /></div>;

export const LargeRows: Story = () => <div style={{ maxWidth: 360 }}><One label="How to make it" size="lg" columns={1} start="photo" options={ways} /></div>;

export const LargeFill: Story = () => <div style={{ maxWidth: 720 }}><One label="Who lives in it" size="lg" art="fill" start="people" options={scenes} /></div>;

export const LargeFillRows: Story = () => <div style={{ maxWidth: 360 }}><One label="Who lives in it" size="lg" art="fill" columns={1} start="people" options={scenes} /></div>;

const create: TileOption[] = [
  { value: 'episode', label: 'Episode', icon: 'play', description: 'Widescreen story, scene by scene', href: '#episode' },
  { value: 'short', label: 'Short', icon: 'video', description: 'Vertical, under a minute', href: '#short' },
  { value: 'manga', label: 'Manga issue', icon: 'manga', description: 'Pages and panels from a script', href: '#manga' },
  { value: 'character', label: 'Character', icon: 'users', description: 'A face, a body, outfits, a voice', href: '#character' },
  { value: 'place', label: 'Place', icon: 'place', description: 'A location your scenes can use', href: '#place' },
];

export const WaysIn: Story = () => <div style={{ maxWidth: 1112 }}><OptionTiles label="Create in EBA" size="lg" columns={5} options={create} /></div>;

export const Playground: Story<OptionTilesProps> = (args) => <div style={{ maxWidth: 360 }}><OptionTiles {...args} options={shots} /></div>;
Playground.args = { label: 'Shot type', value: 'Medium', columns: 4, note: 'A waist-up shot: for dialogue.' };

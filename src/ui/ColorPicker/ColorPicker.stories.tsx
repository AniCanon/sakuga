import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { ColorPicker, type ColorPickerProps } from './ColorPicker';

export default { title: 'Sakuga / Forms / ColorPicker' } satisfies StoryDefault;

const presets = [{ label: 'Ink', color: '#0b0a10' }, { label: 'Camellia', color: '#c2335f' }, { label: 'Paper', color: '#f6f1e7' }, { label: 'Sky', color: '#3b82c4' }];
const picture = [{ label: 'Logo red', color: '#d6402b' }, { label: 'Logo gold', color: '#e8b03a' }, { label: 'Logo navy', color: '#1d2b4f' }];

function Live(props: Omit<ColorPickerProps, 'value' | 'onChange'> & { start: string }) {
  const [v, set] = useState(props.start);
  return <ColorPicker {...props} value={v} onChange={set} />;
}

export const Alone: Story = () => <Live label="Brand colour" start="#1f6feb" />;

export const WithPresets: Story = () => <Live label="Brand colour" start="#c2335f" presets={presets} />;

export const FromPicture: Story = () => <Live label="Brand colour" start="#c2335f" presets={presets} fromPicture={picture} />;

export const Grey: Story = () => <Live label="Text colour" start="#808080" presets={presets} presetsLabel="Kit colours" />;

export const Playground: Story<ColorPickerProps> = (args) => <ColorPicker {...args} presets={presets} fromPicture={picture} />;
Playground.args = { label: 'Brand colour', value: '#c2335f', presetsLabel: 'Colours in use', pictureLabel: 'From the picture' };

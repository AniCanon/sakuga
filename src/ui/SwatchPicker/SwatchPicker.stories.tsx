import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { SwatchPicker, type SwatchPickerProps } from './SwatchPicker';

export default { title: 'Sakuga / Forms / SwatchPicker' } satisfies StoryDefault;

const skin = [{ label: 'Porcelain', color: '#f6e3d8' }, { label: 'Fair', color: '#efd2bd' }, { label: 'Light', color: '#e3b996' }, { label: 'Medium', color: '#c99470' }, { label: 'Olive', color: '#b98a5e' }, { label: 'Tan', color: '#a8744d' }, { label: 'Brown', color: '#8a5a3b' }, { label: 'Deep', color: '#4a2c1c' }];
const coats: SwatchPickerProps['options'] = [{ label: 'Black', color: '#1F1D22' }, { label: 'Grey', color: '#8C8A92' }, { label: 'Ginger', color: '#D2783A' }, { label: 'Tabby', color: '#B08A5E', pattern: 'stripes', marks: ['#5C4128'] }, { label: 'Calico', color: '#F7F6F2', pattern: 'patches', marks: ['#D2783A', '#1F1D22'] }, { label: 'Spotted', color: '#E2C38E', pattern: 'spots', marks: ['#3B2B1E'] }, { label: 'White', color: '#F7F6F2' }];

function Live(props: Omit<SwatchPickerProps, 'value' | 'onChange'> & { start: string }) {
  const [v, set] = useState(props.start);
  return <SwatchPicker {...props} value={v} onChange={set} />;
}

export const Swatches: Story = () => <Live label="Skin tone" start="Medium" options={skin} />;

export const Named: Story = () => <div style={{ width: 420 }}><Live label="Coat" start="Black" labels options={coats} /></div>;

export const Columns: Story = () => <div style={{ width: 240 }}><Live label="Coat" start="Tabby" labels columns={4} options={coats} /></div>;

export const Playground: Story<SwatchPickerProps> = (args) => <div style={{ width: 420 }}><SwatchPicker {...args} options={coats} /></div>;
Playground.args = { label: 'Coat', value: 'Calico', labels: true };

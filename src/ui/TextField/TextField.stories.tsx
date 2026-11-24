import type { Story, StoryDefault } from '@ladle/react';
import { TextField, type TextFieldProps } from './TextField';

export default { title: 'Sakuga / Forms / TextField' } satisfies StoryDefault;

const col = { display: 'grid', gap: 16, maxWidth: 420 } as const;

export const Filled: Story = () => <div style={col}><TextField label="Name" defaultValue="Plaid overshirt" /></div>;

export const Empty: Story = () => <div style={col}><TextField label="Name" placeholder="What it is called" /></div>;

export const Multiline: Story = () => (
  <div style={col}><TextField label="Describe it" multiline defaultValue="An open plaid overshirt over a black tee." hint="Garments, colours, materials." /></div>
);

export const Optional: Story = () => <div style={col}><TextField label="Nickname" optional hint="What friends call them." /></div>;

export const WithHelp: Story = () => (
  <div style={col}><TextField label="Shot" defaultValue="Medium close-up" help={{ title: 'How close the camera is.', text: 'Examples: wide, medium, close-up.' }} /></div>
);

export const Highlight: Story = () => <div style={col}><TextField label="Name" defaultValue="Plaid overshirt, open" highlight /></div>;

export const Search: Story = () => <div style={col}><TextField icon="search" placeholder="Search characters" /></div>;

export const Playground: Story<TextFieldProps> = (args) => <div style={col}><TextField {...args} /></div>;
Playground.args = { label: 'Name', defaultValue: 'Plaid overshirt', placeholder: '', hint: '', optional: false, multiline: false, highlight: false, readOnly: false, required: false };

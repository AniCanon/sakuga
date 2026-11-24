import type { Story, StoryDefault } from '@ladle/react';
import { FieldHelp, type FieldHelpProps } from './FieldHelp';

export default { title: 'Sakuga / Forms / FieldHelp' } satisfies StoryDefault;

const name = { paddingTop: 130, display: 'flex', alignItems: 'center', gap: 6, font: 'var(--text-micro)', textTransform: 'uppercase', color: 'var(--text-muted)' } as const;

export const Closed: Story = () => (
  <div style={name}>Depth of field<FieldHelp label="Depth of field" title="Controls how much of the frame appears in focus.">Examples: shallow isolates the character, deep keeps foreground and background sharp.</FieldHelp></div>
);

export const Open: Story = () => (
  <div style={{ ...name, paddingLeft: 80 }}>Depth of field<FieldHelp label="Depth of field" title="Controls how much of the frame appears in focus." open>Examples: shallow isolates the character, deep keeps foreground and background sharp.</FieldHelp></div>
);

const levels = [
  { name: 'In the background', text: 'There and drawn right, but not the point.', placeholder: 'Small, in a wide shot' },
  { name: 'Matters here', text: 'Clearly in the shot.', placeholder: 'In clear view' },
  { name: 'Close detail', text: 'The camera goes close.', placeholder: 'Close on it' },
];

export const Examples: Story = () => (
  <div style={{ ...name, paddingTop: 0, paddingBottom: 340 }}>How much it matters<FieldHelp label="How much it matters" title="How much a thing matters in this shot" align="start" open examples={levels}>The drawing follows the level you choose.</FieldHelp></div>
);

export const ExamplesDialog: Story = () => (
  <div className="sk-root" style={{ position: 'relative', height: 640 }}>
    <div style={{ ...name, paddingTop: 0 }}>How much it matters<FieldHelp label="How much it matters" title="How much a thing matters in this shot" dialog open examples={levels}>The drawing follows the level you choose.</FieldHelp></div>
  </div>
);

export const Playground: Story<FieldHelpProps> = (args) => <div style={{ ...name, paddingLeft: 80 }}>Shot type<FieldHelp {...args} /></div>;
Playground.args = { label: 'Shot type', title: 'How close the camera is.', children: 'Examples: wide, medium, close-up.', open: true };

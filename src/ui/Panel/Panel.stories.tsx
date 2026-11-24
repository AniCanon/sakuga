import type { Story, StoryDefault } from '@ladle/react';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Panel, type PanelProps } from './Panel';

export default { title: 'Sakuga / Containers / Panel' } satisfies StoryDefault;

const box = { maxWidth: 420 } as const;
const tiles = <p style={{ margin: 0, color: 'var(--text-secondary)', font: '400 14px/20px var(--font-sans)' }}>Tiles go here.</p>;

export const WithAction: Story = () => (
  <div style={box}>
    <Panel icon="camera" title="Camera and framing" subtitle="Core shot decisions, with a technique library behind them" action={<Button variant="ghost" size="sm" icon="film">Techniques</Button>}>{tiles}</Panel>
  </div>
);

export const SlotAction: Story = () => (
  <div style={box}>
    <Panel icon="image" title="Reference" subtitle="What the frame borrows its look from">
      <span slot="action"><IconButton variant="plain" icon="close" label="Remove reference" /></span>
      {tiles}
    </Panel>
  </div>
);

export const Selected: Story = () => (
  <div style={{ display: 'grid', gap: 12, ...box }}>
    <Panel icon="film" title="Take 1" subtitle="Wide, slow push in">{tiles}</Panel>
    <Panel icon="film" title="Take 2" subtitle="Close-up, held" selected>{tiles}</Panel>
  </div>
);

/* The open fold of an accordion in the 320 px Direction rail: the chevron stays on the words' line */
export const OpenFold: Story = () => (
  <div style={{ width: 320 }}>
    <Panel icon="camera" title="Advanced cinematography" subtitle="Auto" onToggle={() => {}} controls="fold">{<div id="fold">{tiles}</div>}</Panel>
  </div>
);

export const Plain: Story = () => <div style={box}><Panel title="Lens" subtitle="How much of the place the frame takes in">{tiles}</Panel></div>;

export const Playground: Story<PanelProps> = (args) => <div style={box}><Panel {...args}>{tiles}</Panel></div>;
Playground.args = { icon: 'camera', title: 'Camera and framing', subtitle: 'Core shot decisions, with a technique library behind them', selected: false };

export const Pane: Story = () => (
  <div style={box}>
    <Panel pane title="Lens" subtitle="How much of the place the frame takes in">{tiles}</Panel>
    <Panel pane title="Light" subtitle="Where it comes from">{tiles}</Panel>
  </div>
);

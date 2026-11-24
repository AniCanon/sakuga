import type { Story, StoryDefault } from '@ladle/react';
import { Button, type ButtonProps } from './Button';

export default { title: 'Sakuga / Actions / Button' } satisfies StoryDefault;

const row = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' } as const;
const variants: NonNullable<ButtonProps['variant']>[] = ['primary', 'secondary', 'outline', 'ghost', 'destructive'];

export const Variants: Story = () => (
  <div style={row}>{variants.map((v) => <Button key={v} variant={v}>{v[0].toUpperCase() + v.slice(1)}</Button>)}</div>
);

export const Sizes: Story = () => (
  <div style={row}>
    <Button size="lg" icon="play">Play S1 · E1</Button>
    <Button size="md">Follow</Button>
    <Button size="sm" variant="secondary">See all</Button>
  </div>
);

export const Pill: Story = () => (
  <div style={{ ...row, maxWidth: 360 }}>
    <Button shape="pill" size="lg" icon="play" style={{ flex: 1 }}>Play E1</Button>
    <Button shape="pill" size="lg" variant="secondary">Follow</Button>
  </div>
);

export const Icons: Story = () => (
  <div style={row}>
    <Button icon="plus">Add a scene</Button>
    <Button variant="secondary" iconEnd="chevron-right">Continue</Button>
    <Button variant="ghost" icon="share">Share</Button>
  </div>
);

export const Trailing: Story = () => (
  <div style={row}>
    <Button trailing={{ value: '$4', label: 'a month' }}>Subscribe</Button>
    <Button size="sm" variant="secondary" trailing={{ value: '3' }}>Drafts</Button>
  </div>
);

export const Disabled: Story = () => (
  <div style={row}>
    <Button disabled>Generate</Button>
    <Button variant="secondary" disabled>Follow</Button>
    <Button variant="destructive" disabled>Delete my account</Button>
  </div>
);

export const Link: Story = () => <Button href="#watch" variant="outline">Remind me</Button>;

export const FullWidth: Story = () => <div style={{ maxWidth: 360 }}><Button fullWidth size="lg">Done</Button></div>;

export const OverArt: Story = () => (
  <div style={{ ...row, padding: 32, borderRadius: 12, background: '#2a2140' }}>
    <Button variant="media" size="lg" icon="play">Play</Button>
    <Button variant="media-secondary" size="lg">More info</Button>
  </div>
);

/* Busy: the fill stays, the loader comes after --button-busy-delay, and the words say what is happening */
export const Busy: Story = () => (
  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
    <Button size="lg" icon="forward" busy busyLabel="Planning the shoot…">Plan the shoot</Button>
    <Button variant="secondary" busy busyLabel="Saving…">Save</Button>
    <Button variant="ghost" busy>See all</Button>
  </div>
);

export const Playground: Story<ButtonProps> = (args) => <Button {...args} />;
Playground.args = { children: 'Generate', disabled: false, fullWidth: false };
Playground.argTypes = {
  variant: { options: ['primary', 'secondary', 'outline', 'ghost', 'media', 'media-secondary', 'destructive'], control: { type: 'select' }, defaultValue: 'primary' },
  size: { options: ['sm', 'md', 'lg'], control: { type: 'radio' }, defaultValue: 'md' },
  shape: { options: ['rounded', 'pill'], control: { type: 'radio' }, defaultValue: 'rounded' },
};

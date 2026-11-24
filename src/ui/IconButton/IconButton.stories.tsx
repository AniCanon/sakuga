import { useState } from 'react';
import type { Story, StoryDefault } from '@ladle/react';
import { IconButton, type IconButtonProps } from './IconButton';

export default { title: 'Sakuga / Actions / IconButton' } satisfies StoryDefault;

const row = { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' } as const;

export const Variants: Story = () => (
  <div style={row}>
    <IconButton icon="search" label="Search" />
    <IconButton icon="settings" label="Settings" variant="plain" />
    <IconButton icon="plus" label="New" variant="primary" />
  </div>
);

export const Sizes: Story = () => (
  <div style={row}>
    <IconButton icon="share" label="Share EBA" />
    <IconButton icon="share" label="Share EBA" size="lg" />
  </div>
);

export const Pressed: Story = () => {
  const [on, setOn] = useState(true);
  return (
    <div style={row}>
      <IconButton icon="heart" label="Like" pressed={on} onClick={() => setOn(!on)} />
      <IconButton icon="heart" label="Like" pressed={false} />
    </div>
  );
};

export const Attention: Story = () => <IconButton icon="bell" label="Notifications, 3 new" variant="plain" attention />;

export const OverMedia: Story = () => (
  <div style={{ ...row, padding: '13px 12px', borderRadius: 12, background: '#2a2140' }}>
    <IconButton icon="language" label="Audio and subtitles" variant="media" />
    <IconButton icon="close" label="Close" variant="media" />
  </div>
);

export const Link: Story = () => <IconButton icon="back" label="Back" href="#back" />;

export const Disabled: Story = () => (
  <div style={row}>
    <IconButton icon="share" label="Share EBA" disabled />
    <IconButton icon="plus" label="New" variant="primary" disabled />
  </div>
);

export const Playground: Story<IconButtonProps> = (args) => <IconButton {...args} />;
Playground.args = { icon: 'share', label: 'Share EBA', attention: false, disabled: false };
Playground.argTypes = {
  variant: { options: ['solid', 'media', 'plain', 'primary'], control: { type: 'radio' }, defaultValue: 'solid' },
  size: { options: ['md', 'lg'], control: { type: 'radio' }, defaultValue: 'md' },
};

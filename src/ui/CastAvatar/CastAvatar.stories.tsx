import { useState } from 'react';
import type { Story, StoryDefault } from '@ladle/react';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import prof from '@design/blobs/5537a7e99565fd443a8937608d47f460.jpg';
import { CastAvatar, type CastAvatarProps } from './CastAvatar';

export default { title: 'Sakuga / Content / CastAvatar' } satisfies StoryDefault;

const row = { display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' } as const;

export const Sizes: Story = () => (
  <div style={row}>
    <CastAvatar image={kiko} name="Kiko" role="Leads the E.R.A." width={120} href="#" />
    <CastAvatar size="md" image={kiko} name="Kiko" role="Power of wind" width={84} href="#" />
    <CastAvatar size="sm" image={prof} name="The Professor" role="Arthur Penhaligon" width={72} />
    <CastAvatar size="xs" image={kiko} name="Kiko" role="Leads the E.R.A." width={64} />
    <CastAvatar size={56} image={prof} name="The Professor" width={80} />
  </div>
);

export const Initial: Story = () => (
  <div style={row}>
    <CastAvatar name="Ken" role="Kiko's brother" width={120} />
    <CastAvatar size="md" initial="R" name="Raul" role="Creator" width={84} />
  </div>
);

export const Selected: Story = () => {
  const [on, setOn] = useState('Kiko');
  return (
    <div style={row}>
      {[{ name: 'Kiko', image: kiko }, { name: 'The Professor', image: prof }, { name: 'Ken' }].map((p) => (
        <CastAvatar key={p.name} size="sm" image={p.image} name={p.name} width={72} selected={on === p.name} onClick={() => setOn(p.name)} />
      ))}
    </div>
  );
};

export const Muted: Story = () => <div style={row}><CastAvatar image={prof} name="The Professor" role="Arthur Penhaligon" width={120} muted /></div>;

export const Row: Story = () => (
  <div style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
    <CastAvatar layout="row" size="xs" image={kiko} name="Kiko" role="Sister" href="#" />
    <CastAvatar layout="row" size="xs" image={prof} name="The Professor" role="Mentor" href="#" />
    <CastAvatar layout="row" size="xs" name="Ken" role="Brother" />
  </div>
);

export const Playground: Story<CastAvatarProps> = (args) => <CastAvatar image={kiko} {...args} />;
Playground.args = { name: 'Kiko', role: 'Leads the E.R.A.', muted: false, width: 120 };
Playground.argTypes = {
  size: { options: ['lg', 'md', 'sm', 'xs'], control: { type: 'select' }, defaultValue: 'lg' },
  layout: { options: [undefined, 'row'], control: { type: 'radio' } },
};

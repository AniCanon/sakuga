import type { Story, StoryDefault } from '@ladle/react';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import prof from '@design/blobs/5537a7e99565fd443a8937608d47f460.jpg';
import { LookPlate, type LookPlateProps } from './LookPlate';

export default { title: 'AniCanonKit / Characters / LookPlate' } satisfies StoryDefault;

const grid = { display: 'grid', gridTemplateColumns: 'repeat(4, 120px)', gap: 12 } as const;

export const States: Story = () => (
  <div style={grid}>
    <LookPlate label="casual" occasion="Everyday" state="wearing" image={kiko} />
    <LookPlate label="Coat" occasion="Outdoors" state="showing" image={prof} />
    <LookPlate label="Gala" occasion="Formal" state="new" image={kiko} />
    <LookPlate label="School" occasion="Everyday" image={prof} />
  </div>
);

export const Review: Story = () => <div style={grid}><LookPlate label="Uniform" occasion="Uniform" state="review" image={kiko} /></div>;

export const Drawing: Story = () => <div style={grid}><LookPlate label="Plaid" occasion="Everyday" state="drawing" /></div>;

export const Add: Story = () => <div style={grid}><LookPlate label="New look" occasion="Any occasion" state="add" /></div>;

export const Empty: Story = () => <div style={grid}><LookPlate label="Festival" occasion="Festival" placeholder="Drawn when you approve the sheet" /></div>;

export const Menu: Story = () => (
  <div style={grid}>
    <LookPlate label="Plaid" occasion="Everyday" image={kiko} href="#"
      menu={{ open: true, items: [{ label: 'Wear by default', icon: 'check' }, { label: 'Rename', icon: 'edit' }, { label: 'Delete Plaid', icon: 'trash', tone: 'danger', separated: true }] }} />
  </div>
);

export const Playground: Story<LookPlateProps> = (args) => <div style={grid}><LookPlate {...args} /></div>;
Playground.args = { label: 'casual', occasion: 'Everyday', image: kiko };
Playground.argTypes = { state: { options: ['ready', 'wearing', 'showing', 'review', 'new', 'drawing', 'add'], control: { type: 'select' }, defaultValue: 'ready' } };

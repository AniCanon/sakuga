import type { Story, StoryDefault } from '@ladle/react';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import prof from '@design/blobs/5537a7e99565fd443a8937608d47f460.jpg';
import { CastCard, type CastCardProps } from './CastCard';

export default { title: 'AniCanonKit / Characters / CastCard' } satisfies StoryDefault;

const grid = { display: 'grid', gridTemplateColumns: 'repeat(4, 170px)', gap: 12 } as const;

export const Portrait: Story = () => (
  <div style={grid}>
    <CastCard href="#" name="Kiko" image={kiko} role="Leads the E.R.A." meta="2 looks" />
    <CastCard href="#" name="Felix" initial="F" />
  </div>
);

export const States: Story = () => (
  <div style={grid}>
    <CastCard href="#" name="The Professor" image={prof} role="Arthur Penhaligon" state={{ label: '1 look waiting on you', tone: 'attention' }} />
    <CastCard href="#" name="Kiko" image={kiko} role="Leads the E.R.A." state={{ label: 'Drawing a look', tone: 'busy' }} />
  </div>
);

export const Actions: Story = () => (
  <div style={grid}>
    <CastCard href="#" name="Rick" initial="R" action={{ label: 'Face sheet ready, review', tone: 'attention' }} />
    <CastCard href="#" name="Sophia" initial="S" action={{ label: 'Continue setup', tone: 'draft' }} />
    <CastCard href="#" name="Tattoo" initial="T" action={{ label: 'Designing the look', tone: 'busy', time: '0:31' }} />
  </div>
);

export const NotALink: Story = () => <div style={grid}><CastCard name="Kiko" image={kiko} role="Leads the E.R.A." meta="2 looks" /></div>;

export const NoPortrait: Story = () => <div style={grid}><CastCard name="Genzo Arata" initial="G" placeholderIcon="age-adult" role="Lighthouse keeper" href="/cast/genzo" action={{ label: 'Continue setup', tone: 'draft' }} /></div>;

export const Menu: Story = () => (
  <div style={grid}>
    <CastCard href="#" name="Sophia" initial="S" action={{ label: 'Continue setup', tone: 'draft' }}
      menu={{ open: true, items: [{ label: 'Continue setup', icon: 'frame-portrait', href: '#' }, { label: 'Delete Sophia', icon: 'trash', tone: 'danger', separated: true }] }} />
    <CastCard href="#" name="Kiko" image={kiko} role="Leads the E.R.A." meta="2 looks" />
  </div>
);

export const Playground: Story<CastCardProps> = (args) => <div style={grid}><CastCard {...args} /></div>;
Playground.args = { name: 'Kiko', image: kiko, role: 'Leads the E.R.A.', meta: '2 looks', href: '#' };

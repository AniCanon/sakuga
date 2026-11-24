import type { Story, StoryDefault } from '@ladle/react';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import { ActivityPanel, type ActivityPanelProps } from './ActivityPanel';

export default { title: 'AniCanonKit / AniCanon / ActivityPanel' } satisfies StoryDefault;

const groups: ActivityPanelProps['groups'] = [
  { title: 'Running · 1', jobs: [{ initial: 'T', title: 'Tattoo · new character', text: 'Designing the look', progress: 55, time: '0:31' }] },
  { title: 'Needs you', jobs: [{ initial: 'S', title: 'Smith · new look', text: 'Ready for your review', action: { label: 'Review', primary: true } }] },
  { title: 'Done', jobs: [{ image: kiko, title: 'Kiko · voice', text: 'Cast', time: '2m ago' }, { initial: 'K', title: 'Ken · new outfit', text: 'Ready', action: { label: 'Open' } }] },
];

export const Jobs: Story = () => <ActivityPanel groups={groups} />;

export const HoldsFocus: Story = () => <ActivityPanel groups={groups} onClose={() => undefined} />;

export const Playground: Story<ActivityPanelProps> = (args) => <ActivityPanel {...args} />;
Playground.args = { groups };

export const Opens: Story = () => (
  <ActivityPanel
    groups={[
      { title: 'Running · 2', jobs: [
        { figure: 'age-adult', title: 'Tattoo · new character', text: 'Designing the look · stage 2 of 3', progress: 55, time: '0:31', href: '/characters/new?character=tattoo' },
        { image: kiko, title: 'Lyra · new look', text: 'Rendering the portrait', progress: 80, time: '1:12', href: '/characters/lyra/looks/new' },
      ] },
      { title: 'Needs you', jobs: [{ image: kiko, title: 'Smith · new look', text: 'Ready for your review', href: '/characters/smith', action: { label: 'Review', primary: true } }] },
    ]}
  />
);

/* One Activity for the series: characters, Studio takes and places, grouped by where each stands */
export const Series: Story = () => (
  <ActivityPanel
    groups={[
      { title: 'Running · 3', jobs: [
        { shape: 'frame', figure: 'image', title: 'Last train · still', text: 'Rendering · Kiko and Smith at Red Line Platform Edge', progress: 40, time: '0:42', held: '63', href: '/studio' },
        { shape: 'frame', image: kiko, title: 'Sé station · new view', text: 'Drawing Ticket Gate Concourse · 2 of 3', progress: 66, time: '1:05', href: '/places/se' },
        { figure: 'age-adult', title: 'Tattoo · new character', text: 'Designing the look · stage 2 of 3', progress: 55, time: '0:31', href: '/characters/new?character=tattoo' },
      ] },
      { title: 'Needs you · 1', jobs: [{ shape: 'frame', figure: 'image', title: 'Rain check · clip', text: 'Didn’t finish. Nothing charged.', href: '/studio', action: { label: 'Retry' } }] },
    ]}
  />
);

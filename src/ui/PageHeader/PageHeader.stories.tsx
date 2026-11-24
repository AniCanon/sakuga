import type { Story, StoryDefault } from '@ladle/react';
import { Button } from '../Button/Button';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { PageHeader } from './PageHeader';

export default { title: 'Sakuga / Navigation / PageHeader' } satisfies StoryDefault;

const column = { display: 'flex', flexDirection: 'column', gap: 40, maxWidth: 1100 } as const;

export const Page: Story = () => (
  <div style={column}>
    <PageHeader title="Characters" lead="23 characters in EBA, grouped by faction.">
      <span slot="views"><SegmentedControl label="View" value="cast" options={[{ label: 'Cast', value: 'cast' }, { label: 'Coverage', value: 'coverage' }]} /></span>
      <span slot="action"><Button variant="primary" icon="plus">New character</Button></span>
    </PageHeader>
    <PageHeader title="Places" lead="3 places in Lantern Tide. Each keeps its views, held to one anchor, and the states the story puts it in; a lead this long runs to a second line and the controls stay on the title's.">
      <span slot="views"><SegmentedControl label="View" value="places" options={[{ label: 'Places', value: 'places' }, { label: 'Motion', value: 'motion' }]} /></span>
      <span slot="action"><Button variant="primary" icon="plus">New place</Button></span>
    </PageHeader>
    <PageHeader title="Series settings" lead="Who works on EBA, its rules and how it is published." />
  </div>
);

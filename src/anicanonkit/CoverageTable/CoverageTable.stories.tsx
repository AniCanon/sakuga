import type { Story, StoryDefault } from '@ladle/react';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import prof from '@design/blobs/5537a7e99565fd443a8937608d47f460.jpg';
import { CoverageTable, type CoverageTableProps } from './CoverageTable';

export default { title: 'AniCanonKit / Characters / CoverageTable' } satisfies StoryDefault;

const props: CoverageTableProps = {
  label: 'Wardrobe coverage',
  summary: '2 gaps · from Episode 2',
  legend: [{ state: 'own', label: 'Has a look' }, { state: 'gap', label: 'A scene needs it' }, { state: 'idle', label: 'Not needed yet' }],
  occasions: ['Everyday', 'Uniform', 'Formal', 'Festival', 'Combat'],
  rows: [
    { name: 'Kiko', image: kiko, cells: [{ state: 'own', label: '1 look' }, { state: 'idle' }, { state: 'own', label: '1 look' }, { state: 'idle' }, { state: 'gap', label: '3 scenes · nothing' }] },
    { name: 'The Professor', image: prof, cells: [{ state: 'own', label: '2 looks' }, { state: 'idle' }, { state: 'idle' }, { state: 'gap', label: '2 scenes · nothing' }, { state: 'idle' }] },
  ],
};

export const Gaps: Story = () => <div style={{ width: 760 }}><CoverageTable {...props} /></div>;

export const NoLegend: Story = () => <div style={{ width: 760 }}><CoverageTable label="Wardrobe coverage" occasions={props.occasions} rows={props.rows} /></div>;

export const Playground: Story<CoverageTableProps> = (args) => <div style={{ width: 760 }}><CoverageTable {...args} /></div>;
Playground.args = props;

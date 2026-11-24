import type { Story, StoryDefault } from '@ladle/react';
import { CutSheet, type CutSheetProps } from './CutSheet';

export default { title: 'AniCanonKit / Productions / CutSheet' } satisfies StoryDefault;

const box = { width: 560 } as const;
const columns: CutSheetProps['columns'] = [{ label: 'C', width: '62px' }, { label: 'Picture', width: '120px' }, { label: 'Action' }, { label: 'Dialogue' }, { label: 'Sec', width: '70px', align: 'end' }];

/* The rows are CutRows: see CutRow's stories for the sheet with its cuts */
export const Columns: Story = () => <div style={box}><CutSheet columns={columns} label="Scene 2" /></div>;

export const Surface: Story = () => (
  <div style={box}>
    <CutSheet columns={columns} label="Scene 2" surface>
      <div slot="footer"><p style={{ margin: '16px 0 0', color: 'var(--text-secondary)' }}>Next: scene 3, the last train.</p></div>
    </CutSheet>
  </div>
);

export const Playground: Story<CutSheetProps> = (args) => <div style={box}><CutSheet {...args} /></div>;
Playground.args = { columns, label: 'Scene 2', surface: false };

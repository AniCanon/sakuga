import type { Story, StoryDefault } from '@ladle/react';
import { CutCell } from '../CutCell/CutCell';
import { CutSheet, type CutSheetProps } from '../CutSheet/CutSheet';
import { CutRow, type CutRowProps } from './CutRow';

export default { title: 'AniCanonKit / Productions / CutRow' } satisfies StoryDefault;

const box = { width: 560 } as const;
const columns: CutSheetProps['columns'] = [{ label: 'C', width: '62px' }, { label: 'Action' }, { label: 'Sec', width: '70px', align: 'end' }];
const end = { textAlign: 'right' } as const;

export const Sheet: Story = () => (
  <div style={box}>
    <CutSheet columns={columns} label="Scene 2">
      <CutRow><div><CutCell number="2A" state="approved" /></div><div>The platform before the last train.</div><div style={end}>8+00</div></CutRow>
      <CutRow selected><div><CutCell number="2B" state="waiting" /></div><div>Kiko steps out of the smoke.</div><div style={end}>10+00</div></CutRow>
      <CutRow changed><div><CutCell number="2C" note="V3" /></div><div>The doors close on her reflection.</div><div style={end}>4+12</div></CutRow>
    </CutSheet>
  </div>
);

export const Selected: Story = () => (
  <div style={box}>
    <CutSheet columns={columns} label="Scene 2">
      <CutRow selected><div><CutCell number="2B" state="waiting" /></div><div>Kiko steps out of the smoke.</div><div style={end}>10+00</div></CutRow>
    </CutSheet>
  </div>
);

export const Changed: Story = () => (
  <div style={box}>
    <CutSheet columns={columns} label="Scene 2">
      <CutRow changed><div><CutCell number="2C" state="approved" /></div><div>The doors close on her reflection.</div><div style={end}>4+12</div></CutRow>
    </CutSheet>
  </div>
);

export const Span: Story = () => (
  <div style={box}>
    <CutSheet columns={columns} label="Scene 2">
      <CutRow selected><div><CutCell number="2B" state="waiting" /></div><div>Kiko steps out of the smoke.</div><div style={end}>10+00</div></CutRow>
      <CutRow selected span>Two videos: she steps out, then the smoke clears.</CutRow>
    </CutSheet>
  </div>
);

export const Playground: Story<CutRowProps> = (args) => (
  <div style={box}>
    <CutSheet columns={columns} label="Scene 2">
      <CutRow {...args}><div><CutCell number="2A" state="approved" /></div><div>The platform before the last train.</div><div style={end}>8+00</div></CutRow>
    </CutSheet>
  </div>
);
Playground.args = { selected: false, changed: false };

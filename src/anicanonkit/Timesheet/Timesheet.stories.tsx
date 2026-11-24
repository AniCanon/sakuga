import type { Story, StoryDefault } from '@ladle/react';
import { Timesheet, type TimesheetProps } from './Timesheet';

export default { title: 'AniCanonKit / Productions / Timesheet' } satisfies StoryDefault;

const box = { width: 560, padding: '12px' } as const;
const spans: TimesheetProps['spans'] = [{ start: 0, end: 120, label: 'Video 3', detail: 'opens on the board' }, { start: 120, end: 216, label: 'Video 4', detail: 'continues from key 2' }];
const keys: TimesheetProps['keys'] = [{ at: 10, label: '1' }, { at: 120, label: '2' }, { at: 206, label: '3' }];

export const Videos: Story = () => <div style={box}><Timesheet seconds={9} note="Keys are the frames a video starts and ends on" spans={spans} keys={keys} /></div>;

export const OneVideo: Story = () => <div style={box}><Timesheet seconds={5} spans={[{ start: 0, end: 120, label: 'Video 1', detail: 'opens on the board' }]} keys={[{ at: 10, label: '1' }, { at: 110, label: '2' }]} /></div>;

export const Playground: Story<TimesheetProps> = (args) => <div style={box}><Timesheet {...args} /></div>;
Playground.args = { seconds: 9, fps: 24, label: 'Videos to make', note: 'Keys are the frames a video starts and ends on', spans, keys };

import type { Story, StoryDefault } from '@ladle/react';
import { Button } from '../../ui/Button/Button';
import { IconButton } from '../../ui/IconButton/IconButton';
import { MonitorBar, type MonitorBarProps } from './MonitorBar';

export default { title: 'AniCanonKit / Productions / MonitorBar' } satisfies StoryDefault;

const box = { maxWidth: 640 } as const;

export const Bar: Story = () => (
  <div style={box}>
    <MonitorBar timecode="2:41 + 04f">
      <span slot="transport"><IconButton variant="plain" icon="skip-back" label="A frame earlier" /><IconButton variant="plain" icon="play" label="Play" /><IconButton variant="plain" icon="skip-forward" label="A frame later" /></span>
      <Button variant="ghost" size="sm">Split</Button>
      <Button variant="ghost" size="sm">Trim</Button>
      <span slot="end"><Button variant="ghost" size="sm">Fit</Button></span>
    </MonitorBar>
  </div>
);

export const EditButtons: Story = () => (
  <div style={box}>
    <MonitorBar timecode="2:41 + 04f"><Button variant="ghost" size="sm">Split</Button><Button variant="ghost" size="sm">Trim</Button></MonitorBar>
  </div>
);

export const Playground: Story<MonitorBarProps> = (args) => <div style={box}><MonitorBar {...args}><Button variant="ghost" size="sm">Split</Button></MonitorBar></div>;
Playground.args = { timecode: '2:41 + 04f' };

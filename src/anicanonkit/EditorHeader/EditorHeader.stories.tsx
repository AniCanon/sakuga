import type { Story, StoryDefault } from '@ladle/react';
import { Button } from '../../ui/Button/Button';
import { EditorHeader, type EditorHeaderProps } from './EditorHeader';

export default { title: 'AniCanonKit / Productions / EditorHeader' } satisfies StoryDefault;

const box = { maxWidth: 640 } as const;

export const Header: Story = () => (
  <div style={box}>
    <EditorHeader title="The First Watch" timecode="Cut · 2:41 + 04f of 6:40" status="Rebuilds exactly" statusHint="Every cut, effect and line is kept, so the cut rebuilds exactly">
      <Button variant="primary" size="sm">Screen the cut</Button>
    </EditorHeader>
  </div>
);

export const TitleOnly: Story = () => <div style={box}><EditorHeader title="The First Watch" /></div>;

export const Playground: Story<EditorHeaderProps> = (args) => <div style={box}><EditorHeader {...args}><Button variant="primary" size="sm">Screen the cut</Button></EditorHeader></div>;
Playground.args = { title: 'The First Watch', timecode: 'Cut · 2:41 + 04f of 6:40', status: 'Rebuilds exactly', statusHint: '' };

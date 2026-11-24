import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { ScreenplayEditor, type ScreenplayEditorProps } from './ScreenplayEditor';

export default { title: 'AniCanonKit / Writing / ScreenplayEditor' } satisfies StoryDefault;

const page = { width: 640 } as const;
const cast = [{ id: 'c1', name: 'Kiko' }, { id: 'c2', name: 'Toddy' }];
const places = [{ id: 'p1', name: 'Sé station' }];
const scene = '## INT. TODDY’S BEDROOM — NIGHT\n\nHis phone lights up. @[Kiko:c1]’s name.\n\n@[Kiko:c1]:\n(quietly)\nPick up. I’m at #Sé station.\n\nCUT TO:';

export const Scene: Story = () => {
  const [value, setValue] = useState(scene);
  return <div style={page}><ScreenplayEditor value={value} onChange={setValue} mentions={{ cast, places }} /></div>;
};

export const NewScene: Story = () => {
  const [value, setValue] = useState('');
  return <div style={page}><ScreenplayEditor value={value} onChange={setValue} mentions={{ cast, places }} placeholders={{ slug: 'INT. or EXT. · the place · the time', action: 'What we see' }} /></div>;
};

export const Playground: Story<ScreenplayEditorProps> = (args) => <div style={page}><ScreenplayEditor {...args} /></div>;
Playground.args = { value: scene, mentions: { cast, places } };

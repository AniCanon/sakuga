import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { TextLink } from '../TextLink/TextLink';
import { Sheet } from './Sheet';

export default { title: 'Sakuga / Containers / Sheet' } satisfies StoryDefault;

/* The sheet sits on the screen; a transform makes this box its screen, so the story shows it as a phone would */
const phone = { position: 'relative', height: 420, maxWidth: 390, overflow: 'hidden', transform: 'translateZ(0)', borderRadius: 16 } as const;

/* Audio and subtitles over an episode: media, two groups, Done */
export const Choices: Story = () => {
  const [open, setOpen] = useState(true), [audio, setAudio] = useState('Japanese'), [subs, setSubs] = useState('English');
  return (
    <div style={phone}>
      <Button variant="secondary" shape="pill" onClick={() => setOpen(true)}>Audio and subtitles</Button>
      <Sheet open={open} media title="Audio and subtitles" onClose={() => setOpen(false)}>
        <Sheet.Group title="Audio">
          {['Japanese', 'English'].map((x) => <Sheet.Option key={x} selected={audio === x} onSelect={() => setAudio(x)}>{x}</Sheet.Option>)}
        </Sheet.Group>
        <Sheet.Group title="Subtitles">
          {['English', 'Português', 'Off'].map((x) => <Sheet.Option key={x} selected={subs === x} onSelect={() => setSubs(x)}>{x}</Sheet.Option>)}
        </Sheet.Group>
      </Sheet>
    </div>
  );
};

/* A row's menu: the options are the actions, so there is no Done */
export const RowMenu: Story = () => {
  const [open, setOpen] = useState(true), close = () => setOpen(false);
  return (
    <div style={phone}>
      <Button variant="secondary" shape="pill" onClick={() => setOpen(true)}>More for Sé station</Button>
      <Sheet open={open} title="Sé station" doneLabel={null} onClose={close}>
        <Sheet.Group title="Sé station">
          <Sheet.Option onSelect={close}>Add a view</Sheet.Option>
          <Sheet.Option onSelect={close}>Copy #Sé station</Sheet.Option>
        </Sheet.Group>
        <TextLink variant="destructive" onClick={close}>Delete Sé station</TextLink>
      </Sheet>
    </div>
  );
};

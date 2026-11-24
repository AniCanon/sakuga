import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Dialog, type DialogProps } from './Dialog';

export default { title: 'Sakuga / Containers / Dialog' } satisfies StoryDefault;

const stage = { position: 'relative', height: 300 } as const;
const cards = <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Plan cards go here.</p>;

export const Open: Story = () => {
  const [open, setOpen] = useState(true), close = () => setOpen(false);
  return (
    <div style={stage}>
      <Button variant="secondary" onClick={() => setOpen(true)}>Choose a video plan</Button>
      <Dialog open={open} onClose={close} title="Choose a video plan" description="Plans differ in motion polish and what they need from you." width={520}
        footer={[<Button key="a" variant="ghost" onClick={close}>Cancel</Button>, <Button key="b" onClick={close}>Use Regular</Button>]}>
        {cards}
      </Dialog>
    </div>
  );
};

export const Confirmation: Story = () => {
  const [open, setOpen] = useState(true), close = () => setOpen(false);
  return (
    <div style={stage}>
      <Button variant="secondary" onClick={() => setOpen(true)}>Delete scene</Button>
      <Dialog open={open} onClose={close} title="Delete scene 4?" description="Its takes and lines go with it. This cannot be undone." width={440}>
        <span slot="footer"><Button variant="ghost" onClick={close}>Keep it</Button></span>
        <span slot="footer"><Button variant="destructive" onClick={close}>Delete scene</Button></span>
      </Dialog>
    </div>
  );
};

export const Closed: Story = () => {
  const [open, setOpen] = useState(false), close = () => setOpen(false);
  return (
    <div style={stage}>
      <Button variant="secondary" onClick={() => setOpen(true)}>Choose a video plan</Button>
      <Dialog open={open} onClose={close} title="Choose a video plan">{cards}</Dialog>
    </div>
  );
};

export const Playground: Story<DialogProps> = (args) => <div style={stage}><Dialog {...args}>{cards}</Dialog></div>;
Playground.args = { open: true, title: 'Choose a video plan', description: 'Plans differ in motion polish and what they need from you.', width: 520 };

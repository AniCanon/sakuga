import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import face from '@design/blobs/322a5d0e1f576b54cdd579a1f4bf2a2f.jpg';
import { Button } from '../Button/Button';
import { Loader } from '../Loader/Loader';
import { Toast, type ToastProps } from './Toast';

export default { title: 'Sakuga / Feedback / Toast' } satisfies StoryDefault;

const col = { display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' } as const;

export const Confirmation: Story = () => {
  const [open, setOpen] = useState(true);
  return (
    <div style={col}>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Save the look</Button>
      <div style={{ minHeight: 66, width: '100%' }}>
        <Toast open={open} onDismiss={() => setOpen(false)} title="Plaid overshirt joined his looks" text="20 fragments charged. The portrait is on us." />
      </div>
    </div>
  );
};

export const WithAction: Story = () => <Toast title="Scene 4 deleted" text="Its takes went with it."><Button variant="ghost" size="sm">Undo</Button></Toast>;

export const Picture: Story = () => <Toast image={face} title="Aiko joined EBA" text="She can edit every scene." />;

export const Icon: Story = () => <Toast icon="bookmark" title="Saved for later" />;

export const Media: Story = () => <Toast media={<Loader size={20} label="Publishing" />} title="Publishing to YouTube" text="We will tell you when it is up." />;

export const Playground: Story<ToastProps> = (args) => <Toast {...args} />;
Playground.args = { title: 'Plaid overshirt joined his looks', text: '20 fragments charged.', icon: 'check' };

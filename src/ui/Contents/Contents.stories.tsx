import type { Story, StoryDefault } from '@ladle/react';
import { useState, type ReactNode } from 'react';
import { Contents, type ContentsProps } from './Contents';

export default { title: 'Sakuga / Navigation / Contents' } satisfies StoryDefault;

const SECTIONS = ['Setting', 'The premise: Ancestral Fragments', 'The awakening mechanic', "The corporation's leash, and why it failed", 'What the Professor and the seven solved', 'The seizure was military', 'The research was destroyed by no one', 'Dates and durations are never stated', 'The three awakenings across the arc'].map((label) => ({ label }));

const Box = ({ children }: { children: ReactNode }) => <div style={{ maxWidth: 300 }}>{children}</div>;

export const Limited: Story = () => {
  const [open, setOpen] = useState(2);
  return <Box><Contents label="Sections of World rules" items={SECTIONS} current={open} onSelect={setOpen} limit={6} /></Box>;
};

export const All: Story = () => {
  const [open, setOpen] = useState(0);
  return <Box><Contents label="Sections of World rules" items={SECTIONS} current={open} onSelect={setOpen} /></Box>;
};

export const Inset: Story = () => <Box><Contents label="Sections of World rules" items={SECTIONS.slice(0, 4)} current={1} inset /></Box>;

export const Playground: Story<ContentsProps> = (args) => <Box><Contents {...args} /></Box>;
Playground.args = { label: 'Sections of World rules', items: SECTIONS, current: 2, limit: 6, inset: false };

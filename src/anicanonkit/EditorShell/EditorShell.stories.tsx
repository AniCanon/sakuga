import type { Story, StoryDefault } from '@ladle/react';
import art from '@design/blobs/70a79c6a67f31e4250d80f3e68d60502.jpg';
import { Button } from '../../ui/Button/Button';
import { FloatingToolbar } from '../../ui/FloatingToolbar/FloatingToolbar';
import { IconButton } from '../../ui/IconButton/IconButton';
import type { IconName } from '../../ui/Icon/Icon';
import { Monitor } from '../Monitor/Monitor';
import { EditorShell, type EditorShellProps } from './EditorShell';

export default { title: 'AniCanonKit / Productions / EditorShell' } satisfies StoryDefault;

const label = { font: '600 13px var(--font-sans)' } as const;

export const Editor: Story = () => (
  <EditorShell height={360}>
    <span slot="tool"><div style={label}>Media</div></span>
    <Monitor image={art} labels={['2C · take 3', '2:41 + 04f']} height={200} />
    <span slot="inspector"><div style={label}>Cut 2C</div></span>
  </EditorShell>
);

/* The panes resized from their handles: toolWidth and inspectorWidth start them, onResize keeps them */
export const Resized: Story = () => (
  <EditorShell height={360} toolWidth={400} inspectorWidth={260}>
    <span slot="tool"><div style={label}>Media</div></span>
    <Monitor image={art} labels={['2C · take 3', '2:41 + 04f']} height={200} />
    <span slot="inspector"><div style={label}>Cut 2C</div></span>
  </EditorShell>
);

/* Focus mode as the locked board ProdCutFocus draws its float layer: one row inset 24px (inset-xl) from the shell's sides and 20px
   from its top, the production's name, the tools, and Leave focus at the far end */
const TOOLS: [IconName, string][] = [
  ['collection', 'Media'], ['template', 'Titles'], ['effect-sparks', 'Effects'], ['sliders', 'Adjust'], ['aspect', 'Composition'],
  ['lens-macro-detail', 'Repair'], ['volume', 'Audio'], ['effect-particles', 'Sound'], ['captions', 'Captions'], ['users', 'Credits'], ['bookmark', 'Sections'],
];

export const Focus: Story = () => (
  <EditorShell height={560} focus>
    <span slot="tool"><div style={label}>Media</div></span>
    <Monitor image={art} labels={['2C · take 3', '2:41 + 04f']} height={440} />
    <span slot="float">
      <div style={{ position: 'absolute', left: 'var(--inset-xl)', right: 'var(--inset-xl)', top: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <FloatingToolbar label="Production">
          <b style={{ font: '700 14px/18px var(--font-display)', color: 'var(--text-on-media)', padding: '0 6px' }}>The First Watch</b>
          <span style={{ font: '600 12.5px/16px var(--font-sans)', color: 'var(--text-on-media-muted)', paddingRight: 6 }}>Cut · 2:41 + 04f</span>
        </FloatingToolbar>
        <FloatingToolbar label="Tools">
          {TOOLS.map(([icon, name]) => <IconButton key={name} variant="media" icon={icon} label={name} />)}
        </FloatingToolbar>
        <span style={{ flex: 1 }} />
        <Button variant="media-secondary" size="sm" icon="fullscreen" href="#editor">Leave focus</Button>
      </div>
    </span>
  </EditorShell>
);

export const Playground: Story<EditorShellProps> = (args) => (
  <EditorShell {...args}>
    <span slot="tool"><div style={label}>Media</div></span>
    <Monitor image={art} labels={['2C · take 3']} height={200} />
    <span slot="inspector"><div style={label}>Cut 2C</div></span>
  </EditorShell>
);
Playground.args = { height: 360, focus: false, inspectorLabel: 'Inspector' };

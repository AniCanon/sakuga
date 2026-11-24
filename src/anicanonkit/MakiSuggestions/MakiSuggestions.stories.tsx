import type { Story, StoryDefault } from '@ladle/react';
import { MakiSuggestions, type MakiSuggestionsProps } from './MakiSuggestions';

export default { title: 'AniCanonKit / Maki / MakiSuggestions' } satisfies StoryDefault;

const col = { width: 340 };

export const Suggestions: Story = () => <div style={col}><MakiSuggestions label="What to ask" items={['Which issue matters most?', 'Why doesn’t the story hold up?', 'What happens to Mio next?']} /></div>;

export const Playground: Story<MakiSuggestionsProps> = (args) => <div style={col}><MakiSuggestions {...args} /></div>;
Playground.args = { label: 'What to ask', items: ['Which issue matters most?', 'Why doesn’t the story hold up?'] };

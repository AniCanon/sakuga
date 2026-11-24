import { describe, expect, it } from 'vitest';
import { bindLoose, formatMention, formatPrompt, parsePrompt, type PromptSegment } from './mentionGrammar';

/* Cases from anime-studio's agent-prompt-parity corpus (AgentPromptSyntax), by its names: the server reads these tokens this way */
const mentions = (s: string) => parsePrompt(s).filter((x) => x.t !== 'text');

describe('mentionGrammar reads tokens as the server does', () => {
  it('a typed token, with the outfit in its id', () => {
    expect(mentions('@[Smith (School Uniform):character:smith:outfit:school-uniform] waits by the gate.')).toEqual([
      { t: 'mention', label: 'Smith (School Uniform)', category: 'character', id: 'smith', outfitId: 'school-uniform' },
    ]);
  });
  it('a legacy two-part token resolves as a character', () => {
    expect(mentions('@[Smith:smith] steps forward.')).toEqual([{ t: 'mention', label: 'Smith', category: 'character', id: 'smith' }]);
  });
  it('a reversed three-part token resolves as a character', () => {
    expect(mentions('@[Smith:smith:character] steps forward.')).toEqual([{ t: 'mention', label: 'Smith', category: 'character', id: 'smith' }]);
  });
  it('a colon-bearing canonical id keeps its namespace', () => {
    expect(mentions('@[Alice:character:ns:id-123] enters the lab.')).toEqual([{ t: 'mention', label: 'Alice', category: 'character', id: 'ns:id-123' }]);
    expect(mentions('@[Night Pier:backdrop:ns:b-1] at dusk.')).toEqual([{ t: 'mention', label: 'Night Pier', category: 'backdrop', id: 'ns:b-1' }]);
  });
  it('faction and location tokens parse', () => {
    expect(mentions('@[Crimson Hand:faction:f-1] marches at dawn.')[0]).toMatchObject({ category: 'faction', id: 'f-1' });
    expect(mentions('@[Cafe:location:l-1] opens early.')[0]).toMatchObject({ category: 'location', id: 'l-1' });
  });
  it('an unterminated @[ is text and does not swallow the next token', () => {
    expect(parsePrompt('@[broken and @[Smith:character:smith] arrive.')).toEqual([
      { t: 'text', text: '@[broken and ' },
      { t: 'mention', label: 'Smith', category: 'character', id: 'smith' },
      { t: 'text', text: ' arrive.' },
    ]);
  });
  it('a $ alias is its own segment, but not inside a word', () => {
    expect(mentions('Match the pose in $storyboard-1 for @Smith.')).toEqual([{ t: 'alias', alias: 'storyboard-1' }]);
    expect(mentions('cost a$5 fee')).toEqual([]);
  });
  it('loose @Name and #Place stay text: the server resolves them', () => {
    expect(parsePrompt('@Smith on #Back Alley')).toEqual([{ t: 'text', text: '@Smith on #Back Alley' }]);
  });
});

describe('mentionGrammar writes what it reads', () => {
  it('round-trips a prompt', () => {
    const s = '@[Kiko:character:kiko:outfit:casual] runs for @[Red Line Platform Edge:backdrop:b-9], see $rain-look.';
    expect(formatPrompt(parsePrompt(s))).toBe(s);
  });
  it('writes a label that would break the token as plain text', () => {
    const seg: PromptSegment[] = [{ t: 'mention', label: 'Kaz] Bo', category: 'character', id: 'bracket-name' }, { t: 'text', text: ' waits' }];
    expect(formatPrompt(seg)).toBe('@Kaz] Bo waits');
  });
});

/* The portal cases of anime-studio's agent-prompt-parity corpus, with its roster: what the server's portal path stores */
describe('bindLoose stores loose names as the server expects', () => {
  const roster = {
    cast: [
      { id: 'smith', name: 'Smith', outfits: [{ id: 'hero-suit', label: 'Hero Suit' }, { id: 'school-uniform', label: 'School Uniform' }, { id: 'work-suit', label: 'Work Suit' }] },
      { id: 'smithy', name: 'Smithy' }, { id: 'ann', name: 'Ann' }, { id: 'ann-marie', name: 'Ann Marie' },
      { id: 'ns:id-123', name: 'Alice', outfits: [{ id: 'lab-coat', label: 'Lab Coat' }] }, { id: 'rin', name: 'Rin', outfits: [{ id: 'rain-coat', label: 'Rain Coat' }] },
      { id: 'ghost', name: 'Ghost' }, { id: 'colon-name', name: 'Dr: Nine' }, { id: 'bracket-name', name: 'Kaz] Bo' },
      { id: 'yuki-a', name: 'Yuki' }, { id: 'yuki-b', name: 'Yuki' }, { id: 'kim-sr', name: 'Kim (Sr.) Park' },
    ],
    places: [{ id: 'b-rooftop', name: 'RooftopDusk' }, { id: 'b-alley', name: 'Back Alley' }, { id: 'ns:b-1', name: 'Night Pier' }],
  };
  const cases: [string, string][] = [
    ['@Smith (School Uniform) waits by the gate.', '@[Smith (School Uniform):character:smith:outfit:school-uniform] waits by the gate.'],
    ['@Ann Marie greets @Ann at the door.', '@[Ann Marie:character:ann-marie] greets @[Ann:character:ann] at the door.'],
    ['Email foo@Smith about the shoot.', 'Email foo@Smith about the shoot.'],
    ['@Smithers arrives late.', '@Smithers arrives late.'],
    ['@Smithy patrols the yard.', '@[Smithy:character:smithy] patrols the yard.'],
    ['@sMiTh nods.', '@[sMiTh:character:smith] nods.'],
    ['@smith (school uniform) enters.', '@[smith (school uniform):character:smith:outfit:school-uniform] enters.'],
    ['@Dr: Nine reviews the chart.', '@Dr: Nine reviews the chart.'],
    ['@Kaz] Bo waves.', '@Kaz] Bo waves.'],
    ['@RooftopDusk is empty and #Smith is nobody.', '@RooftopDusk is empty and #Smith is nobody.'],
    ['@Smith, then @Smith.', '@[Smith:character:smith], then @[Smith:character:smith].'],
    ['The last to arrive is @Ghost', 'The last to arrive is @[Ghost:character:ghost]'],
    ['@Smith (School Uniform) in back and @Smith (Work Suit) in front.', '@[Smith (School Uniform):character:smith:outfit:school-uniform] in back and @[Smith (Work Suit):character:smith:outfit:work-suit] in front.'],
    ['@[Jones:character:jones] waits for @Smith.', '@[Jones:character:jones] waits for @[Smith:character:smith].'],
    ['@[Smith:character:smith] (Work Suit) waits.', '@[Smith:character:smith] (Work Suit) waits.'],
    ['@Smith  (work suit) enters.', '@[Smith:character:smith]  (work suit) enters.'],
    ['@Smith (grinning) waits.', '@[Smith:character:smith] (grinning) waits.'],
    ['@Smith, (Work Suit) waits.', '@[Smith:character:smith], (Work Suit) waits.'],
    ['@Rin shelters under the eaves.', '@[Rin:character:rin] shelters under the eaves.'],
    ['@[Smith:smith] steps forward.', '@[Smith:smith] steps forward.'],
    ['@[Smith:] is not a token.', '@[Smith:] is not a token.'],
    ['@Alice (Lab Coat) enters the lab.', '@[Alice (Lab Coat):character:ns:id-123:outfit:lab-coat] enters the lab.'],
    ['@[broken and @Smith arrive.', '@[broken and @[Smith:character:smith] arrive.'],
    ['#RooftopDusk then #Back Alley then #RooftopDusk again.', '@[RooftopDusk:backdrop:b-rooftop] then @[Back Alley:backdrop:b-alley] then @[RooftopDusk:backdrop:b-rooftop] again.'],
    ['#Harbor at dawn.', '#Harbor at dawn.'],
    ['Match the pose in $storyboard-1 for @Smith.', 'Match the pose in $storyboard-1 for @[Smith:character:smith].'],
    ['@Jones waits at the gate.', '@Jones waits at the gate.'],
    ['@Yuki bows.', '@[Yuki:character:yuki-a] bows.'],
  ];
  it.each(cases)('%s', (input, stored) => expect(bindLoose(input, roster)).toBe(stored));
});

describe('bindLoose binds a place’s views', () => {
  const roster = { places: [{ id: 'l-a', name: 'Kagari Lighthouse', views: [{ id: 'b-lens', name: 'Fresnel Lens' }, { id: 'b-watch', name: 'Watch Room' }] }, { id: 'l-b', name: 'Low Harbor', views: [{ id: 'b-quay', name: 'The Quay' }] }] };
  it.each([
    ['#Fresnel Lens glows.', '@[Fresnel Lens:backdrop:b-lens] glows.'],
    ['#Low Harbor at dusk.', '@[Low Harbor:backdrop:b-quay] at dusk.'],
    ['#The Quay at dusk.', '@[The Quay:backdrop:b-quay] at dusk.'],
    ['#Kagari Lighthouse stands.', '#Kagari Lighthouse stands.'],
  ])('%s', (input, stored) => expect(bindLoose(input, roster)).toBe(stored));
});

describe('objects', () => {
  it('reads and writes an & object as a typed token, and falls back to &Name when the label cannot be one', () => {
    expect(parsePrompt('Take @[The logbook:object:o1] now')).toEqual([{ t: 'text', text: 'Take ' }, { t: 'mention', label: 'The logbook', category: 'object', id: 'o1' }, { t: 'text', text: ' now' }]);
    expect(formatMention({ label: 'The logbook', category: 'object', id: 'o1' })).toBe('@[The logbook:object:o1]');
    expect(formatMention({ label: 'Log: one', category: 'object', id: 'o1' })).toBe('&Log: one');
  });
});

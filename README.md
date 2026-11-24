<div align="center">

<img src="assets/sakuga-logo.png" alt="Sakuga" width="420" />

### The AniCanon™ Design System for React

UI components, studio tools, design tokens, and icons.

[**Install**](#install) · [**Usage**](#usage) · [**Features**](#features) · [**Components**](#components) · [**Contributing**](CONTRIBUTING.md) · [**License**](LICENSE) · [**Trademarks**](TRADEMARKS.md)

</div>

---

## Install

```bash
npm install @anicanon/sakuga
```

Requires React 18 or later. It is on npm, so no registry setup is needed.

## Usage

Import the styles and wrap your app in `<Sakuga>`:

```tsx
import '@anicanon/sakuga/tokens.css';
import '@anicanon/sakuga/fonts.css';
import icons from '@anicanon/sakuga/icons?url';
import { Sakuga, Button } from '@anicanon/sakuga/ui';
import { SpendButton } from '@anicanon/sakuga/anicanonkit';

export function App() {
  return (
    <Sakuga icons={icons}>
      <Button variant="primary" icon="plus">New cut</Button>
      <SpendButton cost="~4">Render cut</SpendButton>
    </Sakuga>
  );
}
```

## Entry points

| Path | Description |
| :--- | :--- |
| `@anicanon/sakuga/tokens.css` | Design tokens (`--sk-*`), dark and light themes, and base styles. |
| `@anicanon/sakuga/fonts.css` | Font definitions (`@font-face`). |
| `@anicanon/sakuga/icons` | SVG icon sprite (`icons.svg`). Import with `?url` and pass to `<Sakuga icons={icons}>`. |
| `@anicanon/sakuga/ui` | 61 core UI components, hooks, and helpers. |
| `@anicanon/sakuga/anicanonkit` | 61 components for storyworlds, Maki AI, manga, and anime production. |

## Features

### Theme

Dark mode is the default. Use `useTheme()` to read or switch the theme:

```tsx
const { theme, setTheme } = useTheme();

setTheme('light'); // Switch to light
setTheme('dark');  // Switch to dark
setTheme(null);    // Reset to default
```

You can also set `data-theme="light"` or `data-theme="dark"` on any HTML element to theme part of a page.

### Scrollbars

Scrollbars inside `.sk-root` are Sakuga's own: thin, with no track, the thumb a quiet fill (`--scrollbar-thumb`, the theme's `bg-fill`) that darkens under the pointer (`--scrollbar-thumb-hover`, `border-control`), in both themes. They never take the accent. A component that hides its bar says so in its own README.

### Localization

Pass your `i18next` translator (`t`) and language code to `<Sakuga>`:

```tsx
const { t, i18n } = useTranslation('sakuga');

<Sakuga icons={icons} locale={i18n.resolvedLanguage} t={t}>
  {children}
</Sakuga>
```

Or pass a plain object to `messages`:

```tsx
<Sakuga icons={icons} locale="pt-BR" messages={{ close: 'Fechar', clear: 'Limpar' }}>
  {children}
</Sakuga>
```

Missing keys fall back to Sakuga's English. Each component carries only its own words, so a page loads just the words of
the parts it uses. To translate them all, read the English from `messages`: `@anicanon/sakuga/anicanonkit` exports every word,
and `@anicanon/sakuga/ui` the core's.

### The loader

Every core part that waits (a busy `Button`, a `DropZone` reading a file, a `VideoPlayer` loading, a `Thumb` whose picture is
being drawn) draws one loader. It's Sakuga's own `Loader` unless the app passes its own to `<Sakuga loader>`:

```tsx
<Sakuga icons={icons} loader={Loader /* from '@anicanon/sakuga/anicanonkit' */}>
```

### View transitions

Animate page or view changes with `transition()`:

```tsx
import { transition } from '@anicanon/sakuga/ui';

transition(() => navigate('/cuts/12'), {
  kind: 'page',         // 'page' | 'view' | 'takeover'
  direction: 'forward', // 'forward' | 'back'
});
```

Add `className="sk-page"` to pages or `className="sk-view"` to views.

### Sound

UI sounds are off by default. Enable them with `sound`:

```tsx
import { sound } from '@anicanon/sakuga/ui';

sound.on();
sound.off();
sound.volume(0.8);  // 0 to 1
sound('published'); // 'ready' | 'failed' | 'published' | 'fragments' | 'maki'
```

### Image cropping

Use [`Cropper`](src/ui/Cropper/README.md) to crop an image, and `cropStyle()` to preview the crop in `Thumb`, `CastAvatar`, `MentionChip`, or `CharacterCard`:

```tsx
import { Cropper, Thumb, cropStyle, type CropValue } from '@anicanon/sakuga/ui';

const [crop, setCrop] = useState<CropValue>({ x: 0.5, y: 0.4, size: 0.36 });

<Cropper image="/sheet.jpg" alt="Character sheet" aspect={16 / 9} value={crop} onChange={setCrop} />
<Thumb image="/sheet.jpg" alt="Preview" ratio="1 / 1" imageStyle={cropStyle(crop, 16 / 9)} />
```

## Components

Every component folder in [`src/ui/`](src/ui) and [`src/anicanonkit/`](src/anicanonkit) has a `README.md` with its props and keyboard shortcuts. Each component's doc comment, which your editor shows on hover, says what it is, what to use instead, its accessibility and its version. [docs/USING.md](docs/USING.md) covers tokens, themes, words and which library to reach for.

### Core (`@anicanon/sakuga/ui`)

| Category | Components |
| :--- | :--- |
| **Foundations** | [`Badge`](src/ui/Badge/README.md) · [`Caption`](src/ui/Caption/README.md) · [`EmptyState`](src/ui/EmptyState/README.md) · [`FieldHelp`](src/ui/FieldHelp/README.md) · [`Icon`](src/ui/Icon/README.md) · [`Loader`](src/ui/Loader/README.md) · [`Notice`](src/ui/Notice/README.md) · [`Progress`](src/ui/Progress/README.md) · [`SectionHeader`](src/ui/SectionHeader/README.md) · [`Text`](src/ui/Text/README.md) · [`TextLink`](src/ui/TextLink/README.md) · [`Thumb`](src/ui/Thumb/README.md) · [`Toast`](src/ui/Toast/README.md) |
| **Buttons** | [`Button`](src/ui/Button/README.md) · [`Checkbox`](src/ui/Checkbox/README.md) · [`Chip`](src/ui/Chip/README.md) · [`IconButton`](src/ui/IconButton/README.md) · [`OptionTiles`](src/ui/OptionTiles/README.md) · [`ProviderButton`](src/ui/ProviderButton/README.md) · [`SegmentedControl`](src/ui/SegmentedControl/README.md) · [`Switch`](src/ui/Switch/README.md) |
| **Inputs** | [`ColorPicker`](src/ui/ColorPicker/README.md) · [`Cropper`](src/ui/Cropper/README.md) · [`DateField`](src/ui/DateField/README.md) · [`DropZone`](src/ui/DropZone/README.md) · [`Field`](src/ui/Field/README.md) · [`NumberField`](src/ui/NumberField/README.md) · [`Picker`](src/ui/Picker/README.md) · [`SearchField`](src/ui/SearchField/README.md) · [`Select`](src/ui/Select/README.md) · [`SliderRow`](src/ui/SliderRow/README.md) · [`SwatchPicker`](src/ui/SwatchPicker/README.md) · [`TextField`](src/ui/TextField/README.md) |
| **Layout & Navigation** | [`FlowFooter`](src/ui/FlowFooter/README.md) · [`FlowHeader`](src/ui/FlowHeader/README.md) · [`PageHeader`](src/ui/PageHeader/README.md) · [`Pagination`](src/ui/Pagination/README.md) · [`Panel`](src/ui/Panel/README.md) · [`PanelRow`](src/ui/PanelRow/README.md) · [`SideNav`](src/ui/SideNav/README.md) · [`SidePanel`](src/ui/SidePanel/README.md) · [`StatusBar`](src/ui/StatusBar/README.md) · [`Stepper`](src/ui/Stepper/README.md) · [`TabBar`](src/ui/TabBar/README.md) · [`TopNav`](src/ui/TopNav/README.md) |
| **Overlays** | [`Dialog`](src/ui/Dialog/README.md) · [`FloatingToolbar`](src/ui/FloatingToolbar/README.md) · [`Menu`](src/ui/Menu/README.md) · [`Popover`](src/ui/Popover/README.md) · [`Sheet`](src/ui/Sheet/README.md) |
| **Data & Lists** | [`CastAvatar`](src/ui/CastAvatar/README.md) · [`CastStack`](src/ui/CastStack/README.md) · [`FactList`](src/ui/FactList/README.md) · [`List`](src/ui/List/README.md) · [`ListRow`](src/ui/ListRow/README.md) · [`PropertyList`](src/ui/PropertyList/README.md) · [`TagList`](src/ui/TagList/README.md) |
| **Media** | [`AudioPlayer`](src/ui/AudioPlayer/README.md) · [`MediaCard`](src/ui/MediaCard/README.md) · [`Scrubber`](src/ui/Scrubber/README.md) · [`Timeline`](src/ui/Timeline/README.md) · [`Waveform`](src/ui/Waveform/README.md) |

### Studio (`@anicanon/sakuga/anicanonkit`)

| Category | Components |
| :--- | :--- |
| **Economy & Progress** | [`ActivityPanel`](src/anicanonkit/ActivityPanel/README.md) · [`ActivityRow`](src/anicanonkit/ActivityRow/README.md) · [`FragmentBalance`](src/anicanonkit/FragmentBalance/README.md) · [`FragmentSoul`](src/anicanonkit/FragmentSoul/README.md) · [`Loader`](src/anicanonkit/AniCanonLoader/README.md) · [`PremiereSlot`](src/anicanonkit/PremiereSlot/README.md) · [`Readiness`](src/anicanonkit/Readiness/README.md) · [`SpendButton`](src/anicanonkit/SpendButton/README.md) · [`SpendTiles`](src/anicanonkit/SpendTiles/README.md) · [`Stages`](src/anicanonkit/Stages/README.md) |
| **World & Cast** | [`CastCard`](src/anicanonkit/CastCard/README.md) · [`CastGrid`](src/anicanonkit/CastGrid/README.md) · [`CharacterCard`](src/anicanonkit/CharacterCard/README.md) · [`CharacterStats`](src/anicanonkit/CharacterStats/README.md) · [`CoverageTable`](src/anicanonkit/CoverageTable/README.md) · [`EntityRow`](src/anicanonkit/EntityRow/README.md) · [`EventGlyph`](src/anicanonkit/EventGlyph/README.md) · [`LookPlate`](src/anicanonkit/LookPlate/README.md) · [`PlaceCard`](src/anicanonkit/PlaceCard/README.md) · [`StateChange`](src/anicanonkit/StateChange/README.md) · [`VoiceTiles`](src/anicanonkit/VoiceTiles/README.md) |
| **Story & Manuscript** | [`DialogueLine`](src/anicanonkit/DialogueLine/README.md) · [`Manuscript`](src/anicanonkit/Manuscript/README.md) · [`ManuscriptSection`](src/anicanonkit/ManuscriptSection/README.md) · [`Mention`](src/anicanonkit/Mention/README.md) · [`MentionChip`](src/anicanonkit/MentionChip/README.md) · [`PanelHeader`](src/anicanonkit/PanelHeader/README.md) · [`PanelSection`](src/anicanonkit/PanelSection/README.md) · [`ProposalCard`](src/anicanonkit/ProposalCard/README.md) · [`QuestionRow`](src/anicanonkit/QuestionRow/README.md) · [`ScreenplayLine`](src/anicanonkit/ScreenplayLine/README.md) · [`StoryMap`](src/anicanonkit/StoryMap/README.md) · [`StoryScrubber`](src/anicanonkit/StoryScrubber/README.md) |
| **Maki AI** | [`AskMaki`](src/anicanonkit/AskMaki/README.md) · [`ChatMessage`](src/anicanonkit/ChatMessage/README.md) · [`MakiCard`](src/anicanonkit/MakiCard/README.md) · [`MakiComposer`](src/anicanonkit/MakiComposer/README.md) · [`MakiFinding`](src/anicanonkit/MakiFinding/README.md) · [`MakiFindingGroup`](src/anicanonkit/MakiFindingGroup/README.md) · [`MakiPanel`](src/anicanonkit/MakiPanel/README.md) · [`MakiStep`](src/anicanonkit/MakiStep/README.md) · [`MakiSuggestions`](src/anicanonkit/MakiSuggestions/README.md) · [`MakiTurn`](src/anicanonkit/MakiTurn/README.md) · [`PromptComposer`](src/anicanonkit/PromptComposer/README.md) |
| **Cuts & Continuity** | [`CutCell`](src/anicanonkit/CutCell/README.md) · [`CutRow`](src/anicanonkit/CutRow/README.md) · [`CutSheet`](src/anicanonkit/CutSheet/README.md) · [`Revision`](src/anicanonkit/Revision/README.md) · [`Shorthand`](src/anicanonkit/Shorthand/README.md) · [`Slip`](src/anicanonkit/Slip/README.md) · [`Timesheet`](src/anicanonkit/Timesheet/README.md) |
| **Editors & Manga** | [`CanvasStage`](src/anicanonkit/CanvasStage/README.md) · [`EditorHeader`](src/anicanonkit/EditorHeader/README.md) · [`EditorShell`](src/anicanonkit/EditorShell/README.md) · [`IssueStrip`](src/anicanonkit/IssueStrip/README.md) · [`LayerStrip`](src/anicanonkit/LayerStrip/README.md) · [`MangaPage`](src/anicanonkit/MangaPage/README.md) · [`Monitor`](src/anicanonkit/Monitor/README.md) · [`MonitorBar`](src/anicanonkit/MonitorBar/README.md) · [`PageWall`](src/anicanonkit/PageWall/README.md) · [`ProductionNav`](src/anicanonkit/ProductionNav/README.md) · [`ProgramBar`](src/anicanonkit/ProgramBar/README.md) · [`TrimFrames`](src/anicanonkit/TrimFrames/README.md) · [`ViewHeader`](src/anicanonkit/ViewHeader/README.md) · [`VolumeControl`](src/anicanonkit/VolumeControl/README.md) |

## Development

```bash
npm install
npm run ladle   # Open component preview at localhost:61000
npm run parity  # Compare design bundle vs. React components at localhost:5199
npm run check   # Run tests, typecheck, build, and visual checks
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/PORTING.md](docs/PORTING.md), and [docs/PERFORMANCE.md](docs/PERFORMANCE.md) for internal documentation.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). All commits require a sign-off (`git commit -s`).

## License

The code is MIT: see [LICENSE](LICENSE).

The names and logos AniCanon™, Sakuga and AniCanonKit are trademarks of AniCanon™ and are not covered by the MIT license: see [TRADEMARKS.md](TRADEMARKS.md).

The Funnel Display and Funnel Sans fonts in [`src/fonts/`](src/fonts) are © The Funnel Project Authors and are licensed under the SIL Open Font License 1.1, not MIT: see [`src/fonts/OFL.txt`](src/fonts/OFL.txt).

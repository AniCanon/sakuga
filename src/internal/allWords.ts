import { words as w42 } from '../ui/AudioPlayer/words';
import { words as w43 } from '../ui/Button/words';
import { words as w44 } from '../ui/CastAvatar/words';
import { words as w45 } from '../ui/ColorPicker/words';
import { words as wContents } from '../ui/Contents/words';
import { words as w46 } from '../ui/Cropper/words';
import { words as w47 } from '../ui/DateField/words';
import { words as w48 } from '../ui/DropZone/words';
import { words as w49 } from '../ui/FieldHelp/words';
import { words as w50 } from '../ui/FloatingToolbar/words';
import { words as w51 } from '../ui/ListRow/words';
import { words as w52 } from '../ui/MediaCard/words';
import { words as w53 } from '../ui/MoreWrap/words';
import { words as w54 } from '../ui/NumberField/words';
import { words as w55 } from '../ui/Pagination/words';
import { words as w57 } from '../ui/ProviderButton/words';
import { words as w58 } from '../ui/SearchField/words';
import { words as w59 } from '../ui/SideNav/words';
import { words as w60 } from '../ui/SidePanel/words';
import { words as w61 } from '../ui/Stepper/words';
import { words as w62 } from '../ui/TabBar/words';
import { words as w63 } from '../ui/TagList/words';
import { words as w64 } from '../ui/Thumb/words';
import { words as w65 } from '../ui/Timeline/words';
import { words as w66 } from '../ui/Toast/words';
import { words as w67 } from '../ui/TopNav/words';
import { words as w68 } from '../ui/VideoPlayer/words';
import { words as w69 } from '../ui/Waveform/words';
import { words as wList } from '../ui/List/words';
import { core, type SakugaMessages } from './words';

/** The core's words in English, by key: the core's own and every core component's. An app reads it to translate them; a
 *  component carries only its own. With AniCanonKit, its `messages` is every word, the Kit's included. */
export const messages: Readonly<SakugaMessages> = Object.freeze({ ...core, ...w42, ...w43, ...w44, ...w45, ...wContents, ...w46, ...w47, ...w48, ...w49, ...w50, ...w51, ...w52, ...w53, ...w54, ...w55, ...w57, ...w58, ...w59, ...w60, ...w61, ...w62, ...w63, ...w64, ...w65, ...w66, ...w67, ...w68, ...w69, ...wList } as SakugaMessages);

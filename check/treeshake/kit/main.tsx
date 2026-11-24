// A page that uses one AniCanonKit component: SpendButton takes Button from the core's public entry, so the build must carry
// Button and the fragment mark, and none of the core's other components.
import { createRoot } from 'react-dom/client';
import { Sakuga } from '@anicanon/sakuga/ui';
import { SpendButton } from '@anicanon/sakuga/anicanonkit';
import '@anicanon/sakuga/tokens.css';
import '@anicanon/sakuga/fonts.css';
import icons from '@anicanon/sakuga/icons?url';

createRoot(document.getElementById('root')!).render(<Sakuga icons={icons}><SpendButton cost="~100">Generate</SpendButton></Sakuga>);

// A page that uses one core component and starts Sakuga: the build must carry Button's and Icon's code and CSS and nothing else,
// none of AniCanonKit, and the sounds only as a chunk of their own.
import { createRoot } from 'react-dom/client';
import { Button, Sakuga } from '@anicanon/sakuga/ui';
import '@anicanon/sakuga/tokens.css';
import '@anicanon/sakuga/fonts.css';
import icons from '@anicanon/sakuga/icons?url';

createRoot(document.getElementById('root')!).render(<Sakuga icons={icons}><Button icon="plus">Generate</Button></Sakuga>);

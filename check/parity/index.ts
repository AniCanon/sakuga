import components from '../../docs/components.json';
import * as ui from '../../src/ui/index';
import * as kit from '../../src/anicanonkit/index';

/* AniCanonKit.Loader is the AniCanonLoader component */
const ported = new Set([...Object.keys(ui), ...Object.keys(kit), ...('Loader' in kit ? ['AniCanonLoader'] : [])]);
const list = document.getElementById('list')!;
const params = new URLSearchParams(location.search);
const current = params.get('c') || 'Button';

for (const library of ['Core', 'Kit']) {
  const h = document.createElement('h2');
  h.textContent = library === 'Core' ? 'Sakuga' : 'AniCanonKit';
  list.append(h);
  for (const c of components.components.filter((x) => x.library === library)) {
    const a = document.createElement('a');
    a.href = `?c=${c.name}`;
    a.textContent = c.name;
    if (ported.has(c.name)) a.className = 'ported';
    if (c.name === current) a.classList.add('on');
    list.append(a);
  }
}

const light = document.getElementById('light') as HTMLInputElement;
light.checked = params.get('theme') === 'light';
function show() {
  const theme = light.checked ? 'light' : 'dark';
  document.getElementById('name')!.textContent = current;
  (document.getElementById('ref') as HTMLIFrameElement).src = `./frame.html?side=ref&c=${current}&theme=${theme}`;
  (document.getElementById('port') as HTMLIFrameElement).src = `./frame.html?side=port&c=${current}&theme=${theme}`;
}
light.addEventListener('change', show);
show();

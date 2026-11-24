import { useState } from 'react';
import type { Story, StoryDefault } from '@ladle/react';
import art from '@design/blobs/dc889fdc8d3ca88f17aa579da03ad184.jpg';
import { CastAvatar } from '../CastAvatar/CastAvatar';
import { Cropper, type CropRegion } from './Cropper';
import { cropStyle, type CropValue } from './crop';

export default { title: 'Sakuga / Inputs / Cropper' } satisfies StoryDefault;

const aspect = 16 / 9;
/* A face sheet's six regions: the 3×2 grid, each centred on its cell and 0.6 of the way down it, at 0.36 of the sheet's height */
const faces: CropRegion[] = Array.from({ length: 6 }, (_, i) => {
  const c = i % 3, r = Math.floor(i / 3);
  return { label: `Face ${i + 1} of 6`, area: { x: c / 3, y: r / 2, w: 1 / 3, h: 1 / 2 }, crop: { x: (c + 0.5) / 3, y: (r + 0.6) / 2, size: 0.36 } };
});

export const FaceSheet: Story = () => {
  const [v, set] = useState<CropValue>(faces[0].crop);
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', maxWidth: 820 }}>
      <div style={{ flex: 1 }}><Cropper image={art} aspect={aspect} value={v} onChange={set} regions={faces} min={0.36} max={0.36} label="Kiko's avatar" /></div>
      <CastAvatar image={art} imageStyle={cropStyle(v, aspect)} name="Kiko" role="How it shows" />
    </div>
  );
};

export const Zoom: Story = () => {
  const [v, set] = useState<CropValue>({ x: 0.5, y: 0.45, size: 0.6 });
  return <div style={{ maxWidth: 620 }}><Cropper image={art} aspect={aspect} value={v} onChange={set} min={0.2} max={1} label="Logo crop" /></div>;
};

export const Square: Story = () => {
  const [v, set] = useState<CropValue>({ x: 0.5, y: 0.5, size: 0.7 });
  return <div style={{ maxWidth: 620 }}><Cropper image={art} aspect={aspect} value={v} onChange={set} min={0.3} max={1} shape="square" label="Series logo" /></div>;
};

export const Still: Story = () => <div style={{ maxWidth: 620 }}><Cropper image={art} aspect={aspect} value={faces[2].crop} regions={faces} min={0.36} max={0.36} /></div>;

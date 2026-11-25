import { useState } from 'react';
import type { Story, StoryDefault } from '@ladle/react';
import take from '@design/blobs/70a79c6a67f31e4250d80f3e68d60502.jpg';
import board from '@design/blobs/a6c677d20d5362900fb4fc56f7761a27.jpg';
import { Timeline, type TimelineProps, type TimelineTrack } from './Timeline';

export default { title: 'Sakuga / Media / Timeline' } satisfies StoryDefault;

const box = { width: 760 } as const;

const cut: TimelineTrack[] = [
  { label: 'Video', kind: 'video', items: [{ start: 0, length: 6, label: 'Take 2', state: 'selected' }, { start: 6, length: 4, label: 'No picture yet', state: 'gap' }] },
  { label: 'Audio', kind: 'audio', items: [{ start: 0, length: 10, label: 'Rain on glass' }] },
  { label: 'Captions JA', kind: 'caption', items: [{ start: 2, length: 1.6, label: '急いで！' }] },
];

export const Default: Story = () => <div style={box}><Timeline duration={12} playhead={4} rate="24 fps" markers={[{ at: 6, label: 'Scene 2' }]} tracks={cut} /></div>;

export const Tracks: Story = () => (
  <div style={box}>
    <Timeline duration={12} playhead={7} rate="24 fps" tracks={[
      { label: 'Video', kind: 'video', items: [{ start: 0, length: 5, label: 'Take 1', image: take }, { start: 5, length: 3, label: 'Take 3', image: take, state: 'rejected' }] },
      { label: 'Storyboard', kind: 'board', items: [{ start: 8, length: 4, image: board, state: 'board' }] },
      { label: 'Title', kind: 'overlay', items: [{ start: 1, length: 3, label: 'EBA' }] },
      { label: 'Kiko', kind: 'dialogue', items: [{ start: 2, length: 2.5, label: 'Hurry!', peaks: [0.2, 0.6, 1, 0.8, 0.4, 0.7, 0.9, 0.3, 0.1] }] },
      { label: 'Score', kind: 'music', items: [{ start: 0, length: 12, label: 'Glass' }] },
      { label: 'Captions EN', kind: 'caption', items: [{ start: 2, length: 2.5, label: 'Hurry!' }] },
      { label: 'Wind', kind: 'effect', items: [{ start: 6, length: 2, label: 'Gust' }] },
    ]} />
  </div>
);

export const Gaps: Story = () => (
  <div style={box}>
    <Timeline duration={12} tracks={[{ label: 'Video', kind: 'video', items: [{ start: 0, length: 4, label: 'Take 1', image: take }, { start: 4, length: 4, state: 'gap' }, { start: 8, length: 4, state: 'board' }] }]} />
  </div>
);

export const Selectable: Story = () => {
  const [on, setOn] = useState<[number, number]>([0, 0]);
  const tracks = cut.map((tr, ti) => ({ ...tr, items: tr.items.map((it, ii) => ({ ...it, state: on[0] === ti && on[1] === ii ? 'selected' as const : it.state === 'selected' ? undefined : it.state })) }));
  return <div style={box}><Timeline duration={12} playhead={4} rate="24 fps" tracks={tracks} onSelect={(t, i) => setOn([t, i])} /></div>;
};

export const Trimming: Story = () => {
  const [item, setItem] = useState({ start: 1, end: 6 });
  return (
    <div style={box}>
      <Timeline duration={12} rate="24 fps" tracks={[
        { label: 'Video', kind: 'video', items: [{ start: item.start, length: item.end - item.start, label: 'Take 2', image: take, state: 'selected', trimmed: { start: 1, end: 1.5 } }] },
      ]} onSelect={() => {}} onTrim={(_t, _i, edge, s) => setItem((v) => (edge === 'in' ? { ...v, start: s } : { ...v, end: s }))} />
    </div>
  );
};

export const Markers: Story = () => (
  <div style={box}>
    <Timeline duration={40} playhead={12} markers={[{ at: 0, label: 'Scene 1' }, { at: 18, label: 'The station at night' }, { at: 20, label: 'Beat' }, { at: 39, label: 'End credits' }]} tracks={cut} />
  </div>
);

export const Reorderable: Story = () => {
  const [list, setList] = useState(cut);
  return (
    <div style={box}>
      <Timeline duration={12} reorderable tracks={list} onMoveTrack={(from, to) => setList((l) => { const n = l.slice(); n.splice(to, 0, n.splice(from, 1)[0]); return n; })} />
    </div>
  );
};

export const Moving: Story = () => <div style={box}><Timeline duration={12} reorderable moving={{ track: 2, to: 1 }} tracks={cut} /></div>;

export const Offset: Story = () => <div style={box}><Timeline duration={20} offset={300} playhead={8} tracks={cut} /></div>;

export const Playground: Story<TimelineProps> = (args) => <div style={box}><Timeline {...args} /></div>;
Playground.args = { duration: 12, playhead: 4, rate: '24 fps', label: 'Timeline', reorderable: false, tracks: cut, markers: [{ at: 6, label: 'Scene 2' }] };

export const Seekable: Story = () => {
  const [at, setAt] = useState(4);
  return <div style={box}><Timeline duration={12} playhead={at} rate="24 fps" tracks={cut} onSeek={setAt} /></div>;
};

export const Droppable: Story = () => {
  const [tracks, setTracks] = useState(cut);
  return <div style={box}><Timeline duration={12} playhead={4} rate="24 fps" tracks={tracks}
    onDrop={(item, at, track) => setTracks((ts) => ts.map((t, i) => i === track ? { ...t, items: [...t.items, { start: at, length: Number(item.length) || 2, label: String(item.label || 'Added') }] } : t))} /></div>;
};

/* Items drag along their track (and Alt and an arrow move them); Picture takes no drop, so a dropped card lands on a free Video lane */
export const Movable: Story = () => {
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    { label: 'Picture', kind: 'video', drop: false, items: [{ start: 0, length: 6, label: 'Take 2' }] },
    { label: 'Video 2', kind: 'video', items: [{ start: 3, length: 4, label: 'Smoke' }] },
    { label: 'Video 3', kind: 'video', items: [] },
  ]);
  return <div style={box}><Timeline duration={12} tracks={tracks} onSelect={() => {}}
    onMoveItem={(ti, ii, at) => setTracks((ts) => ts.map((t, i) => i === ti ? { ...t, items: t.items.map((it, j) => j === ii ? { ...it, start: at } : it) } : t))}
    onDrop={(item, at, ti) => setTracks((ts) => ts.map((t, i) => i === ti ? { ...t, items: [...t.items, { start: at, length: Number(item.length) || 2, label: String(item.label || 'Added') }] } : t))} /></div>;
};

/* A card dragged from the Thumb below shows the Clips lane: Picture takes no drop, so the first clip starts the track */
export const NewLane: Story = () => {
  const [tracks, setTracks] = useState<TimelineTrack[]>([{ label: 'Picture', kind: 'video', drop: false, items: [{ start: 0, length: 12, label: '2A', image: take }] }]);
  return <div style={box}><Timeline duration={12} playhead={4} rate="24 fps" tracks={tracks} newLane={{ label: 'Clips', kind: 'video' }}
    onDrop={(item, at, track) => setTracks((ts) => track === null
      ? [...ts, { label: 'Clips', kind: 'video', items: [{ start: at, length: Number(item.length) || 2, label: String(item.label || 'Added') }] }]
      : ts.map((t, i) => i === track ? { ...t, items: [...t.items, { start: at, length: Number(item.length) || 2, label: String(item.label || 'Added') }] } : t))} /></div>;
};

/* total + onView: the app keeps the window and passes items, markers and the playhead in its time */
const long: TimelineTrack[] = [
  { label: 'Video', kind: 'video', items: [{ start: 0, length: 14, label: 'Take 2' }, { start: 14, length: 22, label: 'Take 5' }, { start: 36, length: 24, label: 'Take 1' }] },
  { label: 'Audio', kind: 'audio', items: [{ start: 0, length: 60, label: 'Rain on glass' }] },
];
export const Zoomable: Story = () => {
  const [view, setView] = useState({ start: 10, length: 20 });
  const shift = (t: TimelineTrack[]) => t.map((tr) => ({ ...tr, items: tr.items.map((it) => ({ ...it, start: it.start - view.start })).filter((it) => it.start < view.length && it.start + it.length > 0) }));
  return <div style={box}><Timeline total={60} offset={view.start} duration={view.length} playhead={22 - view.start} rate="24 fps"
    onView={(start, length) => setView({ start, length })} tracks={shift(long)} /></div>;
};

/* Markers closer than a readable flag share one (1.9): the first named, the rest counted, opening along the rail on hover */
/* onSelectMarker + onMoveMarker: each flag is a button the app opens and moves; the selected one is ringed */
export const MarkersLive: Story = () => {
  const [marks, setMarks] = useState([{ at: 4, label: 'Smoke' }, { at: 9, label: 'Rain', selected: true }]);
  return <div style={box}><Timeline duration={12} playhead={2} rate="24 fps" markers={marks} tracks={cut}
    onSelectMarker={(i) => { setMarks(marks.map((m, j) => ({ ...m, selected: j === i }))); }}
    onMoveMarker={(i, at) => { setMarks(marks.map((m, j) => (j === i ? { ...m, at } : m))); }} /></div>;
};

export const SharedFlags: Story = () => <div style={box}><Timeline duration={60} offset={150} rate="24 fps" markers={[{ at: 11, label: 'Window goes' }, { at: 13, label: 'Smith' }, { at: 40, label: 'Rain' }]} tracks={cut} /></div>;

/* A sound that loops to fill: the 4 s made, again and again across its span, a dashed seam at each start (1.9) */
export const LoopToFill: Story = () => <div style={box}><Timeline duration={12} rate="24 fps" tracks={[
  { label: 'Video', kind: 'video', items: [{ start: 0, length: 12, label: 'Take 2', image: take }] },
  { label: 'Sound', kind: 'audio', items: [{ start: 0, length: 11, label: 'Rain on glass', loop: 4 }] },
]} /></div>;


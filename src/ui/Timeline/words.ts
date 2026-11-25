import type { SakugaMessages } from '../../internal/words';

/** Timeline's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "landsAt": "Lands at {time}",
  "fitCut": "Fit the whole cut",
  "landsAtOn": "Lands at {time} on {track}",
  "noFreeTrack": "No free track at {time}",
  "insertedAt": "{name} inserted at {time}",
  "insertedAtOn": "{name} inserted at {time} on {track}",
  "itemMovedTo": "{name} moved to {time}",
  "moveItemHelp": "Alt and an arrow move it a frame, with Shift a second",
  "moveMarkerHelp": "Enter selects it; drag it, or Alt and an arrow move it a frame, with Shift a second",
  "noPictureYet": "no picture yet",
  "storyboard": "storyboard",
  "thisItem": "this item",
  "trimStart": "Trim the start of {name}",
  "trimEnd": "Trim the end of {name}",
  "timeRange": "{start} to {end}",
  "moveTrack": "Move the {track} track, {n} of {total}",
  "trackMoved": "{track} track moved to {n} of {total}",
  "trackLifted": "{track} track lifted, {n} of {total}",
  "trackDropped": "{track} track dropped where it was",
  "trackPutBack": "{track} track put back",
  "trackTo": "To {n} of {total}",
  "trackMoveHelp": "Up and Down move it a place. Enter or Space lifts it to move it further, and drops it; Escape puts it back.",
  "loopsToFill": "loops to fill, {made} made",
  "markerAndMore": "{name} +{count}",
  "markersHere": "{count} markers: {list}",
  "markerAt": "{name} at {time}"
} satisfies SakugaMessages);

/* Words: every word Sakuga says itself, by key, with its English (README · Words). An app gives its own words for its locale with
   <Sakuga locale messages>. A message is a string with {placeholders}, a { one, other } pair chosen by the locale's plural rules on
   {count}, or a function of its values. Numbers in a message, dates and plurals follow the locale; a key the app leaves out keeps its
   English, with English plural rules. A prop's own words win. Generated from Sakuga's bundle.js WORDS: change the bundle, not this. */
import { createContext, useContext, useMemo } from 'react';

/** A message (README · Words): words with {placeholders}; a pair chosen by the locale's plural rules on {count}; or a function of its values. */
export type SakugaMessage = string | {
  /** The form for zero, where the language has one. */
  zero?: string;
  /** The form for one. */
  one?: string;
  /** The form for two, where the language has one. */
  two?: string;
  /** The form for a few, where the language has one. */
  few?: string;
  /** The form for many, where the language has one. */
  many?: string;
  /** The form for every other count; required. */
  other: string;
} | ((values: Record<string, string | number>) => string);
/** Every word Sakuga says itself, by key, with its English default. Give the keys a locale needs; the rest keep their English. A component's own label prop still wins. */
export interface SakugaMessages {
  /** "Close" · Dialog, PanelHeader and FlowHeader close buttons */ close?: SakugaMessage;
  /** "Add" · Thumb onInsert */ insert?: SakugaMessage;
  /** "Add {name}" · Thumb onInsert */ insertName?: SakugaMessage;
  /** "Enter or a double-click adds it at the playhead; drag it onto the timeline to place it" · Thumb onInsert */ insertHelp?: SakugaMessage;
  /** "Lands at {time}" · Timeline onDrop */ landsAt?: SakugaMessage;
  /** "Fit the whole cut" · Timeline onView */ fitCut?: SakugaMessage;
  /** "Resize the tool panel" · EditorShell */ resizeTool?: SakugaMessage;
  /** "Resize the inspector" · EditorShell */ resizeInspector?: SakugaMessage;
  /** "Lands at {time} on {track}" · Timeline onDrop, moved to a free lane */ landsAtOn?: SakugaMessage;
  /** "No free track at {time}" · Timeline onDrop, refused */ noFreeTrack?: SakugaMessage;
  /** "{name} inserted at {time}" · Timeline onDrop */ insertedAt?: SakugaMessage;
  /** "{name} inserted at {time} on {track}" · Timeline onDrop */ insertedAtOn?: SakugaMessage;
  /** "{name} moved to {time}" · Timeline onMoveItem */ itemMovedTo?: SakugaMessage;
  /** "Alt and an arrow move it a frame, with Shift a second" · Timeline onMoveItem */ moveItemHelp?: SakugaMessage;
  /** "Back" · FlowFooter and ProductionNav back */ back?: SakugaMessage;
  /** "Done" · Sheet done button */ done?: SakugaMessage;
  /** "Search" · TopNav, Picker and SearchField */ search?: SakugaMessage;
  /** "Create" · TopNav and TabBar create */ create?: SakugaMessage;
  /** "Remove {name}" · Chip and TagList remove buttons */ removeItem?: SakugaMessage;
  /** "Add back {name}" · TagList add-back buttons */ restoreItem?: SakugaMessage;
  /** "{name} removed" · TagList, said when a tag is removed */ itemRemoved?: SakugaMessage;
  /** "{name} added back" · TagList, said when a tag comes back */ itemRestored?: SakugaMessage;
  /** "Loading" · Loader */ loading?: SakugaMessage;
  /** "selected" · a selected Panel, Thumb, QuestionRow, TrimFrames frame or MangaPage, said after its name */ selected?: SakugaMessage;
  /** "waiting for you" · MediaCard and ListRow with attention, Readiness */ waitingForYou?: SakugaMessage;
  /** "optional" · after an optional field’s label */ optional?: SakugaMessage;
  /** "Character" · CharacterCard and CoverageTable rows */ character?: SakugaMessage;
  /** "Drawing" · LookPlate, PlaceCard */ drawing?: SakugaMessage;
  /** "Fragments" · FragmentBalance eyebrow */ fragments?: SakugaMessage;
  /** "fragments" · said after a fragment amount: "~100 fragments" */ fragmentsUnit?: SakugaMessage;
  /** "Fragments balance: {amount}" · FragmentBalance and ProductionNav */ fragmentsBalance?: SakugaMessage;
  /** "{amount} fragments" · ProductionNav balance tooltip */ fragmentsAmount?: SakugaMessage;
  /** "Playhead at {time}" · Timeline and ProgramBar */ playheadAt?: SakugaMessage;
  /** "told in {list}" · StoryScrubber and QuestionRow events */ toldIn?: SakugaMessage;
  /** "Told in {list}" · QuestionRow event tooltip */ toldInTitle?: SakugaMessage;
  /** "in the moment shown" · StoryScrubber */ inTheMomentShown?: SakugaMessage;
  /** "not at this moment" · StoryMap, EntityRow */ notAtThisMoment?: SakugaMessage;
  /** "not placed" · StoryMap events */ notPlaced?: SakugaMessage;
  /** "changed" · CutRow, CharacterStats */ changed?: SakugaMessage;
  /** "rejected" · Thumb, Timeline items */ rejected?: SakugaMessage;
  /** "done" · Stages, ProgramBar marks */ doneState?: SakugaMessage;
  /** "Your account" · TopNav and SideNav account button, without a name */ account?: SakugaMessage;
  /** "Your account, {name}" · TopNav and SideNav account button */ accountOf?: SakugaMessage;
  /** "Page {n}" · Pagination page buttons */ pageNumber?: SakugaMessage;
  /** "Page {n} of {total}" · Pagination count */ pageOf?: SakugaMessage;
  /** "Continue with Apple" · ProviderButton */ continueWithApple?: SakugaMessage;
  /** "Continue with Google" · ProviderButton */ continueWithGoogle?: SakugaMessage;
  /** "Close search" · TopNav */ closeSearch?: SakugaMessage;
  /** "Main" · TopNav links */ mainNav?: SakugaMessage;
  /** "Tabs" · TabBar */ tabsNav?: SakugaMessage;
  /** "Sections" · SideNav */ sections?: SakugaMessage;
  /** "{label} navigation" · SideNav links */ sectionsNav?: SakugaMessage;
  /** "Show icons only" · SideNav fold button */ collapseMenu?: SakugaMessage;
  /** "Show the full menu" · SideNav fold button, folded */ expandMenu?: SakugaMessage;
  /** "Series" · SideNav switcher */ series?: SakugaMessage;
  /** "{prefix}: {name}. Switch" · SideNav switcher */ switchSeries?: SakugaMessage;
  /** "Previous page" · Pagination */ previousPage?: SakugaMessage;
  /** "Next page" · Pagination */ nextPage?: SakugaMessage;
  /** "Pages" · Pagination */ pages?: SakugaMessage;
  /** "{from}–{to} of {total}" · Pagination count with a total */ rangeOf?: SakugaMessage;
  /** "{from}–{to} of {total} {noun}" · Pagination count with a total and a noun */ rangeOfNoun?: SakugaMessage;
  /** "Steps" · Stepper */ steps?: SakugaMessage;
  /** "Step {n} of {total}: {name}" · Stepper bar, said */ stepOf?: SakugaMessage;
  /** "Step {n} of {total} · {name}" · Stepper bar, shown */ stepShown?: SakugaMessage;
  /** "Done:" · Stepper, before a done step’s name */ stepDone?: SakugaMessage;
  /** "Watched" · MediaCard progress */ watched?: SakugaMessage;
  /** "watched {percent}%" · MediaCard progress, said */ watchedPercent?: SakugaMessage;
  /** "not in the story at this point" · CastAvatar muted */ notInStory?: SakugaMessage;
  /** "Remind me" · PremiereSlot */ remindMe?: SakugaMessage;
  /** "Remind me when {title} premieres" · PremiereSlot */ remindMeWhen?: SakugaMessage;
  /** one: "{count} second" · other: "{count} seconds" · a time said aloud */ seconds?: SakugaMessage;
  /** one: "{count} minute" · other: "{count} minutes" · a time said aloud */ minutes?: SakugaMessage;
  /** "{minutes} {seconds}" · a time said aloud: "1 minute 5 seconds" */ minutesSeconds?: SakugaMessage;
  /** "{value} of {total}" · Scrubber and Waveform position */ timeOf?: SakugaMessage;
  /** "Seek" · Scrubber */ seek?: SakugaMessage;
  /** "Position" · Waveform */ position?: SakugaMessage;
  /** "Play {name}" · AudioPlayer */ play?: SakugaMessage;
  /** "Pause {name}" · AudioPlayer */ pause?: SakugaMessage;
  /** "Position in {name}" · AudioPlayer */ positionIn?: SakugaMessage;
  /** "audio" · AudioPlayer, without a label */ audio?: SakugaMessage;
  /** "Voice" · CharacterCard voice */ voice?: SakugaMessage;
  /** "{name}’s voice" · CharacterCard voice */ voiceOf?: SakugaMessage;
  /** "the sound" · VolumeControl, without what */ theSound?: SakugaMessage;
  /** "Mute {name}" · VolumeControl */ mute?: SakugaMessage;
  /** "Volume of {name}" · VolumeControl */ volumeOf?: SakugaMessage;
  /** "Muted" · VolumeControl */ muted?: SakugaMessage;
  /** "About {label}" · FieldHelp */ aboutField?: SakugaMessage;
  /** "About this field" · FieldHelp, without a label */ aboutThisField?: SakugaMessage;
  /** "Got it" · FieldHelp with examples, its done button */ gotIt?: SakugaMessage;
  /** "Choose" · Select, without a placeholder */ choose?: SakugaMessage;
  /** "Dismiss" · Toast */ dismiss?: SakugaMessage;
  /** "Options" · Picker */ options?: SakugaMessage;
  /** "out of reach" · a dimmed Picker option */ outOfReach?: SakugaMessage;
  /** "Searching" · SearchField, busy */ searching?: SakugaMessage;
  /** "Nothing matches" · SearchField, no results */ nothingMatches?: SakugaMessage;
  /** one: "{count} result" · other: "{count} results" · SearchField */ results?: SakugaMessage;
  /** "{label} results" · SearchField list */ searchResults?: SakugaMessage;
  /** "Clear search" · SearchField */ clearSearch?: SakugaMessage;
  /** "Selection" · FloatingToolbar */ selection?: SakugaMessage;
  /** "Select {name}" · ListRow checkbox */ selectItem?: SakugaMessage;
  /** "Less {name}" · NumberField */ less?: SakugaMessage;
  /** "More {name}" · NumberField */ more?: SakugaMessage;
  /** "Saturation and brightness" · ColorPicker */ saturationBrightness?: SakugaMessage;
  /** "Saturation {s}%, brightness {v}%" · ColorPicker */ saturationValue?: SakugaMessage;
  /** "Hue" · ColorPicker */ hue?: SakugaMessage;
  /** "Hue {h}°" · ColorPicker */ hueValue?: SakugaMessage;
  /** "Colours in use" · ColorPicker presets */ coloursInUse?: SakugaMessage;
  /** "From the picture" · ColorPicker picture colours */ fromThePicture?: SakugaMessage;
  /** "Previous month" · DateField */ previousMonth?: SakugaMessage;
  /** "Next month" · DateField */ nextMonth?: SakugaMessage;
  /** "Presets" · DateField */ presets?: SakugaMessage;
  /** "{amount} held" · FragmentBalance */ held?: SakugaMessage;
  /** "available" · FragmentBalance card */ available?: SakugaMessage;
  /** "Activity" · ActivityPanel */ activity?: SakugaMessage;
  /** "Close activity" · ActivityPanel */ closeActivity?: SakugaMessage;
  /** one: "{count} running" · other: "{count} running" · ActivityRow */ running?: SakugaMessage;
  /** one: "Activity: {count} running" · other: "Activity: {count} running" · ActivityRow */ activityRunning?: SakugaMessage;
  /** "Wearing" · LookPlate */ lookWearing?: SakugaMessage;
  /** "Showing" · LookPlate */ lookShowing?: SakugaMessage;
  /** "Review" · LookPlate */ lookReview?: SakugaMessage;
  /** "New" · LookPlate */ lookNew?: SakugaMessage;
  /** "Drawing {name}" · LookPlate */ drawingItem?: SakugaMessage;
  /** "Changed from" · StateChange, before the old state */ changedFrom?: SakugaMessage;
  /** "to" · StateChange, before the new state */ changedTo?: SakugaMessage;
  /** "proposed" · StoryMap */ mapProposed?: SakugaMessage;
  /** "a link with a warning" · StoryMap, a node a warning line touches */ mapWarning?: SakugaMessage;
  /** "new" · StoryMap */ mapNew?: SakugaMessage;
  /** "Hubs: cast and places" · StoryMap key */ mapHubs?: SakugaMessage;
  /** "Story map: characters and places as hubs, events between them" · StoryMap */ storyMap?: SakugaMessage;
  /** "Zoom in" · StoryMap, Timeline onView */ zoomIn?: SakugaMessage;
  /** "Fit the map" · StoryMap */ fitMap?: SakugaMessage;
  /** "Zoom" · StoryMap zoom group */ mapZoom?: SakugaMessage;
  /** "Key" · StoryMap */ mapKey?: SakugaMessage;
  /** "The whole map, with the part in view framed" · StoryMap overview */ mapOverview?: SakugaMessage;
  /** "movable" · StoryMap hubs and events */ mapMovable?: SakugaMessage;
  /** "Place" · StoryMap, a place node's quiet line */ mapPlace?: SakugaMessage;
  /** "Episode" · StoryScrubber key */ toldEpisode?: SakugaMessage;
  /** "Manga" · StoryScrubber key */ toldManga?: SakugaMessage;
  /** "Short" · StoryScrubber key */ toldShort?: SakugaMessage;
  /** "Studio" · StoryScrubber key */ toldStudio?: SakugaMessage;
  /** "Event" · StoryScrubber, an event’s kind */ eventEvent?: SakugaMessage;
  /** "Twist" · StoryScrubber */ eventTwist?: SakugaMessage;
  /** "Revelation" · StoryScrubber */ eventRevelation?: SakugaMessage;
  /** "Clue" · StoryScrubber */ eventClue?: SakugaMessage;
  /** "Goal" · StoryScrubber */ eventGoal?: SakugaMessage;
  /** "{type}: {title}" · StoryScrubber, an event and its title */ eventTitled?: SakugaMessage;
  /** "Events in story order" · StoryScrubber */ eventsInOrder?: SakugaMessage;
  /** "marked" · StoryScrubber */ marked?: SakugaMessage;
  /** "Arcs" · StoryScrubber */ arcs?: SakugaMessage;
  /** one: "{name}, {count} event" · other: "{name}, {count} events" · StoryScrubber arcs */ arcEvents?: SakugaMessage;
  /** "None" · StoryScrubber unplaced */ none?: SakugaMessage;
  /** "Not placed" · StoryScrubber unplaced */ notPlacedTitle?: SakugaMessage;
  /** "Not placed · {count}" · StoryScrubber, more than one */ notPlacedCount?: SakugaMessage;
  /** "Show the world at a moment in the story" · StoryScrubber */ storyMoment?: SakugaMessage;
  /** "After event {n} of {total}" · StoryScrubber */ afterEvent?: SakugaMessage;
  /** "compared with {name}" · StoryScrubber */ comparedWith?: SakugaMessage;
  /** "Earlier events" · StoryScrubber, the chevron at the start of a long track */ earlierEvents?: SakugaMessage;
  /** "Later events" · StoryScrubber, the chevron at the end of a long track */ laterEvents?: SakugaMessage;
  /** "Show {name}" · StoryScrubber and StoryMap, a label held at the edge ("Show Now", "Show Mio") */ showMoment?: SakugaMessage;
  /** "{count} more" · StoryMap, several held at one edge */ heldMore?: SakugaMessage;
  /** "Show {count} more: {names}" · StoryMap, the held label read aloud */ showHeldMore?: SakugaMessage;
  /** "Show events told by" · StoryScrubber filter */ showEventsBy?: SakugaMessage;
  /** "All" · StoryScrubber filter */ filterAll?: SakugaMessage;
  /** "Episodes" · StoryScrubber filter */ filterEpisodes?: SakugaMessage;
  /** "Manga" · StoryScrubber filter */ filterManga?: SakugaMessage;
  /** "Shorts" · StoryScrubber filter */ filterShorts?: SakugaMessage;
  /** "card open" · Mention */ cardOpen?: SakugaMessage;
  /** one: "{count} word" · other: "{count} words" · ManuscriptSection */ wordCount?: SakugaMessage;
  /** "Accept" · ProposalCard */ accept?: SakugaMessage;
  /** "conflict" · ProposalCard */ conflict?: SakugaMessage;
  /** "Inferred" · ProposalCard */ inferred?: SakugaMessage;
  /** "Clear selection" · FloatingToolbar */ clearSelection?: SakugaMessage;
  /** "{label}, working" · Button, while busy without busyLabel */ busyItem?: SakugaMessage;
  /** "Waiting" · QuestionRow */ questionWaiting?: SakugaMessage;
  /** "Quiet" · QuestionRow */ questionQuiet?: SakugaMessage;
  /** "Answered" · QuestionRow */ answered?: SakugaMessage;
  /** "Not raised yet" · QuestionRow */ notRaisedYet?: SakugaMessage;
  /** "Answer it" · QuestionRow */ answerIt?: SakugaMessage;
  /** "Planted" · QuestionRow */ planted?: SakugaMessage;
  /** "Raised" · QuestionRow */ raised?: SakugaMessage;
  /** "story conflict" · ScreenplayLine */ storyConflict?: SakugaMessage;
  /** "You" · ChatMessage, the creator’s own turn */ you?: SakugaMessage;
  /** "Already answered." · MakiCard */ alreadyAnswered?: SakugaMessage;
  /** "Ask Maki" · AskMaki */ askMaki?: SakugaMessage;
  /** "Jump to the latest" · SidePanel scrolled back */ jumpToLatest?: SakugaMessage;
  /** "Stop" · MakiComposer while Maki writes */ stop?: SakugaMessage;
  /** "Mention someone or something" · MakiComposer @ */ mentionSomeone?: SakugaMessage;
  /** "{amount} a reply" · MakiComposer cost */ replyCost?: SakugaMessage;
  /** "{count} to look at" · MakiPanel head */ makiWaiting?: SakugaMessage;
  /** "What to ask" · MakiSuggestions */ suggestions?: SakugaMessage;
  /** "Reopen" · MakiFinding kept */ reopen?: SakugaMessage;
  /** "Keep on purpose" · MakiFinding action */ keepOnPurposeAction?: SakugaMessage;
  /** "{label}, {count} to look at" · AskMaki with a count */ toLookAt?: SakugaMessage;
  /** "Ask Maki…" · MakiComposer */ askMakiPlaceholder?: SakugaMessage;
  /** "Message to Maki" · MakiComposer */ messageToMaki?: SakugaMessage;
  /** "Attach" · MakiComposer */ attach?: SakugaMessage;
  /** "Send" · MakiComposer */ send?: SakugaMessage;
  /** "Maki views" · MakiPanel */ makiViews?: SakugaMessage;
  /** "Chat" · MakiPanel */ chat?: SakugaMessage;
  /** "Review · {count}" · MakiPanel */ reviewCount?: SakugaMessage;
  /** "Close Maki" · MakiPanel */ closeMaki?: SakugaMessage;
  /** "Conversation with Maki" · MakiPanel */ conversationWithMaki?: SakugaMessage;
  /** "Ask Maki about the story…" · MakiPanel */ askMakiAboutStory?: SakugaMessage;
  /** "@ to mention · explaining an issue is free" · MakiPanel */ makiHint?: SakugaMessage;
  /** "Review" · MakiPanel, the view switch */ review?: SakugaMessage;
  /** "What Maki found" · MakiPanel, Review’s region */ whatMakiFound?: SakugaMessage;
  /** "Maki is writing…" · MakiTurn while writing */ makiWriting?: SakugaMessage;
  /** "Asking about" · MakiComposer, the context chips */ makiContext?: SakugaMessage;
  /** "Attached" · MakiComposer, the files the creator added */ makiAttached?: SakugaMessage;
  /** "Adding…" · MakiComposer, a file still uploading */ fileAdding?: SakugaMessage;
  /** "Picture" · MakiComposer, an added picture */ filePicture?: SakugaMessage;
  /** "Video" · MakiComposer, an added video */ fileVideo?: SakugaMessage;
  /** "Conflict" · MakiFinding severity */ findingConflict?: SakugaMessage;
  /** "Warning" · MakiFinding severity */ findingWarning?: SakugaMessage;
  /** "In {count} events" · MakiFinding, its events list (one: “In {count} event”) */ findingEvents?: SakugaMessage;
  /** "Show {title} on the map" · MakiFinding, the row’s press */ showFinding?: SakugaMessage;
  /** "Kept on purpose" · MakiFinding kept */ keptOnPurpose?: SakugaMessage;
  /** "Kept on purpose by {name} · {date}" · MakiFinding kept */ keptBy?: SakugaMessage;
  /** "Timeline" · Timeline */ timeline?: SakugaMessage;
  /** "no picture yet" · Timeline gap */ noPictureYet?: SakugaMessage;
  /** "storyboard" · Timeline board item */ storyboard?: SakugaMessage;
  /** one: "{count} frame" · other: "{count} frames" · Timeline trim, after the seconds */ frames?: SakugaMessage;
  /** "this item" · Timeline item without a label */ thisItem?: SakugaMessage;
  /** "Trim the start of {name}" · Timeline */ trimStart?: SakugaMessage;
  /** "Trim the end of {name}" · Timeline */ trimEnd?: SakugaMessage;
  /** "{start} to {end}" · Timeline item */ timeRange?: SakugaMessage;
  /** "{list} and {last}" · a list of names or sources: "Aiko, Ren and Mei" */ listAnd?: SakugaMessage;
  /** "Move the {track} track, {n} of {total}" · Timeline track handle */ moveTrack?: SakugaMessage;
  /** "{track} track moved to {n} of {total}" · Timeline, said */ trackMoved?: SakugaMessage;
  /** "{track} track lifted, {n} of {total}" · Timeline, said */ trackLifted?: SakugaMessage;
  /** "{track} track dropped where it was" · Timeline, said */ trackDropped?: SakugaMessage;
  /** "{track} track put back" · Timeline, said */ trackPutBack?: SakugaMessage;
  /** "To {n} of {total}" · Timeline, said */ trackTo?: SakugaMessage;
  /** "Up and Down move it a place. Enter or Space lifts it to move it further, and drops it; Escape puts it back." · Timeline track handle */ trackMoveHelp?: SakugaMessage;
  /** "Selected" · CutRow */ cutSelected?: SakugaMessage;
  /** "Approved" · CutCell */ approved?: SakugaMessage;
  /** "Waiting for you" · CutCell */ waitingForYouTitle?: SakugaMessage;
  /** "Removed:" · Revision */ removedPrefix?: SakugaMessage;
  /** "Added:" · Revision */ addedPrefix?: SakugaMessage;
  /** "Done." · Slip */ doneSentence?: SakugaMessage;
  /** "Videos to make" · Timesheet */ videosToMake?: SakugaMessage;
  /** "at frame {n}" · Timesheet key */ atFrame?: SakugaMessage;
  /** "frames {start} to {end}" · Timesheet span */ framesFromTo?: SakugaMessage;
  /** "partly cut" · ProgramBar */ partlyCut?: SakugaMessage;
  /** "missing" · ProgramBar, Mention */ missing?: SakugaMessage;
  /** "The whole cut" · ProgramBar */ wholeCut?: SakugaMessage;
  /** "Timeline shows {start} to {end}" · ProgramBar */ timelineShows?: SakugaMessage;
  /** "Production" · ProductionNav */ production?: SakugaMessage;
  /** "Back to {name}" · ProductionNav collapsed */ backTo?: SakugaMessage;
  /** "productions" · ProductionNav collapsed, without a back label */ productions?: SakugaMessage;
  /** "Views" · ProductionNav */ views?: SakugaMessage;
  /** "Tools" · ProductionNav */ tools?: SakugaMessage;
  /** "Scenes" · ProductionNav */ scenes?: SakugaMessage;
  /** "Inspector" · EditorShell */ inspector?: SakugaMessage;
  /** "left {x}%, top {y}%, {w}% wide, {h}% tall" · CanvasStage */ boxAt?: SakugaMessage;
  /** "Arrow keys move it; Shift and an arrow key resize it." · CanvasStage */ boxKeys?: SakugaMessage;
  /** "movable item" · CanvasStage */ movableItem?: SakugaMessage;
  /** "Selected item" · CanvasStage */ selectedItem?: SakugaMessage;
  /** "In" · TrimFrames in point */ trimIn?: SakugaMessage;
  /** "Out" · TrimFrames out point */ trimOut?: SakugaMessage;
  /** "In frame" · TrimFrames */ inFrame?: SakugaMessage;
  /** "Out frame" · TrimFrames */ outFrame?: SakugaMessage;
  /** "In a frame earlier" · TrimFrames */ inEarlier?: SakugaMessage;
  /** "In a frame later" · TrimFrames */ inLater?: SakugaMessage;
  /** "Out a frame earlier" · TrimFrames */ outEarlier?: SakugaMessage;
  /** "Out a frame later" · TrimFrames */ outLater?: SakugaMessage;
  /** "Trim" · TrimFrames */ trim?: SakugaMessage;
  /** "Script" · Manuscript */ script?: SakugaMessage;
  /** "Prompt" · PromptComposer */ prompt?: SakugaMessage;
  /** "Page" · MangaPage, without a label */ pageTitle?: SakugaMessage;
  /** one: "{count} frame drawing" · other: "{count} frames drawing" · MangaPage */ framesDrawing?: SakugaMessage;
  /** one: "{count} frame waiting" · other: "{count} frames waiting" · MangaPage */ framesWaiting?: SakugaMessage;
  /** "the area to redraw marked" · MangaPage */ redrawMarked?: SakugaMessage;
  /** "an item selected" · MangaPage */ itemSelected?: SakugaMessage;
  /** "Drawing…" · MangaPage frame */ drawingNow?: SakugaMessage;
  /** "Waiting" · MangaPage frame */ waiting?: SakugaMessage;
  /** "The issue, spread by spread" · IssueStrip */ issueBySpread?: SakugaMessage;
  /** "Page turn" · IssueStrip and PageWall */ pageTurn?: SakugaMessage;
  /** "Spreads" · IssueStrip */ spreads?: SakugaMessage;
  /** "Selected spread:" · IssueStrip */ selectedSpread?: SakugaMessage;
  /** "Laid out" · PageWall steps */ wallLaidOut?: SakugaMessage;
  /** "Drawn" · PageWall steps */ wallDrawn?: SakugaMessage;
  /** "Lettered" · PageWall steps */ wallLettered?: SakugaMessage;
  /** "Proofed" · PageWall steps */ wallProofed?: SakugaMessage;
  /** "The whole issue" · PageWall */ wholeIssue?: SakugaMessage;
  /** "drawn into the art" · LayerStrip */ drawnIntoArt?: SakugaMessage;
  /** "None yet" · LayerStrip */ noneYet?: SakugaMessage;
  /** "has one" · CoverageTable */ coverHas?: SakugaMessage;
  /** "a scene needs one and nothing fits" · CoverageTable */ coverGap?: SakugaMessage;
  /** "not needed yet" · CoverageTable */ coverIdle?: SakugaMessage;
  /** "Stages" · Stages */ stages?: SakugaMessage;
  /** "failed" · Stages */ failed?: SakugaMessage;
  /** "Ready" · Readiness */ ready?: SakugaMessage;
  /** "ready" · Readiness */ readyState?: SakugaMessage;
  /** "Cast" · PromptComposer list, the @ group */ mentionCast?: SakugaMessage;
  /** "Places" · PromptComposer list, the # group */ mentionPlaces?: SakugaMessage;
  /** "References" · PromptComposer list, the $ group */ mentionReferences?: SakugaMessage;
  /** "Objects" · PromptField, the & list */ mentionObjects?: SakugaMessage;
  /** "{group} · matching “{query}”" · PromptComposer list title while typing */ mentionMatching?: SakugaMessage;
  /** one: "{count} outfit" · other: "{count} outfits" · PromptComposer cast row */ outfitCount?: SakugaMessage;
  /** "no outfit yet" · PromptComposer cast row */ noOutfitYet?: SakugaMessage;
  /** "Outfit for {name}" · PromptComposer outfit step */ outfitFor?: SakugaMessage;
  /** "default" · PromptComposer outfit step, the first outfit */ outfitDefault?: SakugaMessage;
  /** "held" · ActivityPanel, a job's fragments */ jobHeld?: SakugaMessage;
  /** "Play {name} again" · VideoPlayer, ended */ playAgain?: SakugaMessage;
  /** "{name}, video" · VideoPlayer */ videoNamed?: SakugaMessage;
  /** "Seek in {name}" · VideoPlayer */ seekIn?: SakugaMessage;
  /** "Full screen" · VideoPlayer */ fullScreen?: SakugaMessage;
  /** "Loading {name}" · VideoPlayer, waiting for frames */ loadingItem?: SakugaMessage;
  /** one: "{count} waiting" · other: "{count} waiting" · ActivityRow, what waits on you */ waitingCount?: SakugaMessage;
  /** "Activity: {running}, {waiting}" · ActivityRow, running and waiting */ activityCounts?: SakugaMessage;
  /** one: "{count} view" · other: "{count} views" · PromptComposer place row with views */ placeViews?: SakugaMessage;
  /** "1 view · {name}" · PromptComposer place row with one view */ placeOneView?: SakugaMessage;
  /** "{name} can wear a different outfit each time you tag them in the same prompt." · PromptComposer outfit step */ outfitNote?: SakugaMessage;
  /** "More for {name}" · CastCard and LookPlate ⋯ */ moreFor?: SakugaMessage;
  /** "the picture" · DropZone remove, without a title */ thePicture?: SakugaMessage;
  /** "Crop" · Cropper, named without a label */ crop?: SakugaMessage;
  /** "crop" · Cropper, what a screen reader calls the stage */ cropRole?: SakugaMessage;
  /** "Zoom" · Cropper slider */ zoom?: SakugaMessage;
  /** "Zoom out" · Cropper, Timeline onView */ zoomOut?: SakugaMessage;
  /** "Drag to move · scroll or pinch to zoom" · Cropper */ cropHint?: SakugaMessage;
  /** "Drag to move" · Cropper at a fixed size */ cropHintFixed?: SakugaMessage;
  /** "zoom {times} times" · Cropper, said when a move ends */ cropZoom?: SakugaMessage;
  /** "{region}, zoom {times} times" · Cropper, said when a move ends near a region */ cropRegionZoom?: SakugaMessage;
  /** "Scene heading" · ScreenplayEditor, a block's kind */ blockSlug?: SakugaMessage;
  /** "Action" · ScreenplayEditor, a block's kind */ blockAction?: SakugaMessage;
  /** "Character" · ScreenplayEditor, a block's kind */ blockCue?: SakugaMessage;
  /** "Parenthetical" · ScreenplayEditor, a block's kind */ blockParen?: SakugaMessage;
  /** "Dialogue" · ScreenplayEditor, a block's kind */ blockDialogue?: SakugaMessage;
  /** "Transition" · ScreenplayEditor, a block's kind */ blockTransition?: SakugaMessage;
  /** The editor's keys · ScreenplayEditor */ screenplayHelp?: SakugaMessage;
  /** "{kind}", said as a block changes kind · ScreenplayEditor */ blockNow?: SakugaMessage;
  /** "Script" · ScreenplayEditor */ screenplayScript?: SakugaMessage;
  /** "at the same time as {list}" · StoryScrubber, in its events list */ atSameTimeAs?: SakugaMessage;
  /** "{title}, at the same time as {list}" · StoryScrubber, a node's tooltip */ sameTimeTitle?: SakugaMessage;
  /** "At the same time as #{number} · {title}" · ManuscriptSection */ sameTimeAs?: SakugaMessage;
  /** "+{count}" · StoryScrubber, more marks than fit on a node */ andMore?: SakugaMessage;
  /** "Scenes" · Manuscript, its body while it scrolls */ manuscriptScenes?: SakugaMessage;
  /** "loops to fill, {made} made" · Timeline, a looped sound */ loopsToFill?: SakugaMessage;
  /** "{name} +{count}" · Timeline, markers sharing one flag */ markerAndMore?: SakugaMessage;
  /** "{count} markers: {list}" · Timeline, the shared flag said in full */ markersHere?: SakugaMessage;
  /** "{name} at {time}" · Timeline, one marker in a shared flag */ markerAt?: SakugaMessage;
  /** "Move {name}, {n} of {total}" · List onReorder, a row's grip */ moveRow?: SakugaMessage;
  /** "{name} moved to {n} of {total}" · List onReorder */ rowMoved?: SakugaMessage;
  /** "Up and Down, or Alt with Up and Down, move it a place; drag the handle to move it further" · List onReorder */ rowMoveHelp?: SakugaMessage;
}

export type WordKey = keyof SakugaMessages;

/** The app's own translator, an i18n library's `t`: called with Sakuga's key and its values, numbers already formatted in the locale
 *  except `count`, which stays a number for the library's plural rules. Returning nothing, or the key itself, keeps Sakuga's word. */
export type SakugaTranslate = (key: WordKey, values: Record<string, string | number>) => string | null | undefined;

/** The core's words in English: the ones more than one part says. Each component brings its own (its `words.ts`), so a page carries
 *  only the words of the parts it uses; `messages` (allWords) is every one, for an app that translates them. */
export const core: Readonly<SakugaMessages> = Object.freeze({"close": "Close", "insertName": "Add {name}", "insertHelp": "Enter or a double-click adds it at the playhead; drag it onto the timeline to place it", "back": "Back", "done": "Done", "search": "Search", "create": "Create", "removeItem": "Remove {name}", "loading": "Loading", "selected": "selected", "waitingForYou": "waiting for you", "optional": "optional", "character": "Character", "drawing": "Drawing", "fragments": "Fragments", "fragmentsUnit": "fragments", "fragmentsBalance": "Fragments balance: {amount}", "playheadAt": "Playhead at {time}", "toldIn": "told in {list}", "notAtThisMoment": "not at this moment", "changed": "changed", "rejected": "rejected", "doneState": "done", "account": "Your account", "accountOf": "Your account, {name}", "steps": "Steps", "seconds": {"one": "{count} second", "other": "{count} seconds"}, "minutes": {"one": "{count} minute", "other": "{count} minutes"}, "minutesSeconds": "{minutes} {seconds}", "timeOf": "{value} of {total}", "seek": "Seek", "play": "Play {name}", "pause": "Pause {name}", "audio": "audio", "mute": "Mute {name}", "muted": "Muted", "choose": "Choose", "options": "Options", "more": "More {name}", "activity": "Activity", "running": {"one": "{count} running", "other": "{count} running"}, "zoomIn": "Zoom in", "eventEvent": "Event", "eventTitled": "{type}: {title}", "none": "None", "showMoment": "Show {name}", "conflict": "conflict", "inferred": "Inferred", "you": "You", "askMaki": "Ask Maki", "timeline": "Timeline", "frames": {"one": "{count} frame", "other": "{count} frames"}, "listAnd": "{list} and {last}", "missing": "missing", "backTo": "Back to {name}", "views": "Views", "tools": "Tools", "waiting": "Waiting", "pageTurn": "Page turn", "failed": "failed", "ready": "Ready", "zoomOut": "Zoom out", "eventTwist": "Twist", "eventRevelation": "Revelation", "eventClue": "Clue", "eventGoal": "Goal", "alreadyAnswered": "Already answered.", "outOfReach": "out of reach"} as SakugaMessages);

/** Words for a locale: tx(key, values) says one; tx.num formats a number and tx.list joins names, in the locale. */
export interface Words {
  (key: WordKey, values?: Record<string, string | number | null | undefined>): string;
  locale: string;
  num: (n: number) => string;
  list: (names: (string | null | undefined | false)[]) => string;
}

const plural = (l: string) => { try { return new Intl.PluralRules(l); } catch { return new Intl.PluralRules('en'); } };

/** A component's own words in English, the defaults its keys fall back to before the core's. */
export type OwnWords = Readonly<SakugaMessages>;

interface Made { locale: string; own?: SakugaMessages | null; translate?: SakugaTranslate | null; defaults?: OwnWords | null }
const madeOf = new WeakMap<Words, Made>();

export function wordsOf(locale: string, own?: SakugaMessages | null, translate?: SakugaTranslate | null, defaults?: OwnWords | null): Words {
  const given = own || {}, defs = defaults || {}, mine = plural(locale), english = plural('en');
  let number: Intl.NumberFormat;
  try { number = new Intl.NumberFormat(locale); } catch { number = new Intl.NumberFormat('en'); }
  const tx = ((key, values) => {
    const v = values || {};
    if (translate) {
      const said = translate(key, Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === undefined || x === null ? '' : typeof x === 'number' && k !== 'count' ? number.format(x) : x])));
      if (said && said !== key) return String(said);
    }
    const has = given[key] !== undefined;
    let m: SakugaMessage | undefined = has ? given[key] : defs[key] !== undefined ? defs[key] : core[key];
    if (typeof m === 'function') return String(m(v as Record<string, string | number>));
    if (m && typeof m === 'object') {
      const n = Number(v.count), forms = m as Record<string, string | undefined>;
      m = forms[(has ? mine : english).select(isFinite(n) ? n : 0)] || forms.other;
    }
    if (m === undefined) return key;
    return String(m).replace(/\{(\w+)\}/g, (_all, k: string) => { const x = v[k]; return x === undefined || x === null ? '' : typeof x === 'number' ? number.format(x) : String(x); });
  }) as Words;
  tx.locale = locale;
  tx.num = (n) => number.format(n);
  tx.list = (names) => {
    const xs = names.filter(Boolean).map(String);
    return xs.length > 1 ? tx('listAnd', { list: xs.slice(0, -1).join(', '), last: xs[xs.length - 1] }) : xs[0] || '';
  };
  madeOf.set(tx, { locale, own, translate, defaults });
  return tx;
}

export const WordsContext = createContext<Words | null>(null);

let fallback: Words | null = null;
const pageLocale = () => (typeof document !== 'undefined' && document.documentElement.lang) || 'en';

/* A component's words: <Sakuga locale messages>, else the page's <html lang> in English. `own` is the component's own words
   (its words.ts), said after the app's and before the core's. */
export function useWords(own?: OwnWords): Words {
  const base = useContext(WordsContext) || fallback || (fallback = wordsOf(pageLocale(), null));
  return useMemo(() => {
    if (!own) return base;
    const made = madeOf.get(base);
    return made ? wordsOf(made.locale, made.own, made.translate, own) : base;
  }, [base, own]);
}

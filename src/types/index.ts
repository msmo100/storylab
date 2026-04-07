export type BlockType = 'video' | 'quote' | 'sticky' | 'timeline' | 'chat' | 'carousel' | 'scrollymedia';

export interface BlockStyle {
  textColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  /** CSS font-weight value, e.g. "400", "700". */
  fontWeight?: string;
  /** CSS font-style value, e.g. "normal", "italic". */
  fontStyle?: string;
  /** Font size as a numeric string in px, e.g. "16". */
  fontSize?: string;
  /** Line height as a unitless string, e.g. "1.5". */
  lineHeight?: string;
  /** Letter spacing in em, e.g. "0.05". */
  letterSpacing?: string;
  /** CSS box-shadow value. */
  boxShadow?: string;
  /** CSS outline-color value. */
  outlineColor?: string;
  /** CSS outline-width value, e.g. "2px". */
  outlineWidth?: string;
  /** CSS border-radius value, e.g. "8px". */
  borderRadius?: string;
  /** CSS object-position value for image/video cropping, e.g. "top center". */
  objectPosition?: string;
}

export type AnimationPreset = 'none' | 'fade' | 'slide-up' | 'slide-left' | 'zoom';

export interface BaseBlock {
  id: string;
  type: BlockType;
  animation: AnimationPreset;
  /** Entrance animation delay in seconds. */
  animationDelay?: number;
  /** CSS max-width value (e.g. '800px', '60vw'). Undefined = automatic. */
  maxWidth?: string;
  /** Per-block style overrides. */
  styles?: BlockStyle;
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  src: string;
  autoplay: boolean;
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote';
  text: string;
  attribution?: string;
}

/**
 * Sticky scrollytelling section.
 * The background stays fixed while a series of text overlays cross-fade as the user scrolls.
 */
export interface StickyBlock extends BaseBlock {
  type: 'sticky';
  backgroundType: 'image' | 'video';
  backgroundSrc: string;
  backgroundAlt?: string;
  overlays: string[];
}

export type TimelineDotStyle = 'filled' | 'ring' | 'solid' | 'diamond' | 'none';

/** A single entry in a timeline block. */
export interface TimelineEntry {
  id: string;
  title: string;
  time: string;
  text: string;
  showDot?: boolean;
  dotStyle?: TimelineDotStyle;
}

/** Vertical timeline with a connecting line and entries showing title/time then body text. */
export interface TimelineBlock extends BaseBlock {
  type: 'timeline';
  lineWidth?: number;
  entryAnimation?: boolean;
  entries: TimelineEntry[];
}

/** A single message in a chat block. */
export interface ChatMessage {
  id: string;
  role: 'sender' | 'receiver';
  text: string;
  animate?: boolean;
  animationDelay?: number;
}

/** iPhone-style chat conversation block. */
export interface ChatBlock extends BaseBlock {
  type: 'chat';
  senderName?: string;
  receiverName?: string;
  showPhoneFrame?: boolean;
  showStatusBar?: boolean;
  showContactHeader?: boolean;
  showInputBar?: boolean;
  showNames?: boolean;
  messages: ChatMessage[];
}

/** A single item (video or image) in a carousel block. */
export interface CarouselItem {
  id: string;
  src: string;
  poster?: string;
  caption?: string;
}

/** Horizontally swipeable carousel of videos (or images). */
export interface CarouselBlock extends BaseBlock {
  type: 'carousel';
  items: CarouselItem[];
}

/** A single section (slide) in a ScrollyMedia block. */
export interface ScrollySlide {
  id: string;
  backgroundType: 'image' | 'video';
  backgroundSrc: string;
  backgroundPoster?: string;
  /** Dark overlay opacity 0–1, default 0.5 */
  overlayOpacity?: number;
  /** CSS object-position for the background image, e.g. "top center" or "30% 60%" */
  objectPosition?: string;
  headline?: string;
  subheadline?: string;
  body?: string;
}

/**
 * Standalone scrollytelling block.
 * Gets its own sticky-wrapper iframe embed — separate from the article.
 */
export interface ScrollyMediaBlock extends BaseBlock {
  type: 'scrollymedia';
  slides: ScrollySlide[];
}

export type Block =
  | VideoBlock
  | QuoteBlock
  | StickyBlock
  | TimelineBlock
  | ChatBlock
  | CarouselBlock
  | ScrollyMediaBlock;

// Distributive Omit — correctly strips 'id' from each union member
export type BlockWithoutId =
  | Omit<VideoBlock, 'id'>
  | Omit<QuoteBlock, 'id'>
  | Omit<StickyBlock, 'id'>
  | Omit<TimelineBlock, 'id'>
  | Omit<ChatBlock, 'id'>
  | Omit<CarouselBlock, 'id'>
  | Omit<ScrollyMediaBlock, 'id'>;

export interface Article {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

/** Lightweight row used in the Dashboard listing (no blocks). */
export interface ProjectSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  blockCount?: number;
}

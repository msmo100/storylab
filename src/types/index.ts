export type BlockType = 'text' | 'image' | 'video' | 'quote' | 'hero' | 'sticky' | 'scrollmedia' | 'timeline' | 'chat';

export type AnimationPreset = 'none' | 'fade' | 'slide-up' | 'slide-left' | 'zoom';

/** Entrance animation for the sticky text in a ScrollMedia block. */
export type TextEntrance = 'none' | 'fade' | 'from-left' | 'from-right';

export interface BaseBlock {
  id: string;
  type: BlockType;
  animation: AnimationPreset;
  /** Entrance animation delay in seconds. Optional for backwards-compat with saved articles. */
  animationDelay?: number;
  /** CSS max-width value (e.g. '800px', '60vw'). Undefined = automatic. */
  maxWidth?: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  src: string;
  alt: string;
  caption?: string;
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

/** Full-viewport opening section with a background image or video and overlaid heading. */
export interface HeroBlock extends BaseBlock {
  type: 'hero';
  backgroundType: 'image' | 'video';
  backgroundSrc: string;
  heading: string;
  subheading?: string;
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

/** A single item (image or video URL) in the scrolling media column. */
export interface ScrollImage {
  id: string;
  src: string;
  alt?: string;
  /** How many viewport-heights this item occupies during scroll. Default: 1. */
  scrollVh?: number;
}

/**
 * Scroll-media block.
 * Text is sticky on one side while a series of images or videos scroll past on the other.
 */
export interface ScrollMediaBlock extends BaseBlock {
  type: 'scrollmedia';
  text: string;
  textPosition: 'left' | 'center' | 'right';
  textEntrance: TextEntrance;
  mediaType: 'image' | 'video';
  images: ScrollImage[];
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

export type Block =
  | TextBlock
  | ImageBlock
  | VideoBlock
  | QuoteBlock
  | HeroBlock
  | StickyBlock
  | ScrollMediaBlock
  | TimelineBlock
  | ChatBlock;

// Distributive Omit — correctly strips 'id' from each union member
export type BlockWithoutId =
  | Omit<TextBlock, 'id'>
  | Omit<ImageBlock, 'id'>
  | Omit<VideoBlock, 'id'>
  | Omit<QuoteBlock, 'id'>
  | Omit<HeroBlock, 'id'>
  | Omit<StickyBlock, 'id'>
  | Omit<ScrollMediaBlock, 'id'>
  | Omit<TimelineBlock, 'id'>
  | Omit<ChatBlock, 'id'>;

export interface Article {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

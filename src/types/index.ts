export type BlockType = 'text' | 'image' | 'video' | 'quote' | 'hero' | 'sticky' | 'annotated' | 'scrollmedia';

export type AnimationPreset = 'none' | 'fade' | 'slide-up' | 'slide-left' | 'zoom';

/** Entrance animation for the sticky text in a ScrollMedia block. */
export type TextEntrance = 'none' | 'fade' | 'from-left' | 'from-right';

export interface BaseBlock {
  id: string;
  type: BlockType;
  animation: AnimationPreset;
  /** Entrance animation delay in seconds. Optional for backwards-compat with saved articles. */
  animationDelay?: number;
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

/** A single annotation pinned to a specific point on the background media. */
export interface Annotation {
  id: string;
  text: string;
  x: number; // 0–100, percentage from left
  y: number; // 0–100, percentage from top
}

/**
 * Annotated media block.
 * The background image/video stays sticky while the reader scrolls.
 * Each annotation appears at its (x, y) position on the media in sequence.
 */
export interface AnnotatedBlock extends BaseBlock {
  type: 'annotated';
  backgroundType: 'image' | 'video';
  backgroundSrc: string;
  backgroundAlt?: string;
  annotations: Annotation[];
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

export type Block =
  | TextBlock
  | ImageBlock
  | VideoBlock
  | QuoteBlock
  | HeroBlock
  | StickyBlock
  | AnnotatedBlock
  | ScrollMediaBlock;

// Distributive Omit — correctly strips 'id' from each union member
export type BlockWithoutId =
  | Omit<TextBlock, 'id'>
  | Omit<ImageBlock, 'id'>
  | Omit<VideoBlock, 'id'>
  | Omit<QuoteBlock, 'id'>
  | Omit<HeroBlock, 'id'>
  | Omit<StickyBlock, 'id'>
  | Omit<AnnotatedBlock, 'id'>
  | Omit<ScrollMediaBlock, 'id'>;

export interface Article {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

import { motion, useReducedMotion } from 'framer-motion';
import type { AnimationPreset, Block } from '../../types';
import { TextBlock } from './TextBlock';
import { ImageBlock } from './ImageBlock';
import { VideoBlock } from './VideoBlock';
import { QuoteBlock } from './QuoteBlock';
import { HeroBlock } from './HeroBlock';
import { StickyBlock } from './StickyBlock';

import { TimelineBlock } from './TimelineBlock';
import { ChatBlock } from './ChatBlock';
import { CarouselBlock } from './CarouselBlock';

type Variants = {
  hidden: Record<string, number | string>;
  visible: Record<string, number | string>;
};

// Distances kept intentionally small — editorial, not theatrical
const ANIMATION_VARIANTS: Record<AnimationPreset, Variants> = {
  none: {
    hidden: { opacity: 1 },
    visible: { opacity: 1 },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  'slide-up': {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.97 },
    visible: { opacity: 1, scale: 1 },
  },
};

interface Props {
  block: Block;
}

export function AnimatedBlock({ block }: Props) {
  const prefersReducedMotion = useReducedMotion();

  // These blocks manage their own scroll-driven animations internally
  if (block.type === 'hero') return <HeroBlock block={block} />;
  if (block.type === 'sticky') return <StickyBlock block={block} />;

  // When the user prefers reduced motion, skip all entrance animations
  const variants = prefersReducedMotion
    ? ANIMATION_VARIANTS.none
    : ANIMATION_VARIANTS[block.animation];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={variants}
      transition={{ duration: 0.55, delay: prefersReducedMotion ? 0 : (block.animationDelay ?? 0), ease: [0.25, 0, 0.25, 1] }}
    >
      {block.type === 'text' && <TextBlock block={block} />}
      {block.type === 'image' && <ImageBlock block={block} />}
      {block.type === 'video' && <VideoBlock block={block} />}
      {block.type === 'quote' && <QuoteBlock block={block} />}
      {block.type === 'timeline' && <TimelineBlock block={block} />}
      {block.type === 'chat' && <ChatBlock block={block} />}
      {block.type === 'carousel' && <CarouselBlock block={block} />}
    </motion.div>
  );
}

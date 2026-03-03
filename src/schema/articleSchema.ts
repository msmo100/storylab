import { z } from 'zod';

const animationPresetSchema = z.enum(['none', 'fade', 'slide-up', 'slide-left', 'zoom']);

const baseBlockSchema = z.object({
  id: z.string(),
  animation: animationPresetSchema,
  animationDelay: z.number().min(0).optional(),
});

const textBlockSchema = baseBlockSchema.extend({
  type: z.literal('text'),
  content: z.string(),
});

const imageBlockSchema = baseBlockSchema.extend({
  type: z.literal('image'),
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});

const videoBlockSchema = baseBlockSchema.extend({
  type: z.literal('video'),
  src: z.string(),
  autoplay: z.boolean(),
});

const quoteBlockSchema = baseBlockSchema.extend({
  type: z.literal('quote'),
  text: z.string(),
  attribution: z.string().optional(),
});

const heroBlockSchema = baseBlockSchema.extend({
  type: z.literal('hero'),
  backgroundType: z.enum(['image', 'video']),
  backgroundSrc: z.string(),
  heading: z.string(),
  subheading: z.string().optional(),
});

const stickyBlockSchema = baseBlockSchema.extend({
  type: z.literal('sticky'),
  backgroundType: z.enum(['image', 'video']),
  backgroundSrc: z.string(),
  backgroundAlt: z.string().optional(),
  overlays: z.array(z.string()),
});

const annotationSchema = z.object({
  id: z.string(),
  text: z.string(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

const annotatedBlockSchema = baseBlockSchema.extend({
  type: z.literal('annotated'),
  backgroundType: z.enum(['image', 'video']),
  backgroundSrc: z.string(),
  backgroundAlt: z.string().optional(),
  annotations: z.array(annotationSchema),
});

const scrollImageSchema = z.object({
  id: z.string(),
  src: z.string(),
  alt: z.string().optional(),
  scrollVh: z.number().min(0.5).optional(),
});

const scrollMediaBlockSchema = baseBlockSchema.extend({
  type: z.literal('scrollmedia'),
  text: z.string(),
  textPosition: z.enum(['left', 'center', 'right']),
  textEntrance: z.enum(['none', 'fade', 'from-left', 'from-right']),
  mediaType: z.enum(['image', 'video']),
  images: z.array(scrollImageSchema),
});

const timelineDotStyleSchema = z.enum(['filled', 'ring', 'solid', 'diamond', 'none']);

const timelineEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  time: z.string(),
  text: z.string(),
  showDot: z.boolean().optional(),
  dotStyle: timelineDotStyleSchema.optional(),
});

const timelineBlockSchema = baseBlockSchema.extend({
  type: z.literal('timeline'),
  lineWidth: z.number().min(1).max(5).optional(),
  entryAnimation: z.boolean().optional(),
  entries: z.array(timelineEntrySchema),
});

export const blockSchema = z.discriminatedUnion('type', [
  textBlockSchema,
  imageBlockSchema,
  videoBlockSchema,
  quoteBlockSchema,
  heroBlockSchema,
  stickyBlockSchema,
  annotatedBlockSchema,
  scrollMediaBlockSchema,
  timelineBlockSchema,
]);

export const articleSchema = z.object({
  id: z.string(),
  title: z.string(),
  blocks: z.array(blockSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ArticleSchema = z.infer<typeof articleSchema>;
export type BlockSchema = z.infer<typeof blockSchema>;

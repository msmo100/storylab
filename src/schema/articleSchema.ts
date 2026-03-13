import { z } from 'zod';

const animationPresetSchema = z.enum(['none', 'fade', 'slide-up', 'slide-left', 'zoom']);

const blockStyleSchema = z.object({
  textColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  lineHeight: z.string().optional(),
  letterSpacing: z.string().optional(),
  boxShadow: z.string().optional(),
  outlineColor: z.string().optional(),
  outlineWidth: z.string().optional(),
  borderRadius: z.string().optional(),
  objectPosition: z.string().optional(),
}).optional();

const baseBlockSchema = z.object({
  id: z.string(),
  animation: animationPresetSchema,
  animationDelay: z.number().min(0).optional(),
  maxWidth: z.string().optional(),
  styles: blockStyleSchema,
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

const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['sender', 'receiver']),
  text: z.string(),
  animate: z.boolean().optional(),
  animationDelay: z.number().min(0).optional(),
});

const chatBlockSchema = baseBlockSchema.extend({
  type: z.literal('chat'),
  senderName: z.string().optional(),
  receiverName: z.string().optional(),
  showPhoneFrame: z.boolean().optional(),
  showStatusBar: z.boolean().optional(),
  showContactHeader: z.boolean().optional(),
  showInputBar: z.boolean().optional(),
  showNames: z.boolean().optional(),
  messages: z.array(chatMessageSchema),
});

const carouselItemSchema = z.object({
  id: z.string(),
  src: z.string(),
  poster: z.string().optional(),
  caption: z.string().optional(),
});

const carouselBlockSchema = baseBlockSchema.extend({
  type: z.literal('carousel'),
  items: z.array(carouselItemSchema),
});

export const blockSchema = z.discriminatedUnion('type', [
  imageBlockSchema,
  videoBlockSchema,
  quoteBlockSchema,
  heroBlockSchema,
  stickyBlockSchema,

  timelineBlockSchema,
  chatBlockSchema,
  carouselBlockSchema,
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

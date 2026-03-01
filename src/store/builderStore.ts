import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Article, Block, BlockWithoutId, AnimationPreset } from '../types';
import { generateId } from '../utils/generateId';

interface BuilderStore {
  article: Article;
  darkMode: boolean;
  setTitle: (title: string) => void;
  addBlock: (block: BlockWithoutId) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (blocks: Block[]) => void;
  setAnimation: (id: string, animation: AnimationPreset) => void;
  toggleDarkMode: () => void;
}

const now = new Date().toISOString();

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set) => ({
  article: {
    id: generateId(),
    title: 'Untitled article',
    blocks: [],
    createdAt: now,
    updatedAt: now,
  },

  darkMode: false,

  setTitle: (title) =>
    set((state) => ({
      article: { ...state.article, title, updatedAt: new Date().toISOString() },
    })),

  addBlock: (block) =>
    set((state) => ({
      article: {
        ...state.article,
        blocks: [...state.article.blocks, { ...block, id: generateId() } as Block],
        updatedAt: new Date().toISOString(),
      },
    })),

  updateBlock: (id, updates) =>
    set((state) => ({
      article: {
        ...state.article,
        blocks: state.article.blocks.map((b) =>
          b.id === id ? ({ ...b, ...updates } as Block) : b
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  removeBlock: (id) =>
    set((state) => ({
      article: {
        ...state.article,
        blocks: state.article.blocks.filter((b) => b.id !== id),
        updatedAt: new Date().toISOString(),
      },
    })),

  reorderBlocks: (blocks) =>
    set((state) => ({
      article: { ...state.article, blocks, updatedAt: new Date().toISOString() },
    })),

  setAnimation: (id, animation) =>
    set((state) => ({
      article: {
        ...state.article,
        blocks: state.article.blocks.map((b) => (b.id === id ? { ...b, animation } : b)),
        updatedAt: new Date().toISOString(),
      },
    })),

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
    }),
    { name: 'gp-storylab-article' }
  )
);

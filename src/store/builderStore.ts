import { create } from 'zustand';
import type { Article, Block, BlockWithoutId, AnimationPreset, ProjectSummary } from '../types';
import { generateId } from '../utils/generateId';
import { toast } from './toastStore';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../services/projectService';

// ─── Save status ──────────────────────────────────────────────────────────────

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const HISTORY_LIMIT = 50;

// ─── Store shape ──────────────────────────────────────────────────────────────

interface BuilderStore {
  article: Article;
  history: Article[];
  future: Article[];
  darkMode: boolean;
  saveStatus: SaveStatus;

  projects: ProjectSummary[];
  projectsLoading: boolean;
  projectsError: string | null;

  // Editor actions
  setTitle: (title: string) => void;
  addBlock: (block: BlockWithoutId) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlockUp: (id: string) => void;
  moveBlockDown: (id: string) => void;
  reorderBlocks: (blocks: Block[]) => void;
  setAnimation: (id: string, animation: AnimationPreset) => void;
  toggleDarkMode: () => void;

  // Undo / redo
  undo: () => void;
  redo: () => void;

  // Cloud actions
  loadProjects: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  saveProject: () => Promise<void>;
  createNewProject: (title: string) => Promise<Article | null>;
  removeProject: (id: string) => Promise<void>;
  renameProject: (id: string, newTitle: string) => Promise<void>;

  // Guest mode
  startGuestSession: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeBlankArticle(): Article {
  const now = new Date().toISOString();
  return { id: generateId(), title: '', blocks: [], createdAt: now, updatedAt: now };
}

function pushHistory(current: Article, history: Article[]): Article[] {
  return [...history.slice(-(HISTORY_LIMIT - 1)), current];
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  article: makeBlankArticle(),
  history: [],
  future: [],
  darkMode: localStorage.getItem('sl-dark') === 'true',
  saveStatus: 'idle',
  projects: [],
  projectsLoading: false,
  projectsError: null,

  // ── Editor actions ────────────────────────────────────────────────────────

  setTitle: (title) =>
    set((state) => ({
      history: pushHistory(state.article, state.history),
      future: [],
      article: { ...state.article, title, updatedAt: new Date().toISOString() },
    })),

  addBlock: (block) =>
    set((state) => ({
      history: pushHistory(state.article, state.history),
      future: [],
      article: {
        ...state.article,
        blocks: [...state.article.blocks, { ...block, id: generateId() } as Block],
        updatedAt: new Date().toISOString(),
      },
    })),

  updateBlock: (id, updates) =>
    set((state) => ({
      history: pushHistory(state.article, state.history),
      future: [],
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
      history: pushHistory(state.article, state.history),
      future: [],
      article: {
        ...state.article,
        blocks: state.article.blocks.filter((b) => b.id !== id),
        updatedAt: new Date().toISOString(),
      },
    })),

  duplicateBlock: (id) =>
    set((state) => {
      const idx = state.article.blocks.findIndex((b) => b.id === id);
      if (idx === -1) return state;
      const copy: Block = { ...state.article.blocks[idx], id: generateId() };
      const next = [...state.article.blocks];
      next.splice(idx + 1, 0, copy);
      return {
        history: pushHistory(state.article, state.history),
        future: [],
        article: { ...state.article, blocks: next, updatedAt: new Date().toISOString() },
      };
    }),

  moveBlockUp: (id) =>
    set((state) => {
      const blocks = state.article.blocks;
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx <= 0) return state;
      const next = [...blocks];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return {
        history: pushHistory(state.article, state.history),
        future: [],
        article: { ...state.article, blocks: next, updatedAt: new Date().toISOString() },
      };
    }),

  moveBlockDown: (id) =>
    set((state) => {
      const blocks = state.article.blocks;
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1 || idx >= blocks.length - 1) return state;
      const next = [...blocks];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return {
        history: pushHistory(state.article, state.history),
        future: [],
        article: { ...state.article, blocks: next, updatedAt: new Date().toISOString() },
      };
    }),

  reorderBlocks: (blocks) =>
    set((state) => ({
      history: pushHistory(state.article, state.history),
      future: [],
      article: { ...state.article, blocks, updatedAt: new Date().toISOString() },
    })),

  setAnimation: (id, animation) =>
    set((state) => ({
      history: pushHistory(state.article, state.history),
      future: [],
      article: {
        ...state.article,
        blocks: state.article.blocks.map((b) => (b.id === id ? { ...b, animation } : b)),
        updatedAt: new Date().toISOString(),
      },
    })),

  toggleDarkMode: () => {
    const next = !get().darkMode;
    localStorage.setItem('sl-dark', String(next));
    set({ darkMode: next });
  },

  // ── Undo / redo ───────────────────────────────────────────────────────────

  undo: () =>
    set((state) => {
      if (!state.history.length) return state;
      const prev = state.history[state.history.length - 1];
      return {
        history: state.history.slice(0, -1),
        future: [state.article, ...state.future.slice(0, HISTORY_LIMIT - 1)],
        article: prev,
      };
    }),

  redo: () =>
    set((state) => {
      if (!state.future.length) return state;
      const next = state.future[0];
      return {
        history: [...state.history.slice(-(HISTORY_LIMIT - 1)), state.article],
        future: state.future.slice(1),
        article: next,
      };
    }),

  // ── Cloud actions ─────────────────────────────────────────────────────────

  loadProjects: async () => {
    set({ projectsLoading: true, projectsError: null });
    const result = await listProjects();
    if (result.error) {
      set({ projectsLoading: false, projectsError: result.error });
    } else {
      set({ projects: result.data!, projectsLoading: false });
    }
  },

  loadProject: async (id) => {
    set({ saveStatus: 'idle', history: [], future: [] });
    const result = await getProject(id);
    if (result.error) {
      console.error('[loadProject]', result.error);
    } else {
      set({ article: result.data! });
    }
  },

  saveProject: async () => {
    const { article } = get();
    set({ saveStatus: 'saving' });
    const result = await updateProject(article.id, {
      title: article.title,
      blocks: article.blocks,
    });
    if (result.error) {
      set({ saveStatus: 'error' });
      toast.error('Kunde inte spara projektet');
    } else {
      set({ article: result.data!, saveStatus: 'saved' });
    }
  },

  createNewProject: async (title) => {
    const result = await createProject(title);
    if (result.error) {
      console.error('[createNewProject]', result.error);
      toast.error('Kunde inte skapa projektet');
      return null;
    }
    const summary: ProjectSummary = {
      id: result.data!.id,
      title: result.data!.title,
      createdAt: result.data!.createdAt,
      updatedAt: result.data!.updatedAt,
      blockCount: 0,
    };
    set((state) => ({ projects: [summary, ...state.projects] }));
    return result.data!;
  },

  removeProject: async (id) => {
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
    const result = await deleteProject(id);
    if (result.error) {
      toast.error('Kunde inte ta bort projektet');
      get().loadProjects();
    } else {
      toast.success('Projekt borttaget');
    }
  },

  renameProject: async (id, newTitle) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, title: newTitle } : p
      ),
    }));
    const result = await updateProject(id, { title: newTitle });
    if (result.error) {
      toast.error('Kunde inte byta namn');
      get().loadProjects();
    }
  },

  // ── Guest mode ────────────────────────────────────────────────────────────

  startGuestSession: () =>
    set({ article: makeBlankArticle(), history: [], future: [], saveStatus: 'idle' }),
}));

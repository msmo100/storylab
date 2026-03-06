import { create } from 'zustand';
import type { Article, Block, BlockWithoutId, AnimationPreset, ProjectSummary } from '../types';
import { generateId } from '../utils/generateId';
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

  // Editor actions — identical signatures to before
  setTitle: (title: string) => void;
  addBlock: (block: BlockWithoutId) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
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
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeBlankArticle(): Article {
  const now = new Date().toISOString();
  return { id: generateId(), title: '', blocks: [], createdAt: now, updatedAt: now };
}

/** Push current article onto history, clear future, return new history array. */
function pushHistory(current: Article, history: Article[]): Article[] {
  return [...history.slice(-(HISTORY_LIMIT - 1)), current];
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  article: makeBlankArticle(),
  history: [],
  future: [],
  // Persist dark mode preference without the full persist middleware
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
    } else {
      set({ article: result.data!, saveStatus: 'saved' });
    }
  },

  createNewProject: async (title) => {
    const result = await createProject(title);
    if (result.error) {
      console.error('[createNewProject]', result.error);
      return null;
    }
    const summary: ProjectSummary = {
      id: result.data!.id,
      title: result.data!.title,
      createdAt: result.data!.createdAt,
      updatedAt: result.data!.updatedAt,
    };
    set((state) => ({ projects: [summary, ...state.projects] }));
    return result.data!;
  },

  removeProject: async (id) => {
    // Optimistic removal
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
    const result = await deleteProject(id);
    if (result.error) {
      // Roll back
      get().loadProjects();
    }
  },
}));

// ABSTRACTION LAYER — This is the only file that imports Supabase data operations.
// To swap the backend: replace the function bodies below with fetch() calls to your API,
// keeping the signatures identical. The rest of the app is completely unaffected.

import { supabase } from '../lib/supabase';
import type { Article, ProjectSummary } from '../types';
import { generateId } from '../utils/generateId';

// ─── Result type ──────────────────────────────────────────────────────────────

export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

// ─── Internal mappers ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToArticle(row: any): Article {
  return {
    id: row.id,
    title: row.title,
    blocks: row.blocks ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSummary(row: any): ProjectSummary {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Return all projects for the current user, ordered by most recently updated. */
export async function listProjects(): Promise<ServiceResult<ProjectSummary[]>> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, created_at, updated_at')
    .order('updated_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []).map(rowToSummary), error: null };
}

/** Return a single project with full block data. */
export async function getProject(id: string): Promise<ServiceResult<Article>> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: rowToArticle(data), error: null };
}

/** Create a new empty project and return it. */
export async function createProject(title: string): Promise<ServiceResult<Article>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  const id = generateId();

  const { data, error } = await supabase
    .from('articles')
    .insert({ id, user_id: user.id, title, blocks: [] })
    .select('*')
    .single();

  if (error) return { data: null, error: error.message };
  return { data: rowToArticle(data), error: null };
}

/** Persist title and/or blocks changes for an existing project. */
export async function updateProject(
  id: string,
  updates: { title?: string; blocks?: Article['blocks'] }
): Promise<ServiceResult<Article>> {
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.blocks !== undefined) payload.blocks = updates.blocks;

  const { data, error } = await supabase
    .from('articles')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) return { data: null, error: error.message };
  return { data: rowToArticle(data), error: null };
}

/** Permanently delete a project. */
export async function deleteProject(id: string): Promise<ServiceResult<true>> {
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

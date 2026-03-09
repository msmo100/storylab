import { useEffect, useMemo, useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/Modal';
import type { ProjectSummary } from '../../types';

type SortOrder = 'updated' | 'created' | 'alpha';

export function DashboardView() {
  const { projects, projectsLoading, projectsError, loadProjects, createNewProject, removeProject, renameProject } =
    useBuilderStore();
  const { user, signOut } = useAuthStore();
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('updated');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleNewProject() {
    setCreating(true);
    const article = await createNewProject('Namnlös artikel');
    setCreating(false);
    if (article) {
      window.location.hash = `#/edit?id=${article.id}`;
    }
  }

  function openProject(id: string) {
    window.location.hash = `#/edit?id=${id}`;
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;
    await removeProject(deleteTarget);
    setDeleteTarget(null);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = q
      ? projects.filter((p) => p.title.toLowerCase().includes(q))
      : [...projects];

    if (sortOrder === 'updated') {
      list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } else if (sortOrder === 'created') {
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'sv'));
    }
    return list;
  }, [projects, search, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
        <span className="font-bold tracking-tight text-gray-900 dark:text-gray-100">GP StoryLab</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 dark:text-gray-500 hidden sm:block">{user?.email}</span>
          <Button variant="secondary" size="sm" onClick={signOut}>
            Logga ut
          </Button>
          <Button variant="primary" size="sm" onClick={handleNewProject} disabled={creating}>
            {creating ? 'Skapar…' : '+ Nytt projekt'}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Mina projekt</h1>

          {projects.length > 1 && (
            <div className="flex items-center gap-2">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sök projekt…"
                className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-400 w-48"
              />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <option value="updated">Senast ändrad</option>
                <option value="created">Senast skapad</option>
                <option value="alpha">Alfabetisk</option>
              </select>
            </div>
          )}
        </div>

        {projectsLoading && (
          <p className="text-sm text-gray-400">Laddar projekt…</p>
        )}

        {projectsError && (
          <p className="text-sm text-red-500 dark:text-red-400">{projectsError}</p>
        )}

        {!projectsLoading && projects.length === 0 && !projectsError && (
          <div className="text-center py-24 text-gray-400 flex flex-col items-center gap-4">
            <p className="text-lg">Inga projekt ännu.</p>
            <Button variant="primary" size="md" onClick={handleNewProject} disabled={creating}>
              {creating ? 'Skapar…' : '+ Skapa ditt första projekt'}
            </Button>
          </div>
        )}

        {!projectsLoading && projects.length > 0 && filtered.length === 0 && (
          <p className="text-sm text-gray-400 py-8 text-center">
            Inga projekt matchar "{search}".
          </p>
        )}

        {filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => openProject(project.id)}
                onDelete={() => setDeleteTarget(project.id)}
                onRename={(newTitle) => renameProject(project.id, newTitle)}
              />
            ))}
          </div>
        )}
      </main>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Ta bort projektet?"
        message="Åtgärden kan inte ångras. Projektet tas bort permanent."
        confirmLabel="Ta bort"
        cancelLabel="Avbryt"
        danger
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────

interface CardProps {
  project: ProjectSummary;
  onOpen: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}

function ProjectCard({ project, onOpen, onDelete, onRename }: CardProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(project.title);

  const updated = new Date(project.updatedAt).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  function commitRename() {
    const trimmed = draftTitle.trim();
    if (trimmed && trimmed !== project.title) {
      onRename(trimmed);
    } else {
      setDraftTitle(project.title);
    }
    setEditing(false);
  }

  return (
    <div
      onClick={editing ? undefined : onOpen}
      role={editing ? undefined : 'button'}
      tabIndex={editing ? undefined : 0}
      onKeyDown={(e) => !editing && e.key === 'Enter' && onOpen()}
      className={`group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all ${editing ? '' : 'cursor-pointer'}`}
    >
      {editing ? (
        <input
          autoFocus
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') { setDraftTitle(project.title); setEditing(false); }
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded px-2 py-0.5 -mx-2 focus:outline-none focus:ring-2 focus:ring-gray-400 mb-1 pr-16"
        />
      ) : (
        <h2
          className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1 pr-16"
          title={project.title || 'Namnlös artikel'}
        >
          {project.title || 'Namnlös artikel'}
        </h2>
      )}

      <div className="flex items-center gap-2 mt-1">
        <p className="text-xs text-gray-400 dark:text-gray-500">Uppdaterad {updated}</p>
        {project.blockCount !== undefined && (
          <>
            <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
            <p className="text-xs text-gray-400 dark:text-gray-500">{project.blockCount} block</p>
          </>
        )}
      </div>

      {/* Actions — visible on hover */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDraftTitle(project.title);
            setEditing(true);
          }}
          aria-label="Byt namn"
          title="Byt namn"
          className="inline-flex items-center rounded-md px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          ✎
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label="Ta bort projekt"
          title="Ta bort"
          className="inline-flex items-center rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

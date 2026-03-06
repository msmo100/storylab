import { useEffect, useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import type { ProjectSummary } from '../../types';

export function DashboardView() {
  const { projects, projectsLoading, projectsError, loadProjects, createNewProject, removeProject } =
    useBuilderStore();
  const { user, signOut } = useAuthStore();
  const [creating, setCreating] = useState(false);

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

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm('Ta bort projektet permanent?')) return;
    await removeProject(id);
  }

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
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Mina projekt</h1>

        {projectsLoading && (
          <p className="text-sm text-gray-400">Laddar projekt…</p>
        )}

        {projectsError && (
          <p className="text-sm text-red-500 dark:text-red-400">{projectsError}</p>
        )}

        {!projectsLoading && projects.length === 0 && !projectsError && (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg mb-2">Inga projekt ännu.</p>
            <p className="text-sm">Klicka på "Nytt projekt" för att komma igång.</p>
          </div>
        )}

        {projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => openProject(project.id)}
                onDelete={(e) => handleDelete(e, project.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────

interface CardProps {
  project: ProjectSummary;
  onOpen: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function ProjectCard({ project, onOpen, onDelete }: CardProps) {
  const updated = new Date(project.updatedAt).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className="group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer"
    >
      <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1 pr-16">
        {project.title || 'Namnlös artikel'}
      </h2>
      <p className="text-xs text-gray-400 dark:text-gray-500">Uppdaterad {updated}</p>

      {/* Actions — visible on hover */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="danger"
          size="sm"
          onClick={onDelete}
          aria-label="Ta bort projekt"
        >
          ✕
        </Button>
      </div>
    </div>
  );
}

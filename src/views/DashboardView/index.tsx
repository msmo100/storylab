import { useEffect, useMemo, useRef, useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { useAuthStore } from '../../store/authStore';

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function FolderIcon({ open }: { open?: boolean }) {
  return open ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function ChevronIcon({ down }: { down: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: down ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/Modal';
import { HelpModal } from '../../components/ui/HelpModal';
import type { ProjectSummary } from '../../types';
import { generateId } from '../../utils/generateId';

type SortOrder = 'updated' | 'created' | 'alpha';

// ─── Maps (folders) ───────────────────────────────────────────────────────────

interface MapFolder {
  id: string;
  name: string;
}

interface MapsData {
  maps: MapFolder[];
  /** projectId → mapId */
  assignments: Record<string, string>;
  /** mapId → collapsed */
  collapsed: Record<string, boolean>;
}

function loadMapsData(userId: string): MapsData {
  try {
    const raw = localStorage.getItem(`sl-maps-${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { maps: [], assignments: {}, collapsed: {} };
}

function saveMapsData(userId: string, data: MapsData) {
  localStorage.setItem(`sl-maps-${userId}`, JSON.stringify(data));
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function DashboardView() {
  const { projects, projectsLoading, projectsError, loadProjects, createNewProject, removeProject, renameProject, darkMode, toggleDarkMode } =
    useBuilderStore();
  const { user, signOut } = useAuthStore();
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('updated');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const userId = user?.id ?? 'guest';
  const [mapsData, setMapsData] = useState<MapsData>(() => loadMapsData(userId));

  // Persist maps on every change
  useEffect(() => {
    saveMapsData(userId, mapsData);
  }, [userId, mapsData]);

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
    // Remove from any map assignment
    setMapsData((prev) => {
      const assignments = { ...prev.assignments };
      delete assignments[deleteTarget];
      return { ...prev, assignments };
    });
    setDeleteTarget(null);
  }

  // ── Map actions ──────────────────────────────────────────────────────────

  function createMap() {
    const id = generateId();
    setMapsData((prev) => ({
      ...prev,
      maps: [...prev.maps, { id, name: 'Ny mapp' }],
    }));
  }

  function renameMap(id: string, name: string) {
    setMapsData((prev) => ({
      ...prev,
      maps: prev.maps.map((m) => (m.id === id ? { ...m, name } : m)),
    }));
  }

  function deleteMap(id: string) {
    setMapsData((prev) => {
      const assignments = { ...prev.assignments };
      // Unassign all projects from this map
      for (const [pid, mid] of Object.entries(assignments)) {
        if (mid === id) delete assignments[pid];
      }
      const collapsed = { ...prev.collapsed };
      delete collapsed[id];
      return { ...prev, maps: prev.maps.filter((m) => m.id !== id), assignments, collapsed };
    });
  }

  function assignToMap(projectId: string, mapId: string | null) {
    setMapsData((prev) => {
      const assignments = { ...prev.assignments };
      if (mapId === null) {
        delete assignments[projectId];
      } else {
        assignments[projectId] = mapId;
      }
      return { ...prev, assignments };
    });
  }

  function toggleCollapse(mapId: string) {
    setMapsData((prev) => ({
      ...prev,
      collapsed: { ...prev.collapsed, [mapId]: !prev.collapsed[mapId] },
    }));
  }

  // ── Filtering + sorting ──────────────────────────────────────────────────

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

  // Split into map buckets
  const byMap = useMemo(() => {
    const buckets: Record<string, ProjectSummary[]> = {};
    const unassigned: ProjectSummary[] = [];
    for (const p of filtered) {
      const mid = mapsData.assignments[p.id];
      if (mid && mapsData.maps.find((m) => m.id === mid)) {
        (buckets[mid] ??= []).push(p);
      } else {
        unassigned.push(p);
      }
    }
    return { buckets, unassigned };
  }, [filtered, mapsData]);

  const hasMaps = mapsData.maps.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
        <span className="font-bold tracking-tight text-gray-900 dark:text-gray-100">GP StoryLab</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 dark:text-gray-500 hidden sm:block">{user?.email}</span>
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Växla till ljusläge' : 'Växla till mörkt läge'}
            aria-label="Växla mörkt läge"
            className="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center justify-center"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => setHelpOpen(true)}
            title="Hur man använder"
            className="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-bold transition-colors flex items-center justify-center"
          >
            ?
          </button>
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
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Mina projekt</h1>
            <button
              onClick={createMap}
              title="Skapa ny mapp"
              className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg px-2.5 py-1 transition-colors"
            >
              <FolderIcon />
              Ny mapp
            </button>
          </div>

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

        {/* Map sections */}
        {!projectsLoading && mapsData.maps.map((map) => {
          const mapProjects = byMap.buckets[map.id] ?? [];
          const isCollapsed = mapsData.collapsed[map.id] ?? false;
          return (
            <MapSection
              key={map.id}
              map={map}
              projects={mapProjects}
              allMaps={mapsData.maps}
              collapsed={isCollapsed}
              onToggleCollapse={() => toggleCollapse(map.id)}
              onRename={(name) => renameMap(map.id, name)}
              onDelete={() => deleteMap(map.id)}
              onOpen={openProject}
              onDeleteProject={setDeleteTarget}
              onRenameProject={(id, title) => renameProject(id, title)}
              onMoveProject={(pid, mid) => assignToMap(pid, mid)}
            />
          );
        })}

        {/* Unassigned projects */}
        {!projectsLoading && byMap.unassigned.length > 0 && (
          <>
            {hasMaps && (
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 mt-6">
                Övrigt
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {byMap.unassigned.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  maps={mapsData.maps}
                  currentMapId={mapsData.assignments[project.id] ?? null}
                  onOpen={() => openProject(project.id)}
                  onDelete={() => setDeleteTarget(project.id)}
                  onRename={(newTitle) => renameProject(project.id, newTitle)}
                  onMove={(mapId) => assignToMap(project.id, mapId)}
                />
              ))}
            </div>
          </>
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
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

// ─── Map section ──────────────────────────────────────────────────────────────

interface MapSectionProps {
  map: MapFolder;
  projects: ProjectSummary[];
  allMaps: MapFolder[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onOpen: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, title: string) => void;
  onMoveProject: (projectId: string, mapId: string | null) => void;
}

function MapSection({
  map, projects, allMaps, collapsed,
  onToggleCollapse, onRename, onDelete,
  onOpen, onDeleteProject, onRenameProject, onMoveProject,
}: MapSectionProps) {
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(map.name);

  function commitRename() {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== map.name) onRename(trimmed);
    else setDraftName(map.name);
    setEditingName(false);
  }

  return (
    <div className="mb-6">
      {/* Map header */}
      <div className="group flex items-center gap-2 mb-3">
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <ChevronIcon down={!collapsed} />
          <FolderIcon open={!collapsed} />
        </button>

        {editingName ? (
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') { setDraftName(map.name); setEditingName(false); }
            }}
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-gray-400 w-48"
          />
        ) : (
          <span
            className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-default"
            onDoubleClick={() => { setDraftName(map.name); setEditingName(true); }}
            title="Dubbelklicka för att byta namn"
          >
            {map.name}
          </span>
        )}

        <span className="text-xs text-gray-400 dark:text-gray-500">
          {projects.length} {projects.length === 1 ? 'projekt' : 'projekt'}
        </span>

        {/* Map actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
          <button
            onClick={() => { setDraftName(map.name); setEditingName(true); }}
            title="Byt namn på mapp"
            className="inline-flex items-center rounded-md px-2 py-0.5 text-xs text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ✎
          </button>
          <button
            onClick={onDelete}
            title="Ta bort mapp"
            className="inline-flex items-center rounded-md px-2 py-0.5 text-xs text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Projects grid */}
      {!collapsed && (
        projects.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 pl-6 py-3 italic">
            Inga projekt i den här mappen.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pl-0">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                maps={allMaps}
                currentMapId={map.id}
                onOpen={() => onOpen(project.id)}
                onDelete={() => onDeleteProject(project.id)}
                onRename={(newTitle) => onRenameProject(project.id, newTitle)}
                onMove={(mapId) => onMoveProject(project.id, mapId)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────

interface CardProps {
  project: ProjectSummary;
  maps: MapFolder[];
  currentMapId: string | null;
  onOpen: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
  onMove: (mapId: string | null) => void;
}

function ProjectCard({ project, maps, currentMapId, onOpen, onDelete, onRename, onMove }: CardProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(project.title);
  const [moveOpen, setMoveOpen] = useState(false);
  const moveRef = useRef<HTMLDivElement>(null);

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

  // Close move dropdown on outside click
  useEffect(() => {
    if (!moveOpen) return;
    function handler(e: MouseEvent) {
      if (moveRef.current && !moveRef.current.contains(e.target as Node)) {
        setMoveOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moveOpen]);

  return (
    <div
      onClick={editing || moveOpen ? undefined : onOpen}
      role={editing || moveOpen ? undefined : 'button'}
      tabIndex={editing || moveOpen ? undefined : 0}
      onKeyDown={(e) => !editing && !moveOpen && e.key === 'Enter' && onOpen()}
      className={`group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all ${editing || moveOpen ? '' : 'cursor-pointer'}`}
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
        {/* Move to map */}
        {maps.length > 0 && (
          <div className="relative" ref={moveRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMoveOpen((v) => !v); }}
              aria-label="Flytta till mapp"
              title="Flytta till mapp"
              className="inline-flex items-center rounded-md px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FolderIcon />
            </button>
            {moveOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 z-20 min-w-[150px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 text-sm"
              >
                {maps.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { onMove(currentMapId === m.id ? null : m.id); setMoveOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 flex items-center gap-2 transition-colors ${
                      currentMapId === m.id
                        ? 'text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <FolderIcon />
                    <span className="truncate">{m.name}</span>
                    {currentMapId === m.id && <span className="ml-auto text-gray-400">✓</span>}
                  </button>
                ))}
                {currentMapId !== null && (
                  <>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                    <button
                      onClick={() => { onMove(null); setMoveOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Ta bort från mapp
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

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

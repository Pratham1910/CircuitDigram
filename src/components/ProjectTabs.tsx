import React, { useState } from 'react';
import { Plus, X, Edit2, Copy, Check } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useCircuitStore } from '../store/circuitStore';

export function ProjectTabs() {
  const { projects, activeProjectId, createProject, deleteProject, setActiveProject, renameProject, duplicateProject } = useProjectStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleTabClick = (projectId: string) => {
    // Save current project state
    const currentProject = useProjectStore.getState().getActiveProject();
    if (currentProject) {
      const circuitState = useCircuitStore.getState();
      useProjectStore.getState().updateProjectData(currentProject.id, {
        components: circuitState.components,
        wires: circuitState.wires,
        simulationResult: circuitState.simulationResult,
        zoom: circuitState.zoom,
        pan: circuitState.pan,
      });
    }

    // Switch to new project
    setActiveProject(projectId);
    
    // Load new project state
    const newProject = projects.find(p => p.id === projectId);
    if (newProject) {
      useCircuitStore.getState().loadProject({
        components: newProject.components,
        wires: newProject.wires,
        zoom: newProject.zoom,
        pan: newProject.pan,
      });
      if (newProject.simulationResult) {
        useCircuitStore.setState({ simulationResult: newProject.simulationResult });
      }
    }
  };

  const handleStartEdit = (e: React.MouseEvent, project: { id: string; name: string }) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      renameProject(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const handleDuplicate = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    duplicateProject(projectId);
  };

  const handleDelete = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (projects.length === 1) {
      alert('Cannot delete the last project');
      return;
    }
    if (confirm('Delete this project?')) {
      deleteProject(projectId);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 border-b border-gray-200 overflow-x-auto">
      {projects.map((project) => (
        <div
          key={project.id}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-t cursor-pointer transition-colors ${
            activeProjectId === project.id
              ? 'bg-white border-t-2 border-emerald-500'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          onClick={() => handleTabClick(project.id)}
        >
          {editingId === project.id ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') setEditingId(null);
                }}
                className="px-2 py-1 text-sm border border-gray-300 rounded w-32"
                autoFocus
              />
              <button
                onClick={handleSaveEdit}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Check className="w-3 h-3 text-green-600" />
              </button>
            </div>
          ) : (
            <>
              <span className="text-sm whitespace-nowrap">{project.name}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleStartEdit(e, project)}
                  className="p-1 hover:bg-gray-300 rounded"
                  title="Rename"
                >
                  <Edit2 className="w-3 h-3 text-gray-600" />
                </button>
                <button
                  onClick={(e) => handleDuplicate(e, project.id)}
                  className="p-1 hover:bg-gray-300 rounded"
                  title="Duplicate"
                >
                  <Copy className="w-3 h-3 text-gray-600" />
                </button>
                {projects.length > 1 && (
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="p-1 hover:bg-red-100 rounded"
                    title="Delete"
                  >
                    <X className="w-3 h-3 text-red-600" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ))}
      
      <button
        onClick={() => createProject()}
        className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
        title="New Project"
      >
        <Plus className="w-4 h-4" />
        New
      </button>
    </div>
  );
}

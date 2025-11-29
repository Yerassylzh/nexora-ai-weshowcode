'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProjectData, Scene } from '@/types';

interface ProjectContextType {
  projectData: ProjectData | null;
  setProjectData: (data: ProjectData) => void;
  updateScene: (mode: 'standard' | 'experimental', sceneId: string, updates: Partial<Scene>) => void;
  addScene: (mode: 'standard' | 'experimental', scene: Scene) => void;
  removeScene: (mode: 'standard' | 'experimental', sceneId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);

  const updateScene = (
    mode: 'standard' | 'experimental',
    sceneId: string,
    updates: Partial<Scene>
  ) => {
    if (!projectData) return;

    setProjectData({
      ...projectData,
      [mode]: projectData[mode].map(scene =>
        scene.id === sceneId ? { ...scene, ...updates } : scene
      ),
    });
  };

  const addScene = (mode: 'standard' | 'experimental', scene: Scene) => {
    if (!projectData) return;

    setProjectData({
      ...projectData,
      [mode]: [...projectData[mode], scene],
    });
  };

  const removeScene = (mode: 'standard' | 'experimental', sceneId: string) => {
    if (!projectData) return;

    setProjectData({
      ...projectData,
      [mode]: projectData[mode].filter(scene => scene.id !== sceneId),
    });
  };

  return (
    <ProjectContext.Provider
      value={{ projectData, setProjectData, updateScene, addScene, removeScene }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}

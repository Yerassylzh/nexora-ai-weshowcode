/**
 * Custom hook for managing all studio page state
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/context/ProjectContext';
import { ActiveTab } from '@/types';

export function useStudioState() {
  const router = useRouter();
  const { projectData, setProjectData } = useProject();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('standard');
  const [viewMode, setViewMode] = useState<'outline' | 'storyboard'>('outline');
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  
  // Regeneration settings
  const [regTopic, setRegTopic] = useState('');
  const [regSceneCount, setRegSceneCount] = useState(3);
  const [regStyle, setRegStyle] = useState('Реализм');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Edit states
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [modifyPrompt, setModifyPrompt] = useState('');
  const [showModifyInput, setShowModifyInput] = useState(false);

  // Initialize regeneration settings from project data
  useEffect(() => {
    if (!projectData) {
      router.push('/');
    } else {
      setRegTopic(projectData.topic);
      setRegSceneCount(projectData.sceneCount);
      setRegStyle(projectData.style);
      setHasUnsavedChanges(false);
    }
  }, [projectData, router]);

  // Track changes to regeneration settings
  useEffect(() => {
    if (projectData) {
      const changed = 
        regTopic !== projectData.topic ||
        regSceneCount !== projectData.sceneCount ||
        regStyle !== projectData.style;
      setHasUnsavedChanges(changed);
    }
  }, [regTopic, regSceneCount, regStyle, projectData]);

  // Update edit states when scene changes
  useEffect(() => {
    if (projectData) {
      const currentScenes = projectData[activeTab];
      const scene = currentScenes[currentSceneIndex];
      if (scene) {
        setEditedTitle(scene.title);
        setEditedDescription(scene.description);
        setIsEditingText(false);
        setModifyPrompt('');
        setShowModifyInput(false);
      }
    }
  }, [currentSceneIndex, activeTab, projectData]);

  // Computed values
  const currentScenes = projectData?.[activeTab] || [];
  const currentScene = currentScenes[currentSceneIndex];

  return {
    // Project context
    projectData,
    setProjectData,
    
    // View state
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    currentSceneIndex,
    setCurrentSceneIndex,
    currentScenes,
    currentScene,
    
    // Generation state
    isGenerating,
    setIsGenerating,
    generationProgress,
    setGenerationProgress,
    
    // Regeneration settings
    regTopic,
    setRegTopic,
    regSceneCount,
    setRegSceneCount,
    regStyle,
    setRegStyle,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    
    // Edit state
    isEditingText,
    setIsEditingText,
    editedTitle,
    setEditedTitle,
    editedDescription,
    setEditedDescription,
    modifyPrompt,
    setModifyPrompt,
    showModifyInput,
    setShowModifyInput,
  };
}

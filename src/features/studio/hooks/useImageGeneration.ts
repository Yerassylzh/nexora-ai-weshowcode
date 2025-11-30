/**
 * Custom hook for handling image generation operations
 */

import { generateImage } from '@/lib/api';
import type { ActiveTab } from '@/types';

interface UseImageGenerationProps {
  projectData: any;
  updateScene: (tab: ActiveTab, id: string, updates: any) => void;
  setIsGenerating: (value: boolean) => void;
  setGenerationProgress: (progress: { current: number; total: number }) => void;
  setViewMode: (mode: 'outline' | 'storyboard') => void;
  hasUnsavedChanges: boolean;
}

export function useImageGeneration({
  projectData,
  updateScene,
  setIsGenerating,
  setGenerationProgress,
  setViewMode,
  hasUnsavedChanges,
}: UseImageGenerationProps) {
  
  const handleGenerateVisuals = async () => {
    if (hasUnsavedChanges) {
      alert('У вас есть несохраненные изменения в настройках. Пожалуйста, нажмите кнопку "Обновить" перед генерацией кадров.');
      return;
    }

    setViewMode('storyboard');
    setIsGenerating(true);

    // Generate images for BOTH standard and experimental modes
    const allScenes = [...projectData.standard, ...projectData.experimental];
    setGenerationProgress({ current: 0, total: allScenes.length });

    let currentIndex = 0;

    for (const mode of ['standard', 'experimental'] as const) {
      const scenes = projectData[mode];
      for (const scene of scenes) {
        if (!scene.imageUrl && !scene.isLoading) {
          setGenerationProgress({ current: currentIndex + 1, total: allScenes.length });
          updateScene(mode, scene.id, { isLoading: true });
          
          try {
            const { imageUrl } = await generateImage(scene.visualPrompt, projectData.style);
            updateScene(mode, scene.id, { imageUrl, isLoading: false });
          } catch (error) {
            console.error(`Failed to generate image for scene ${scene.id}:`, error);
            updateScene(mode, scene.id, { isLoading: false });
          }
          
          currentIndex++;
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    setIsGenerating(false);
    setGenerationProgress({ current: 0, total: 0 });
  };

  const handleRegenerateImage = async (activeTab: ActiveTab, currentScene: any) => {
    if (!currentScene) return;
    
    updateScene(activeTab, currentScene.id, { isLoading: true });
    
    try {
      const { imageUrl } = await generateImage(currentScene.visualPrompt, projectData.style);
      updateScene(activeTab, currentScene.id, { 
        imageUrl,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to regenerate image:', error);
      updateScene(activeTab, currentScene.id, { isLoading: false });
    }
  };

  const handleUpdateTextAndImage = async (
    activeTab: ActiveTab,
    currentScene: any,
    editedTitle: string,
    editedDescription: string,
    setIsEditingText: (value: boolean) => void
  ) => {
    if (!currentScene) return;

    // Update ALL fields including text and loading state in ONE call
    updateScene(activeTab, currentScene.id, { 
      title: editedTitle,
      description: editedDescription,
      visualPrompt: editedDescription,
      isLoading: true
    });
    
    setIsEditingText(false);

    try {
      const { imageUrl } = await generateImage(editedDescription, projectData.style);
      updateScene(activeTab, currentScene.id, { 
        imageUrl,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to update image:', error);
      updateScene(activeTab, currentScene.id, { isLoading: false });
    }
  };

  const handleModifyImage = async (
    activeTab: ActiveTab,
    currentScene: any,
    modifyPrompt: string,
    setShowModifyInput: (value: boolean) => void,
    setModifyPrompt: (value: string) => void
  ) => {
    if (!currentScene || !modifyPrompt.trim()) return;

    updateScene(activeTab, currentScene.id, { isLoading: true });
    setShowModifyInput(false);
    
    try {
      // Merge original visualPrompt with modification prompt
      const combinedPrompt = `${currentScene.visualPrompt}, ${modifyPrompt}`;
      
      console.log('Original prompt:', currentScene.visualPrompt);
      console.log('Modification:', modifyPrompt);
      console.log('Combined prompt:', combinedPrompt);
      
      const { imageUrl } = await generateImage(combinedPrompt, projectData.style);
      updateScene(activeTab, currentScene.id, { 
        imageUrl,
        isLoading: false 
      });
      setModifyPrompt('');
    } catch (error) {
      console.error('Failed to modify image:', error);
      updateScene(activeTab, currentScene.id, { isLoading: false });
    }
  };

  return {
    handleGenerateVisuals,
    handleRegenerateImage,
    handleUpdateTextAndImage,
    handleModifyImage,
  };
}

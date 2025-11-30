'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/context/ProjectContext';
import { generateImage } from '@/lib/api';
import { MOCK_OUTLINES } from '@/lib/mockData';
import GeneratingScreen from '@/components/GeneratingScreen';
import DelayedImage from '@/components/DelayedImage';
import { Scene, ActiveTab } from '@/types';
import { ChevronLeft, ChevronRight, Sparkles, Download, Plus, Trash2, RefreshCw, Edit3, Wand2 } from 'lucide-react';

const SCENE_OPTIONS = [3, 5, 10];
const STYLE_OPTIONS = ['Реализм', 'Аниме', 'Киберпанк', 'ЧБ Нуар', '3D Рендер', '2D Вектор'];

export default function StudioPage() {
  const router = useRouter();
  const { projectData, setProjectData, updateScene, addScene, removeScene } = useProject();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('standard');
  const [viewMode, setViewMode] = useState<'outline' | 'storyboard'>('outline');
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  
  // Regeneration settings - will be initialized from projectData
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

  useEffect(() => {
    if (!projectData) {
      router.push('/');
    } else {
      // Initialize regeneration settings from project data
      setRegTopic(projectData.topic);
      setRegSceneCount(projectData.sceneCount); // This should set to 1 if user selected 1
      setRegStyle(projectData.style);
      setHasUnsavedChanges(false);
    }
  }, [projectData, router]);

  useEffect(() => {
    if (projectData) {
      const changed = 
        regTopic !== projectData.topic ||
        regSceneCount !== projectData.sceneCount ||
        regStyle !== projectData.style;
      setHasUnsavedChanges(changed);
    }
  }, [regTopic, regSceneCount, regStyle, projectData]);

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

  if (!projectData) {
    return null;
  }

  // Calculate fresh on EVERY render (cheap operation)
  const currentScenes = projectData[activeTab];
  const currentScene = currentScenes[currentSceneIndex];

  const handleUpdateScene = (data: { id: string; field: keyof Scene; value: string }) => {
    updateScene(activeTab, data.id, { [data.field]: data.value });
  };

  const handleAddScene = () => {
    const newScene: Scene = {
      id: `${Date.now()}`,
      order: currentScenes.length + 1,
      title: `Сцена ${currentScenes.length + 1}`,
      description: 'Введите описание новой сцены здесь.',
      visualPrompt: '',
      tags: [],
      directorsNote: '',
    };
    addScene(activeTab, newScene);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      // Call the real API to generate outline
      const response = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: regTopic,
          sceneCount: regSceneCount,
          style: regStyle,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate outline');
      }

      const data = await response.json();
      setProjectData(data);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to regenerate outline:', error);
      alert('Не удалось перегенерировать план. Проверьте консоль для деталей.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVisuals = async () => {
    if (hasUnsavedChanges) {
      alert('У вас есть несохраненные изменения в настройках. Пожалуйста, нажмите кнопку "Обновить" перед генерацией кадров.');
      return;
    }

    setIsGenerating(true);
    setViewMode('storyboard');

    // Generate images for BOTH standard and experimental modes
    const allScenes = [...projectData.standard, ...projectData.experimental];
    setGenerationProgress({ current: 0, total: allScenes.length });

    let currentIndex = 0;

    for (const mode of ['standard', 'experimental'] as const) {
      const scenes = projectData[mode];
      for (const scene of scenes) {
        if (!scene.imageUrl && !scene.isLoading) {
          currentIndex++;
          setGenerationProgress({ current: currentIndex, total: allScenes.length });
          updateScene(mode, scene.id, { isLoading: true });
          
          try {
            const { imageUrl } = await generateImage(scene.visualPrompt, projectData.style);
            updateScene(mode, scene.id, { imageUrl, isLoading: false });
          } catch (error) {
            console.error(`Failed to generate image for scene ${scene.id}:`, error);
            updateScene(mode, scene.id, { isLoading: false });
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    setIsGenerating(false);
    setGenerationProgress({ current: 0, total: 0 });
  };

  const handleRegenerateImage = async () => {
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

  const handleUpdateTextAndImage = async () => {
    if (!currentScene) return;

    // Update ALL fields including text and loading state in ONE call
    updateScene(activeTab, currentScene.id, { 
      title: editedTitle,
      description: editedDescription,
      visualPrompt: editedDescription, // Use description as visual prompt
      isLoading: true // Start loading
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

  const handleModifyImage = async () => {
    if (!currentScene || !modifyPrompt.trim()) return;

    updateScene(activeTab, currentScene.id, { isLoading: true });
    setShowModifyInput(false);
    
    try {
      // Merge original visualPrompt with modification prompt
      // This simulates img2img by creating a detailed combined prompt
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

  const handleExport = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    setIsGenerating(true);
    
    try {
      // Helper function to wait for image to be available
      const waitForImage = async (url: string, maxRetries = 30): Promise<Blob> => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            const response = await fetch(url, { mode: 'cors' });
            if (response.ok) {
              return await response.blob();
            }
          } catch (error) {
            console.log(`Image not ready yet (attempt ${i + 1}/${maxRetries}), retrying in 5s...`);
          }
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        }
        throw new Error(`Image failed to load after ${maxRetries} attempts`);
      };

      // Create project metadata
      const projectMeta = {
        topic: projectData.topic,
        style: projectData.style,
        sceneCount: projectData.sceneCount,
        exportedAt: new Date().toISOString(),
        standard: projectData.standard.map(({ id, isLoading, ...scene }) => scene),
        experimental: projectData.experimental.map(({ id, isLoading, ...scene }) => scene),
      };
      
      zip.file('project.json', JSON.stringify(projectMeta, null, 2));

      // Create README
      const readme = `AI Director Project Export
      
Topic: ${projectData.topic}
Style: ${projectData.style}
Scenes: ${projectData.sceneCount}
Exported: ${new Date().toLocaleString()}

This archive contains:
- project.json: All scene metadata and prompts
- standard/: ${projectData.standard.length} standard version images
- experimental/: ${projectData.experimental.length} experimental version images
`;
      zip.file('README.txt', readme);

      // Download and add images for both modes
      for (const mode of ['standard', 'experimental'] as const) {
        const scenes = projectData[mode];
        const folder = zip.folder(mode)!;
        
        for (let i = 0; i < scenes.length; i++) {
          const scene = scenes[i];
          if (scene.imageUrl) {
            try {
              console.log(`Fetching ${mode} scene ${i + 1}...`);
              const imageBlob = await waitForImage(scene.imageUrl);
              folder.file(`scene-${String(i + 1).padStart(2, '0')}.jpg`, imageBlob);
            } catch (error) {
              console.error(`Failed to fetch image for ${mode} scene ${i + 1}:`, error);
              // Continue with other images even if one fails
            }
          }
        }
      }

      // Generate and download ZIP
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-director-${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Не удалось экспортировать проект. Проверьте консоль для деталей.');
    } finally {
      setIsGenerating(false);
    }
  };

  const nextScene = () => {
    setCurrentSceneIndex((prev) => (prev + 1) % currentScenes.length);
  };

  const prevScene = () => {
    setCurrentSceneIndex((prev) => (prev - 1 + currentScenes.length) % currentScenes.length);
  };

  // Show generating screen
  if (isGenerating && viewMode === 'storyboard' && generationProgress.total > 0) {
    return (
      <GeneratingScreen 
        currentScene={generationProgress.current}
        totalScenes={generationProgress.total}
        mode={activeTab}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-neutral-800 p-3 md:p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-2">
          <button
            onClick={() => viewMode === 'storyboard' ? setViewMode('outline') : router.push('/')}
            className="flex items-center gap-1 md:gap-2 text-neutral-400 hover:text-white transition-colors text-sm md:text-base"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Назад</span>
          </button>

          <div className="flex bg-neutral-800 rounded-lg p-0.5 md:p-1 text-xs md:text-sm font-medium">
            <button
              onClick={() => setActiveTab('standard')}
              className={`px-3 md:px-6 py-1.5 md:py-2 rounded-md transition duration-200 ${
                activeTab === 'standard'
                  ? 'bg-[#3B82F6] text-white shadow-lg'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Стандартный
            </button>
            <button
              onClick={() => setActiveTab('experimental')}
              className={`px-3 md:px-6 py-1.5 md:py-2 rounded-md transition duration-200 ${
                activeTab === 'experimental'
                  ? 'bg-[#3B82F6] text-white shadow-lg'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span className="md:hidden">Эксп</span>
              <span className="hidden md:inline">Экспериментальный</span>
            </button>
          </div>

          <div>
            {viewMode === 'outline' ? (
              <button
                onClick={handleGenerateVisuals}
                disabled={isGenerating}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-1.5 md:py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#60A5FA] transition-colors disabled:opacity-50 text-xs md:text-sm"
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Сгенерировать Кадры</span>
                <span className="sm:hidden">Кадры</span>
              </button>
            ) : (
              <button
                onClick={handleExport}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-1.5 md:py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#60A5FA] transition-colors text-xs md:text-sm"
              >
                <Download className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Экспорт</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full p-4 md:p-8">
        {viewMode === 'outline' ? (
          /* Outline Editor View */
          <div className="max-w-6xl mx-auto space-y-3 md:space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg md:text-xl font-bold">Редактор Структуры</h2>
              <span className="text-xs md:text-sm text-neutral-400">Сцены: {currentScenes.length}</span>
            </div>

            {/* Regeneration Controls */}
            <div className="bg-[#171717] border border-neutral-800 rounded-lg p-3 md:p-4 mb-4">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-4">
                <div className="flex-grow w-full">
                  <label className="block text-xs text-neutral-400 mb-2">Тема</label>
                  <input
                    value={regTopic}
                    onChange={(e) => setRegTopic(e.target.value)}
                    placeholder="Введите тему для генерации сцен"
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-neutral-700 rounded-lg text-sm text-white focus:border-[#3B82F6] outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-2">Количество сцен:</label>
                  <input
                    type="text"
                    value={regSceneCount}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Allow empty string or valid numbers 1-10
                      if (val === '') {
                        setRegSceneCount('' as any); // Allow empty temporarily
                      } else if (/^\d+$/.test(val)) {
                        const num = parseInt(val);
                        if (num <= 10) {
                          setRegSceneCount(num);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      // Validate and fix on blur
                      const val = e.target.value;
                      if (val === '' || parseInt(val) < 1) {
                        setRegSceneCount(1);
                      } else if (parseInt(val) > 10) {
                        setRegSceneCount(10);
                      }
                    }}
                    className="w-20 px-3 py-2 bg-[#0A0A0A] border border-neutral-700 rounded-lg text-sm text-white text-center focus:border-[#3B82F6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-2">Стиль:</label>
                  <select
                    value={regStyle}
                    onChange={(e) => setRegStyle(e.target.value)}
                    className="px-3 py-2 bg-[#0A0A0A] border border-neutral-700 rounded-lg text-sm text-white focus:border-[#3B82F6] outline-none"
                  >
                    {STYLE_OPTIONS.map((style) => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating || !regTopic.trim() || !hasUnsavedChanges}
                  className="px-6 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#60A5FA] transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                >
                  {isGenerating ? 'Генерация...' : 'Обновить'}
                </button>
              </div>
            </div>

            {/* Vertical Scene Cards */}
            <div className="space-y-3">
              {currentScenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className="bg-neutral-900 rounded-lg p-3 md:p-4 border border-neutral-800 hover:border-neutral-700 transition-all"
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="text-3xl md:text-4xl font-bold text-neutral-700 w-10 md:w-12 flex-shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="flex-grow space-y-2 md:space-y-3">
                      <input
                        value={scene.title}
                        onChange={(e) => handleUpdateScene({ id: scene.id, field: 'title', value: e.target.value })}
                        placeholder="Заголовок сцены"
                        className="w-full text-base md:text-lg font-semibold bg-transparent border-b-2 border-neutral-800 focus:border-[#3B82F6] outline-none pb-1 transition text-white"
                      />
                      <textarea
                        value={scene.description}
                        onChange={(e) => handleUpdateScene({ id: scene.id, field: 'description', value: e.target.value })}
                        placeholder="Описание сцены..."
                        rows={3}
                        className="w-full text-sm md:text-base text-neutral-400 bg-transparent outline-none resize-none"
                      />
                    </div>

                    <button
                      onClick={() => removeScene(activeTab, scene.id)}
                      className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddScene}
                className="w-full py-3 md:py-4 border-2 border-dashed border-neutral-700 rounded-lg text-neutral-400 hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <Plus className="w-5 h-5 md:w-6 md:h-6" />
                <span>Добавить сцену</span>
              </button>
            </div>
          </div>
        ) : (
          /* Storyboard - ENHANCED FULLSCREEN VIEW WITH EDITING */
          <div className="max-w-5xl mx-auto h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-bold">Студия раскадровки</h2>
              <p className="text-xs text-neutral-400">
                {currentSceneIndex + 1} / {currentScenes.length}
              </p>
            </div>

            {currentScene && (
              <div className="flex-grow flex flex-col bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
                {/* Image Section with Controls */}
                <div className="relative w-full aspect-video bg-[#171717] flex items-center justify-center group">
                  {currentScene.isLoading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                      <span className="text-neutral-400 text-sm">Генерация изображения...</span>
                    </div>
                  ) : currentScene.imageUrl ? (
                    <>
                      <DelayedImage
                        key={`${activeTab}-${currentScene.id}-${currentScene.imageUrl}`}
                        src={currentScene.imageUrl}
                        alt={currentScene.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Hover Controls */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={handleRegenerateImage}
                          className="px-4 py-2 bg-neutral-800/90 hover:bg-neutral-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Перегенерировать
                        </button>
                        <button
                          onClick={() => setShowModifyInput(!showModifyInput)}
                          className="px-4 py-2 bg-[#3B82F6]/90 hover:bg-[#60A5FA] text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                        >
                          <Wand2 className="w-4 h-4" />
                          Изменить
                        </button>
                      </div>
                    </>
                  ) : (
                    <span className="text-neutral-600 text-lg">Нет изображения</span>
                  )}

                  {/* Modify Prompt Overlay */}
                  {showModifyInput && (
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={modifyPrompt}
                          onChange={(e) => setModifyPrompt(e.target.value)}
                          placeholder="Опишите изменения (напр., 'сделать небо более драматичным')..."
                          className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:border-[#3B82F6] outline-none"
                          onKeyPress={(e) => e.key === 'Enter' && handleModifyImage()}
                        />
                        <button
                          onClick={handleModifyImage}
                          disabled={!modifyPrompt.trim()}
                          className="px-4 py-2 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                          Применить
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Section with Edit */}
                <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                  <div className="flex items-start justify-between mb-4">
                    {isEditingText ? (
                      <input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="flex-1 text-xl md:text-2xl font-bold bg-transparent border-b-2 border-[#3B82F6] outline-none pb-2"
                      />
                    ) : (
                      <h3 className="text-xl md:text-2xl font-bold">{currentScene.title}</h3>
                    )}
                    
                    {!isEditingText && (
                      <button
                        onClick={() => setIsEditingText(true)}
                        className="ml-4 p-2 text-neutral-500 hover:text-[#3B82F6] transition-colors"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  {/* Tags */}
                  {currentScene.tags && currentScene.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {currentScene.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-[#3B82F6]/20 text-[#3B82F6] rounded-full text-xs font-medium border border-[#3B82F6]/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {isEditingText ? (
                    <>
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        rows={4}
                        className="w-full text-base md:text-lg mb-6 bg-neutral-800 border border-neutral-700 rounded-lg p-3 outline-none focus:border-[#3B82F6] transition resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateTextAndImage}
                          className="px-6 py-2 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          Обновить и перегенерировать
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingText(false);
                            setEditedTitle(currentScene.title);
                            setEditedDescription(currentScene.description);
                          }}
                          className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          Отмена
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-neutral-300 text-base md:text-lg mb-6 leading-relaxed">
                        {currentScene.description}
                      </p>

                      {/* Director's Note */}
                      {currentScene.directorsNote && (
                        <div className="border-l-4 border-[#3B82F6] pl-4 py-2">
                          <p className="text-xs text-neutral-500 uppercase mb-1">Заметка режиссера</p>
                          <p className="text-sm md:text-base text-neutral-400 italic">
                            {currentScene.directorsNote}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between p-4 md:p-6 border-t border-neutral-800">
                  <button
                    onClick={prevScene}
                    className="flex items-center gap-2 px-4 md:px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden md:inline">Предыдущая</span>
                  </button>
                  
                  <div className="flex gap-1">
                    {currentScenes.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSceneIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentSceneIndex ? 'bg-[#3B82F6] w-6' : 'bg-neutral-700'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextScene}
                    className="flex items-center gap-2 px-4 md:px-6 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                  >
                    <span className="hidden md:inline">Следующая</span>
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

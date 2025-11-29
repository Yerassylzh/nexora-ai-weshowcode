'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/context/ProjectContext';
import { generateImage } from '@/lib/api';
import StoryboardCard from '@/components/StoryboardCard';
import { Scene, ActiveTab } from '@/types';
import { ChevronLeft, Sparkles, Download, Plus, Trash2 } from 'lucide-react';

export default function StudioPage() {
  const router = useRouter();
  const { projectData, updateScene, addScene, removeScene } = useProject();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('standard');
  const [viewMode, setViewMode] = useState<'outline' | 'storyboard'>('outline');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!projectData) {
      router.push('/');
    }
  }, [projectData, router]);

  if (!projectData) {
    return null;
  }

  const currentScenes = projectData[activeTab];

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

  const handleGenerateVisuals = async () => {
    setViewMode('storyboard');
    setIsGenerating(true);

    for (const mode of ['standard', 'experimental'] as const) {
      const scenes = projectData[mode];

      for (const scene of scenes) {
        if (!scene.imageUrl && !scene.isLoading) {
          updateScene(mode, scene.id, { isLoading: true });

          try {
            const { imageUrl } = await generateImage(scene.visualPrompt, projectData.style);
            updateScene(mode, scene.id, { imageUrl, isLoading: false });
          } catch (error) {
            console.error(`Failed to generate image for scene ${scene.id}:`, error);
            updateScene(mode, scene.id, { isLoading: false });
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    setIsGenerating(false);
  };

  const handleRegenerate = async (sceneId: string) => {
    const scene = currentScenes.find(s => s.id === sceneId);
    if (!scene) return;

    updateScene(activeTab, sceneId, { isLoading: true });

    try {
      const { imageUrl } = await generateImage(scene.visualPrompt, projectData.style);
      updateScene(activeTab, sceneId, { imageUrl, isLoading: false });
    } catch (error) {
      console.error('Failed to regenerate image:', error);
      updateScene(activeTab, sceneId, { isLoading: false });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-director-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-neutral-800 p-3 md:p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-2">
          {/* Left: Back Button */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 md:gap-2 text-neutral-400 hover:text-white transition-colors text-sm md:text-base"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Назад</span>
          </button>

          {/* Center: Tab Switcher */}
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
              Эксп.
              <span className="hidden md:inline">ериментальный</span>
            </button>
          </div>

          {/* Right: Action Button */}
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
          /* Outline Editor View - HORIZONTAL SCROLL */
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between mb-4 md:mb-8 max-w-7xl mx-auto">
              <h2 className="text-xl md:text-2xl font-bold">Редактор Структуры</h2>
              <span className="text-sm md:text-base text-neutral-400">Сцены: {currentScenes.length}</span>
            </div>

            {/* Horizontal Scrollable Container */}
            <div className="relative">
              <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 px-4 md:px-0" style={{ scrollSnapType: 'x mandatory' }}>
                {currentScenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className="flex-shrink-0 w-72 md:w-80 bg-[#171717] rounded-xl p-4 md:p-6 border border-neutral-800 hover:border-neutral-700 transition-all relative"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    {/* Delete Button */}
                    <button
                      onClick={() => removeScene(activeTab, scene.id)}
                      className="absolute top-2 right-2 text-neutral-500 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Editable Content */}
                    <div className="space-y-4">
                      <input
                        value={scene.title}
                        onChange={(e) => handleUpdateScene({ id: scene.id, field: 'title', value: e.target.value })}
                        placeholder="Заголовок сцены"
                        className="w-full text-lg md:text-xl font-semibold bg-transparent border-b-2 border-neutral-800 focus:border-[#3B82F6] outline-none pb-2 transition text-white"
                      />
                      <textarea
                        value={scene.description}
                        onChange={(e) => handleUpdateScene({ id: scene.id, field: 'description', value: e.target.value })}
                        placeholder="Описание сцены..."
                        rows={5}
                        className="w-full text-sm text-neutral-400 bg-transparent outline-none resize-none"
                      />
                    </div>
                  </div>
                ))}

                {/* Add Scene Button */}
                <button
                  onClick={handleAddScene}
                  className="flex-shrink-0 w-72 md:w-80 h-64 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400 hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all flex flex-col items-center justify-center gap-2 text-base md:text-lg"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <Plus className="w-6 h-6 md:w-8 md:h-8" />
                  <span>Добавить Сцену</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Storyboard Grid View */
          <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold">Студия раскадровки</h2>
              <p className="text-xs md:text-sm text-neutral-400">
                <span className="hidden sm:inline">Тема: {projectData.topic} • </span>
                Стиль: {projectData.style}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {currentScenes.map((scene) => (
                <StoryboardCard
                  key={scene.id}
                  scene={scene}
                  onRegenerate={handleRegenerate}
                  style={projectData.style}
                />
              ))}
            </div>

            {isGenerating && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-sm md:text-base">
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                  <span className="text-neutral-300">Генерация изображений...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

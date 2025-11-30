import React, { useEffect } from 'react';
import { Scene } from '@/types';
import { ChevronLeft, ChevronRight, RefreshCw, Edit3, Wand2 } from 'lucide-react';
import DelayedImage from '@/components/DelayedImage';

interface StoryboardProps {
  currentScene: Scene | undefined;
  currentScenes: Scene[];
  currentSceneIndex: number;
  isEditingText: boolean;
  editedTitle: string;
  editedDescription: string;
  modifyPrompt: string;
  showModifyInput: boolean;
  setIsEditingText: (value: boolean) => void;
  setEditedTitle: (value: string) => void;
  setEditedDescription: (value: string) => void;
  setModifyPrompt: (value: string) => void;
  setShowModifyInput: (value: boolean) => void;
  setCurrentSceneIndex: (value: number) => void;
  handleRegenerateImage: () => void;
  handleUpdateTextAndImage: () => void;
  handleModifyImage: () => void;
  activeTab: 'standard' | 'experimental';
}

export default function Storyboard({
  currentScene,
  currentScenes,
  currentSceneIndex,
  isEditingText,
  editedTitle,
  editedDescription,
  modifyPrompt,
  showModifyInput,
  setIsEditingText,
  setEditedTitle,
  setEditedDescription,
  setModifyPrompt,
  setShowModifyInput,
  setCurrentSceneIndex,
  handleRegenerateImage,
  handleUpdateTextAndImage,
  handleModifyImage,
  activeTab,
}: StoryboardProps) {
  const nextScene = () => {
    setCurrentSceneIndex((currentSceneIndex + 1) % currentScenes.length);
  };

  const prevScene = () => {
    setCurrentSceneIndex((currentSceneIndex - 1 + currentScenes.length) % currentScenes.length);
  };

  if (!currentScene) return null;

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold">Студия раскадровки</h2>
        <p className="text-xs md:text-sm text-neutral-400">
          {currentSceneIndex + 1} / {currentScenes.length}
        </p>
      </div>

      <div className="flex-grow flex flex-col bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800">
        {/* Image Section with Controls */}
        <div className="relative w-full aspect-video bg-[#171717] flex items-center justify-center group">
          {currentScene.isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
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
        <div className="flex-grow p-6 md:p-8 overflow-y-auto">
          <div className="flex items-start justify-between mb-4">
            {isEditingText ? (
              <input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1 text-2xl md:text-3xl font-bold bg-transparent border-b-2 border-[#3B82F6] outline-none pb-2"
              />
            ) : (
              <h3 className="text-2xl md:text-3xl font-bold">{currentScene.title}</h3>
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
    </div>
  );
}

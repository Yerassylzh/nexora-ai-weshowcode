import React from 'react';
import { Scene, ActiveTab } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

const STYLE_OPTIONS = ['Реализм', 'Аниме', 'Киберпанк', 'ЧБ Нуар', '3D Рендер', '2D Вектор'];

interface OutlineEditorProps {
  currentScenes: Scene[];
  activeTab: ActiveTab;
  regTopic: string;
  setRegTopic: (value: string) => void;
  regSceneCount: number | string;
  setRegSceneCount: (value: number | string) => void;
  regStyle: string;
  setRegStyle: (value: string) => void;
  hasUnsavedChanges: boolean;
  isGenerating: boolean;
  handleRegenerate: () => void;
  handleUpdateScene: (data: { id: string; field: keyof Scene; value: string }) => void;
  handleAddScene: () => void;
  removeScene: (tab: ActiveTab, id: string) => void;
}

export default function OutlineEditor({
  currentScenes,
  activeTab,
  regTopic,
  setRegTopic,
  regSceneCount,
  setRegSceneCount,
  regStyle,
  setRegStyle,
  hasUnsavedChanges,
  isGenerating,
  handleRegenerate,
  handleUpdateScene,
  handleAddScene,
  removeScene,
}: OutlineEditorProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold">Редактор Структуры</h2>
        <span className="text-sm md:text-base text-neutral-400">Сцены: {currentScenes.length}</span>
      </div>

      {/* Regeneration Controls */}
      <div className="bg-[#171717] border border-neutral-800 rounded-xl p-4 md:p-6 mb-6">
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
                if (val === '') {
                  setRegSceneCount('');
                } else if (/^\d+$/.test(val)) {
                  const num = parseInt(val);
                  if (num <= 10) {
                    setRegSceneCount(num);
                  }
                }
              }}
              onBlur={(e) => {
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
      <div className="space-y-4">
        {currentScenes.map((scene, index) => (
          <div
            key={scene.id}
            className="bg-neutral-900 rounded-xl p-4 md:p-6 border border-neutral-800 hover:border-neutral-700 transition-all"
          >
            <div className="flex items-start gap-4 md:gap-6">
              <div className="text-4xl md:text-5xl font-bold text-neutral-700 w-12 md:w-16 flex-shrink-0">
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="flex-grow space-y-3 md:space-y-4">
                <input
                  value={scene.title}
                  onChange={(e) => handleUpdateScene({ id: scene.id, field: 'title', value: e.target.value })}
                  placeholder="Заголовок сцены"
                  className="w-full text-lg md:text-2xl font-semibold bg-transparent border-b-2 border-neutral-800 focus:border-[#3B82F6] outline-none pb-2 transition text-white"
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
          className="w-full py-4 md:py-6 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400 hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all flex items-center justify-center gap-2 text-base md:text-lg"
        >
          <Plus className="w-5 h-5 md:w-6 md:h-6" />
          <span>Добавить сцену</span>
        </button>
      </div>
    </div>
  );
}

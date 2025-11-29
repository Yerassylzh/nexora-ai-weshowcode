'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/context/ProjectContext';
import { generateOutline } from '@/lib/api';
import { Sparkles } from 'lucide-react';

const SCENE_OPTIONS = [3, 5, 10];
const STYLE_OPTIONS = ['Реализм', 'Аниме', 'Киберпанк', 'ЧБ Нуар', '3D Рендер', '2D Вектор'];

export default function HomePage() {
  const router = useRouter();
  const { setProjectData } = useProject();
  
  const [topic, setTopic] = useState('');
  const [sceneCount, setSceneCount] = useState(5);
  const [style, setStyle] = useState('Реализм');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      const data = await generateOutline(topic, style, sceneCount);
      setProjectData(data);
      router.push('/studio');
    } catch (error) {
      console.error('Failed to generate outline:', error);
      alert('Не удалось сгенерировать план. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-deep-animated flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-12 h-12 text-[#3B82F6]" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
              AI Director
            </h1>
          </div>
          <h2 className="text-5xl font-bold text-[#E5E5E5] mb-4">
            Что будем снимать сегодня?
          </h2>
          <p className="text-neutral-400 text-xl">
            Опишите идею фильма, и ИИ создаст профессиональный план съемок
          </p>
        </div>

        <div className="space-y-8">
          {/* Big Textarea */}
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Опишите идею фильма..."
            rows={6}
            className="w-full px-6 py-4 bg-[#171717] border-2 border-neutral-800 rounded-2xl text-[#E5E5E5] text-lg placeholder-neutral-600 focus:border-[#3B82F6] focus:outline-none transition-all resize-none"
          />

          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Scene Count */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                Количество сцен
              </label>
              <div className="flex gap-3">
                {SCENE_OPTIONS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setSceneCount(count)}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                      sceneCount === count
                        ? 'bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/30'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white border border-neutral-700'
                    }`}
                  >
                    {count} {count === 1 ? 'сцена' : count < 5 ? 'сцены' : 'сцен'}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Style */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                Визуальный стиль
              </label>
              <div className="flex flex-wrap gap-3">
                {STYLE_OPTIONS.map((styleOption) => (
                  <button
                    key={styleOption}
                    onClick={() => setStyle(styleOption)}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                      style === styleOption
                        ? 'bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/30'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white border border-neutral-700'
                    }`}
                  >
                    {styleOption}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || isLoading}
              className="px-12 py-4 bg-[#3B82F6] text-white text-lg font-semibold rounded-xl hover:bg-[#60A5FA] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#3B82F6]/30 hover:shadow-xl hover:shadow-[#3B82F6]/40"
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Генерация...
                </span>
              ) : (
                'Начать'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/context/ProjectContext';
// import { generateOutline } from '@/lib/api'; // COMMENTED OUT FOR TESTING
import { MOCK_OUTLINES } from '@/lib/mockData';
import { Sparkles, Upload } from 'lucide-react';
import { generateOutline } from '@/lib/api';

const SCENE_OPTIONS = [3, 5, 10];
const STYLE_OPTIONS = ['Реализм', 'Аниме', 'Киберпанк', 'ЧБ Нуар', '3D Рендер', '2D Вектор'];

export default function HomePage() {
  const router = useRouter();
  const { setProjectData } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [topic, setTopic] = useState('');
  const [sceneCount, setSceneCount] = useState(5);
  const [style, setStyle] = useState('Реализм');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      // MOCK DATA - Comment this out and uncomment API call when ready
      // await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      // const data = {
      //   topic,
      //   style,
      //   sceneCount,
      //   standard: MOCK_OUTLINES.standard.slice(0, sceneCount),
      //   experimental: MOCK_OUTLINES.experimental.slice(0, sceneCount),
      // };
      
      // REAL API CALL - Uncomment when ready to use
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

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate that it's a project data file
        if (data.topic && data.style && data.standard && data.experimental) {
          setProjectData(data);
          router.push('/studio');
        } else {
          alert('Неверный формат файла. Пожалуйста, загрузите экспортированный проект.');
        }
      } catch (error) {
        console.error('Failed to import file:', error);
        alert('Не удалось импортировать файл. Убедитесь, что это правильный JSON файл.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-deep-animated flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-[#3B82F6]" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
              AI Director
            </h1>
          </div>
          <h2 className="text-2xl md:text-5xl font-bold text-[#E5E5E5] mb-2 md:mb-4 px-4">
            Что будем снимать сегодня?
          </h2>
          <p className="text-neutral-400 text-base md:text-xl px-4">
            Опишите идею фильма, и ИИ создаст профессиональный план съемок
          </p>
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* Import Button */}
          <div className="flex justify-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors text-sm border border-neutral-700"
            >
              <Upload className="w-4 h-4" />
              Импортировать проект
            </button>
          </div>

          {/* Big Textarea */}
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Опишите идею фильма..."
            rows={5}
            className="w-full px-4 py-3 md:px-6 md:py-4 bg-[#171717] border-2 border-neutral-800 rounded-2xl text-[#E5E5E5] text-base md:text-lg placeholder-neutral-600 focus:border-[#3B82F6] focus:outline-none transition-all resize-none"
          />

          {/* Settings Panel */}
          <div className="space-y-5 md:space-y-6">
            {/* Scene Count */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2 md:mb-3">
                Количество сцен
              </label>
              <div className="flex gap-2 md:gap-3">
                {SCENE_OPTIONS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setSceneCount(count)}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
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
              <label className="block text-sm font-medium text-neutral-300 mb-2 md:mb-3">
                Визуальный стиль
              </label>
              <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3">
                {STYLE_OPTIONS.map((styleOption) => (
                  <button
                    key={styleOption}
                    onClick={() => setStyle(styleOption)}
                    className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
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
          <div className="flex justify-center md:justify-end pt-2 md:pt-4">
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || isLoading}
              className="w-full md:w-auto px-8 md:px-12 py-3 md:py-4 bg-[#3B82F6] text-white text-base md:text-lg font-semibold rounded-xl hover:bg-[#60A5FA] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#3B82F6]/30 hover:shadow-xl hover:shadow-[#3B82F6]/40"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2 md:gap-3">
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

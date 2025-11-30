import React from 'react';
import { Clapperboard, Sparkles } from 'lucide-react';

interface GeneratingScreenProps {
  currentScene: number;
  totalScenes: number;
  mode: 'standard' | 'experimental';
}

export default function GeneratingScreen({ currentScene, totalScenes, mode }: GeneratingScreenProps) {
  const progress = (currentScene / totalScenes) * 100;
  
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#0A0A0A] via-[#1a1a2e] to-[#16213e] flex items-center justify-center overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-[#3B82F6]/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#60A5FA]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full px-6">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-[#3B82F6]/30 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] p-6 rounded-full">
              <Clapperboard className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-[#60A5FA] animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-[#60A5FA] to-white bg-clip-text text-transparent">
              Создание изображений
            </h1>
            <Sparkles className="w-6 h-6 text-[#60A5FA] animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="text-lg text-neutral-400">
            {mode === 'standard' ? 'Стандартный' : 'Экспериментальный'} режим
          </p>
        </div>

        {/* Progress section */}
        <div className="space-y-6">
          {/* Scene counter */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
                {currentScene}
              </div>
              <div className="text-sm text-neutral-500 mt-1">Текущая</div>
            </div>
            <div className="text-3xl text-neutral-600">/</div>
            <div className="text-center">
              <div className="text-6xl font-bold text-neutral-700">
                {totalScenes}
              </div>
              <div className="text-sm text-neutral-500 mt-1">Всего</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="h-3 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
              <div 
                className="h-full bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#3B82F6] transition-all duration-500 rounded-full relative"
                style={{ 
                  width: `${progress}%`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite linear'
                }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-neutral-500">
              <span>{Math.round(progress)}%</span>
              <span>Осталось: {totalScenes - currentScene}</span>
            </div>
          </div>

          {/* Status message */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-full">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#60A5FA] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-sm text-neutral-300">Генерация изображения...</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

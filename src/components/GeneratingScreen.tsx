import React from 'react';
import { Film, Sparkles } from 'lucide-react';

interface GeneratingScreenProps {
  currentScene: number;
  totalScenes: number;
  mode: 'standard' | 'experimental';
}

export default function GeneratingScreen({ currentScene, totalScenes, mode }: GeneratingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center film-grain">
      {/* Spotlight effect */}
      <div className="absolute inset-0 bg-gradient-radial from-[#3B82F6]/10 via-transparent to-transparent" style={{ animation: 'spotlight 3s ease-in-out infinite' }} />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 md:gap-12 px-4">
        {/* Clapperboard Icon */}
        <div className="relative">
          {/* Pulse rings */}
          <div className="absolute inset-0 -m-12">
            <div className="w-48 h-48 border-2 border-[#3B82F6]/30 rounded-full" style={{ animation: 'pulse-ring 2s ease-in-out infinite' }} />
            <div className="absolute inset-0 w-48 h-48 border-2 border-[#60A5FA]/20 rounded-full" style={{ animation: 'pulse-ring 2s ease-in-out infinite 1s' }} />
          </div>
          
          {/* Clapperboard */}
          <div className="relative bg-neutral-900 border-4 border-white w-32 h-32 md:w-40 md:h-40 rounded-lg flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute -top-6 md:-top-8 left-0 right-0 h-6 md:h-8 bg-white border-4 border-black" style={{ animation: 'clapperSlap 2s ease-in-out infinite', transformOrigin: 'bottom' }}>
              <div className="flex h-full">
                <div className="flex-1 bg-black" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-black" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-black" />
              </div>
            </div>
            <Film className="w-16 h-16 md:w-20 md:h-20 text-[#3B82F6]" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#3B82F6] animate-pulse" />
            <h2 className="text-2xl md:text-4xl font-bold text-white">
              Создание изображений
            </h2>
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#60A5FA] animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          
          <p className="text-lg md:text-xl text-neutral-400">
            {mode === 'standard' ? 'Стандартный' : 'Экспериментальный'} режим
          </p>

          {/* Progress */}
          <div className="mt-6 md:mt-8 space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm md:text-base text-neutral-500">
              <span className="text-[#3B82F6] font-semibold text-lg md:text-xl">
                {currentScene}
              </span>
              <span>/</span>
              <span>{totalScenes}</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-64 md:w-96 h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] transition-all duration-500 ease-out"
                style={{ width: `${(currentScene / totalScenes) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Film strip decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden opacity-20">
          <div className="flex gap-2" style={{ animation: 'filmRoll 10s linear infinite' }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-16 h-20 bg-neutral-700 border-2 border-neutral-600 rounded" />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={`dup-${i}`} className="flex-shrink-0 w-16 h-20 bg-neutral-700 border-2 border-neutral-600 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

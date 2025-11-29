import React from 'react';
import { Scene } from '@/types';
import { RefreshCw, Maximize2 } from 'lucide-react';

interface StoryboardCardProps {
  scene: Scene;
  onRegenerate: (sceneId: string) => void;
  style: string;
}

export default function StoryboardCard({ scene, onRegenerate, style }: StoryboardCardProps) {
  return (
    <div className="bg-[#171717] rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-video bg-neutral-900 group">
        {scene.isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : scene.imageUrl ? (
          <>
            <img
              src={scene.imageUrl}
              alt={scene.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
              <button
                onClick={() => onRegenerate(scene.id)}
                className="p-3 bg-[#3B82F6] rounded-full hover:bg-[#60A5FA] transition-colors"
                title="Перегенерировать"
              >
                <RefreshCw className="w-5 h-5 text-white" />
              </button>
              <button
                className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors"
                title="Увеличить"
              >
                <Maximize2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-600">
            <span>Нет изображения</span>
          </div>
        )}
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <div className="flex flex-wrap gap-2 mb-3">
          {scene.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs font-medium bg-[#3B82F6]/20 text-[#3B82F6] rounded border border-[#3B82F6]/30"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-lg font-bold text-white mb-2">{scene.title}</h3>
        <p className="text-sm text-neutral-400 mb-3 line-clamp-2">
          {scene.description}
        </p>

        <div className="mt-auto pt-3 border-t border-neutral-800">
          <p className="text-xs italic text-[#3B82F6]/80 leading-relaxed">
            <span className="font-semibold">Заметка режиссера:</span> {scene.directorsNote}
          </p>
        </div>
      </div>
    </div>
  );
}

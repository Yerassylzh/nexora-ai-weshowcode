import React from 'react';
import { Scene } from '@/types';
import { Trash2 } from 'lucide-react';

interface SceneCardProps {
  scene: Scene;
  index: number;
  mode: string;
  onRemove: (id: string) => void;
  onUpdateContent: (data: { id: string; field: keyof Scene; value: string }) => void;
}

const SceneCard = ({ scene, index, mode, onRemove, onUpdateContent }: SceneCardProps) => {
    
    const handleInput = (field: keyof Scene, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onUpdateContent({ id: scene.id, field, value: e.target.value });
    };

    return (
        <div 
            className="relative w-72 h-64 bg-[#171717]/50 backdrop-blur-sm rounded-xl p-5 border border-neutral-700 transition-all duration-300 scene-card flex-shrink-0 relative z-10"
        >
            <button
                onClick={() => onRemove(scene.id)}
                className="absolute top-2 right-2 text-neutral-500 hover:text-red-500 transition-colors"
                title="Удалить сцену"
            >
                <Trash2 className="h-5 w-5" />
            </button>

            <div className="space-y-3">
                <input
                    value={scene.title}
                    onChange={(e) => handleInput('title', e)}
                    placeholder="Заголовок Сцены"
                    className="w-full text-xl font-semibold bg-transparent border-b border-neutral-700 focus:border-[#3B82F6] outline-none pb-1 transition duration-150 text-white"
                />
                <textarea
                    value={scene.description}
                    onChange={(e) => handleInput('description', e)}
                    placeholder="Подробное описание сцены..."
                    rows={5}
                    className="w-full text-sm text-neutral-400 bg-transparent resize-none outline-none focus:ring-0 mt-2"
                ></textarea>
            </div>
            
        </div>
    );
};

export default SceneCard;

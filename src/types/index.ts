export interface Scene {
  id: string;
  order: number;
  title: string;
  description: string;
  visualPrompt: string;
  tags: string[];
  directorsNote: string;
  imageUrl?: string;
  isLoading?: boolean;
}

export interface ProjectData {
  topic: string;
  style: string;
  sceneCount: number;
  standard: Scene[];
  experimental: Scene[];
}

export type ViewMode = 'outline' | 'storyboard';
export type ActiveTab = 'standard' | 'experimental';

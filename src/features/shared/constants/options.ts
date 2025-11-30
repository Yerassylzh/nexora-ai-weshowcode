/**
 * Application-wide constants for project configuration
 */

export const SCENE_OPTIONS = [3, 5, 10] as const;

export const STYLE_OPTIONS = [
  'Реализм',
  'Аниме', 
  'Киберпанк',
  'ЧБ Нуар',
  '3D Рендер',
  '2D Вектор'
] as const;

export type SceneOption = typeof SCENE_OPTIONS[number];
export type StyleOption = typeof STYLE_OPTIONS[number];

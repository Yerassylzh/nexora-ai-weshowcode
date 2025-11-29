import { ProjectData } from '@/types';

export async function generateOutline(
  topic: string,
  style: string,
  sceneCount: number
): Promise<ProjectData> {
  const response = await fetch('/api/generate-outline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, style, sceneCount }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate outline');
  }

  return response.json();
}

export async function generateImage(
  prompt: string,
  style: string
): Promise<{ imageUrl: string }> {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, style }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate image');
  }

  return response.json();
}

/**
 * Utilities for exporting projects as ZIP archives
 */

import JSZip from 'jszip';
import { waitForImage } from './imageUtils';

export interface ProjectData {
  topic: string;
  style: string;
  sceneCount: number;
  standard: any[];
  experimental: any[];
}

/**
 * Creates a ZIP archive containing project data and images
 * 
 * @param projectData - The project data to export
 * @returns Promise resolving to ZIP Blob
 */
export async function createProjectZip(projectData: ProjectData): Promise<Blob> {
  const zip = new JSZip();

  // Create project metadata (excluding runtime fields)
  const projectMeta = {
    topic: projectData.topic,
    style: projectData.style,
    sceneCount: projectData.sceneCount,
    exportedAt: new Date().toISOString(),
    standard: projectData.standard.map(({ id, isLoading, ...scene }) => scene),
    experimental: projectData.experimental.map(({ id, isLoading, ...scene }) => scene),
  };
  
  zip.file('project.json', JSON.stringify(projectMeta, null, 2));

  // Create README
  const readme = `AI Director Project Export
      
Topic: ${projectData.topic}
Style: ${projectData.style}
Scenes: ${projectData.sceneCount}
Exported: ${new Date().toLocaleString()}

This archive contains:
- project.json: All scene metadata and prompts
- standard/: ${projectData.standard.length} standard version images
- experimental/: ${projectData.experimental.length} experimental version images
`;
  zip.file('README.txt', readme);

  // Download and add images for both modes
  for (const mode of ['standard', 'experimental'] as const) {
    const scenes = projectData[mode];
    const folder = zip.folder(mode)!;
    
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (scene.imageUrl) {
        try {
          console.log(`Fetching ${mode} scene ${i + 1}...`);
          const imageBlob = await waitForImage(scene.imageUrl);
          folder.file(`scene-${String(i + 1).padStart(2, '0')}.jpg`, imageBlob);
        } catch (error) {
          console.error(`Failed to fetch image for ${mode} scene ${i + 1}:`, error);
          // Continue with other images even if one fails
        }
      }
    }
  }

  // Generate ZIP blob
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Triggers download of a ZIP blob
 * 
 * @param blob - The ZIP blob to download
 * @param filename - Optional filename (default: ai-director-{timestamp}.zip)
 */
export function downloadZip(blob: Blob, filename?: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `ai-director-${Date.now()}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}

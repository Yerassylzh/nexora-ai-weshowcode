/**
 * Utilities for importing projects from ZIP archives
 */

import JSZip from 'jszip';
import { blobToDataURL } from './imageUtils';

export interface ProjectData {
  topic: string;
  style: string;
  sceneCount: number;
  standard: any[];
  experimental: any[];
}

/**
 * Extracts and validates a ZIP archive containing a project
 * 
 * @param file - The ZIP file to extract
 * @returns Promise resolving to ProjectData
 * @throws Error if ZIP is invalid or missing required files
 */
export async function extractProjectZip(file: File): Promise<ProjectData> {
  const zip = await JSZip.loadAsync(file);
  
  // Read project.json
  const projectFile = zip.file('project.json');
  if (!projectFile) {
    throw new Error('Invalid ZIP: project.json not found');
  }
  
  const projectJson = await projectFile.async('text');
  const projectMeta = JSON.parse(projectJson);
  
  // Load images for both modes
  await Promise.all([
    loadImagesForMode(zip, projectMeta, 'standard'),
    loadImagesForMode(zip, projectMeta, 'experimental'),
  ]);
  
  return projectMeta;
}

/**
 * Loads images from ZIP for a specific mode (standard/experimental)
 * 
 * @param zip - The JSZip instance
 * @param projectMeta - The project metadata object to populate
 * @param mode - The mode ('standard' or 'experimental')
 */
async function loadImagesForMode(
  zip: JSZip,
  projectMeta: ProjectData,
  mode: 'standard' | 'experimental'
): Promise<void> {
  const scenes = projectMeta[mode];
  
  for (let i = 0; i < scenes.length; i++) {
    const imagePath = `${mode}/scene-${String(i + 1).padStart(2, '0')}.jpg`;
    const imageFile = zip.file(imagePath);
    
    if (imageFile) {
      const blob = await imageFile.async('blob');
      const dataURL = await blobToDataURL(blob);
      scenes[i].imageUrl = dataURL;
      scenes[i].id = `${Date.now()}-${i}`;
      scenes[i].isLoading = false;
    } else {
      scenes[i].imageUrl = null;
      scenes[i].id = `${Date.now()}-${i}`;
      scenes[i].isLoading = false;
    }
  }
}

/**
 * Validates if file is a valid project JSON
 * 
 * @param data - Parsed JSON data
 * @returns True if valid project data
 */
export function isValidProjectData(data: any): boolean {
  return !!(data.topic && data.style && data.standard && data.experimental);
}

/**
 * Custom hook for handling project export operations
 */

import { useState } from 'react';

interface UseProjectExportProps {
  projectData: any;
}

export function useProjectExport({ projectData }: UseProjectExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const { createProjectZip, downloadZip } = await import('@/lib/utils/zipExport');
    
    setIsExporting(true);
    
    try {
      const zipBlob = await createProjectZip(projectData);
      downloadZip(zipBlob);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Не удалось экспортировать проект. Проверьте консоль для деталей.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    handleExport,
    isExporting,
  };
}

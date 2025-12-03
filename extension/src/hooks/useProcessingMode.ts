import { useState, useEffect } from 'react';
import { ProcessingMode, getProcessingMode, setProcessingMode } from '@/lib/storage';

/**
 * Hook to manage processing mode setting
 */
export function useProcessingMode() {
  const [mode, setMode] = useState<ProcessingMode>('automatic');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProcessingMode()
      .then((savedMode) => {
        setMode(savedMode);
      })
      .catch((error) => {
        console.error('Error loading processing mode:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const updateMode = async (newMode: ProcessingMode) => {
    try {
      await setProcessingMode(newMode);
      setMode(newMode);
    } catch (error) {
      console.error('Error updating processing mode:', error);
    }
  };

  return { mode, updateMode, isLoading };
}

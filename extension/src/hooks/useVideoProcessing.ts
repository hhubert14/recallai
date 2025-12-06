import { useState } from 'react';
import { processVideo } from '@/services/api';

type ProcessingStatus = 'idle' | 'processing' | 'success' | 'already_exists' | 'error';

export function useVideoProcessing() {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const process = async (videoUrl: string) => {
    setStatus('processing');
    setErrorMessage(null);

    try {
      const result = await processVideo(videoUrl);
      if (result.success) {
        setStatus(result.alreadyExists ? 'already_exists' : 'success');
      } else {
        setStatus('error');
        setErrorMessage('Failed to process video');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const reset = () => {
    setStatus('idle');
    setErrorMessage(null);
  };

  return { status, errorMessage, process, reset };
}

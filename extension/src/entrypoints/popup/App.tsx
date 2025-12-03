import { useAuth } from '@/hooks/useAuth';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import { useProcessingMode } from '@/hooks/useProcessingMode';
import { BASE_URL } from '@/lib/constants';
import { useState } from 'react';

export default function App() {
  const { authState } = useAuth();

  return (
    <div className="w-[350px] p-4 font-sans">
      <Header />
      <Content authState={authState} />
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center mb-4">
      <img
        src="/icons/icon48.png"
        alt="RecallAI Logo"
        className="w-6 h-6 mr-2"
      />
      <h1 className="text-lg font-semibold m-0">RecallAI</h1>
    </div>
  );
}

function Content({ authState }: { authState: 'loading' | 'authenticated' | 'unauthenticated' }) {
  if (authState === 'loading') {
    return <p className="text-gray-500">Loading...</p>;
  }

  if (authState === 'authenticated') {
    return <AuthenticatedView />;
  }

  return <UnauthenticatedView />;
}

function AuthenticatedView() {
  const { tabInfo } = useCurrentTab();
  const { mode, updateMode, isLoading: modeLoading } = useProcessingMode();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSignOut = () => {
    window.open(`${BASE_URL}/auth/logout`, '_blank');
  };

  const handleModeToggle = () => {
    const newMode = mode === 'automatic' ? 'manual' : 'automatic';
    updateMode(newMode);
    setProcessResult(null); // Clear any previous results
  };

  const handleProcessVideo = async () => {
    if (!tabInfo.url || !tabInfo.videoId) return;

    setIsProcessing(true);
    setProcessResult(null);

    try {
      const response = await browser.runtime.sendMessage({
        action: 'processVideo',
        videoUrl: tabInfo.url,
        videoId: tabInfo.videoId,
      });

      if (response.success) {
        setProcessResult({
          type: 'success',
          message: 'Video queued for processing! Check your dashboard soon.',
        });
      } else {
        setProcessResult({
          type: 'error',
          message: 'Failed to process video. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error processing video:', error);
      setProcessResult({
        type: 'error',
        message: 'Error communicating with extension. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Processing Mode Toggle */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Processing Mode</span>
          {!modeLoading && (
            <button
              onClick={handleModeToggle}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ backgroundColor: mode === 'automatic' ? '#3b82f6' : '#9ca3af' }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                style={{ transform: mode === 'automatic' ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }}
              />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600">
          {mode === 'automatic' 
            ? 'Videos are processed automatically when you watch them'
            : 'You choose which videos to process manually'}
        </p>
      </div>

      {/* Current Video Info (only show in manual mode) */}
      {mode === 'manual' && tabInfo.isYouTube && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <svg 
              className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 mb-1">YouTube video detected</p>
              <p className="text-xs text-blue-700 mb-3 truncate">Video ID: {tabInfo.videoId}</p>
              <button
                onClick={handleProcessVideo}
                disabled={isProcessing}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Process This Video'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Result Message */}
      {processResult && (
        <div className={`mb-4 p-3 rounded-lg border ${
          processResult.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="text-sm">{processResult.message}</p>
        </div>
      )}

      {/* Info Message */}
      <p className="mb-4 leading-relaxed text-sm text-gray-700">
        {mode === 'automatic' 
          ? "You're connected to RecallAI. Educational videos you watch on YouTube will be automatically processed and added to your learning library."
          : "You're connected to RecallAI. Click 'Process This Video' when watching a YouTube video to add it to your learning library."}
      </p>

      {/* Action Buttons */}
      <div className="space-y-2">
        <a
          href={`${BASE_URL}/dashboard`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Go to My Dashboard
        </a>
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
        >
          Disconnect
        </button>
      </div>
    </>
  );
}

function UnauthenticatedView() {
  const handleSignIn = () => {
    window.open(`${BASE_URL}/auth/login`, '_blank');
  };

  return (
    <>
      <p className="mb-4 leading-relaxed text-sm">
        Sign in to RecallAI to automatically process educational YouTube videos
        and create summaries and study materials.
      </p>
      <button
        onClick={handleSignIn}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Sign in to RecallAI
      </button>
    </>
  );
}

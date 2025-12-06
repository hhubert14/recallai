import { useAuth } from '@/hooks/useAuth';
import { useCurrentTab } from '@/hooks/useCurrentTab';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';
import { BASE_URL } from '@/lib/constants';

export default function App() {
  const { authState } = useAuth();
  const tabState = useCurrentTab();
  const processing = useVideoProcessing();

  return (
    <div className="w-[300px] p-4 font-sans">
      <Header />
      <Content authState={authState} tabState={tabState} processing={processing} />
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

type TabState = ReturnType<typeof useCurrentTab>;
type ProcessingState = ReturnType<typeof useVideoProcessing>;

function Content({
  authState,
  tabState,
  processing,
}: {
  authState: 'loading' | 'authenticated' | 'unauthenticated';
  tabState: TabState;
  processing: ProcessingState;
}) {
  if (authState === 'loading') {
    return <p className="text-gray-500">Loading...</p>;
  }

  if (authState === 'authenticated') {
    return <AuthenticatedView tabState={tabState} processing={processing} />;
  }

  return <UnauthenticatedView />;
}

function AuthenticatedView({
  tabState,
  processing,
}: {
  tabState: TabState;
  processing: ProcessingState;
}) {
  const handleSignOut = () => {
    window.open(`${BASE_URL}/auth/logout`, '_blank');
  };

  return (
    <>
      <VideoProcessingSection tabState={tabState} processing={processing} />

      <div className="mt-4 space-y-2">
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

function VideoProcessingSection({
  tabState,
  processing,
}: {
  tabState: TabState;
  processing: ProcessingState;
}) {
  if (tabState.isLoading) {
    return (
      <div className="p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-500">Checking current page...</p>
      </div>
    );
  }

  if (!tabState.isYouTubeVideo) {
    return (
      <div className="p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-500">
          Navigate to a YouTube video to process it.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 bg-gray-50 rounded">
      {processing.status === 'idle' && (
        <button
          onClick={() => tabState.url && processing.process(tabState.url)}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-medium"
        >
          Process This Video
        </button>
      )}

      {processing.status === 'processing' && (
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full mr-2" />
          <span className="text-sm text-gray-600">Processing video...</span>
        </div>
      )}

      {processing.status === 'success' && (
        <div className="text-center">
          <p className="text-sm text-green-600 mb-2">
            Video processed successfully!
          </p>
          <a
            href={`${BASE_URL}/dashboard`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline"
          >
            View in Dashboard
          </a>
        </div>
      )}

      {processing.status === 'already_exists' && (
        <div className="text-center">
          <p className="text-sm text-blue-600 mb-2">
            This video is already in your library.
          </p>
          <a
            href={`${BASE_URL}/dashboard`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline"
          >
            View in Dashboard
          </a>
        </div>
      )}

      {processing.status === 'error' && (
        <div className="text-center">
          <p className="text-sm text-red-600 mb-2">
            {processing.errorMessage || 'Failed to process video'}
          </p>
          <button
            onClick={() => processing.reset()}
            className="text-sm text-blue-500 hover:underline"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

function UnauthenticatedView() {
  const handleSignIn = () => {
    window.open(`${BASE_URL}/auth/login`, '_blank');
  };

  return (
    <>
      <p className="mb-4 leading-relaxed text-sm">
        Sign in to RecallAI to process educational YouTube videos
        and create summaries for your learning library.
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

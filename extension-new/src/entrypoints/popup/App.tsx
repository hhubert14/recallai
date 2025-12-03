import { useAuth } from '@/hooks/useAuth';
import { BASE_URL } from '@/lib/constants';

export default function App() {
  const { authState } = useAuth();

  return (
    <div className="w-[300px] p-4 font-sans">
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
  const handleSignOut = () => {
    window.open(`${BASE_URL}/auth/logout`, '_blank');
  };

  return (
    <>
      <p className="mb-4 leading-relaxed text-sm">
        You're connected to RecallAI. Educational videos you watch on YouTube
        will be automatically processed and added to your learning library.
      </p>
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

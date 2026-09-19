import { Component, ReactNode, StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import IntroExperience from './components/IntroExperience';
import './index.css';

const INTRO_KEY = 'corporatebaddie:intro-completed';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('CorporateBaddie caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080c] text-slate-200 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-[#191b1a] border border-amber-500/30 rounded-xl p-8 shadow-2xl space-y-4">
            <h1 className="text-xl font-bold text-amber-400">Application Notice</h1>
            <p className="text-sm text-slate-400">
              {this.state.error?.message || 'A component encountered an issue.'}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-mono text-xs transition"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Root() {
  const [initialQuestion, setInitialQuestion] = useState<string | undefined>(undefined);
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return sessionStorage.getItem(INTRO_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const enterApp = (selectedQuestion?: string) => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      // Continue even when session storage is unavailable.
    }
    if (selectedQuestion) {
      setInitialQuestion(selectedQuestion);
    }
    setShowIntro(false);
  };

  const replayIntro = () => {
    setShowIntro(true);
  };

  if (showIntro) return <IntroExperience onEnter={enterApp} />;
  return (
    <ErrorBoundary>
      <App initialQuestion={initialQuestion} onReplayIntro={replayIntro} />
    </ErrorBoundary>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);

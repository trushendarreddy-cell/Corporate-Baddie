import {StrictMode, useState} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import IntroExperience from './components/IntroExperience';
import './index.css';

const INTRO_KEY = 'corporatebaddie:intro-completed';

function Root() {
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return sessionStorage.getItem(INTRO_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const enterApp = () => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      // Continue even when session storage is unavailable.
    }
    setShowIntro(false);
  };

  if (showIntro) return <IntroExperience onEnter={enterApp} />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);

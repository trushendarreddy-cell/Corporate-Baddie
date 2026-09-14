import {StrictMode, useState} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import IntroExperience from './components/IntroExperience';
import './index.css';

function Root() {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return <IntroExperience onEnter={() => setShowIntro(false)} />;
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);

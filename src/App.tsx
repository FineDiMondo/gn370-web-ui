import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Dashboard } from './pages/Dashboard';
import { WorldDetail } from './pages/WorldDetail';
import { BootSequence } from './components/BootSequence';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export const App: React.FC = () => {
  const [bootCompleted, setBootCompleted] = useState(false);

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {!bootCompleted && (
          <BootSequence key="boot" onComplete={() => setBootCompleted(true)} />
        )}
      </AnimatePresence>

      {bootCompleted && (
        <div className="app-container" style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <header style={{
            marginBottom: '30px',
            borderBottom: 'var(--border-style)',
            paddingBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{ color: 'var(--accent-color)', fontSize: '1.5rem', margin: 0 }}>G N 3 7 0</h1>
              <p style={{ color: 'var(--secondary-color)', margin: 0, fontSize: '0.9rem' }}>Nove Mondi Interface</p>
            </div>
            <div className="blink" style={{
              width: '12px', height: '24px', backgroundColor: 'var(--text-color)'
            }}></div>
          </header>

          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <HashRouter>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Dashboard defaultPersonId="I99" />} />
                  <Route path="/world/:personId/:worldId" element={<WorldDetail />} />
                </Routes>
              </AnimatePresence>
            </HashRouter>
          </main>
        </div>
      )}
    </ThemeProvider>
  );
};

export default App;

import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { Dashboard } from './pages/Dashboard';
import { WorldDetail } from './pages/WorldDetail';

function App() {
  return (
    <ThemeProvider>
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
            <Routes>
              <Route path="/" element={<Dashboard defaultPersonId="I290" />} /> {/* I290 is likely a prominent ancestor, could be anyone */}
              <Route path="/world/:worldId" element={<WorldDetail defaultPersonId="I290" />} />
            </Routes>
          </HashRouter>
        </main>

        <ThemeSwitcher />
      </div>
    </ThemeProvider>
  );
}

export default App;

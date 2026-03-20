import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/MainLayout';
import { FamilyTreeViewer } from './components/FamilyTreeViewer';
import { TimelineViewer } from './components/TimelineViewer';
import { GeoMapViewer } from './components/GeoMapViewer';
import { AlbumView } from './components/AlbumView';
import { StoryEditor } from './components/StoryEditor';
import { SearchView } from './components/SearchView';
import { StatisticsView } from './components/StatisticsView';
import { RelationsView } from './components/RelationsView';
import { ResourcesView } from './components/ResourcesView';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { AnalyticsProvider } from './providers/AnalyticsProvider';
import { LoginPage } from './pages/LoginPage';
import './App.css';

const GOOGLE_CLIENT_ID = "1087484029268-a8k9bvl4g1apcuf64abmc5c8bnigf9vs.apps.googleusercontent.com";

function TreePage() {
  const [selectedId, setSelectedId] = useState('root');
  const mockFamily = {
    id: 'root',
    name: 'Giuseppe Giardina',
    birthDate: '1790-01-10',
    children: [{
      id: 'p1',
      name: 'Giovanni Giardina',
      birthDate: '1850-05-15',
      parents: [],
      children: [],
      spouse: { id: 'p2', name: 'Francesca Negrini', birthDate: '1855-07-22', parents: [], children: [] }
    }]
  };
  return (
    <MainLayout>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <FamilyTreeViewer rootPerson={mockFamily} selectedPersonId={selectedId} onPersonClick={setSelectedId} />
        <div style={{ borderLeft: '1px solid #1A1F3A', paddingLeft: '20px' }}>
          <StoryEditor personId={selectedId} />
        </div>
      </div>
    </MainLayout>
  );
}

function SearchPage() { return <MainLayout><SearchView allPeople={[]} /></MainLayout>; }
function TimelinePage() {
  const events = [{ date: '1850-05-15', title: 'Nascita', type: 'birth' as const }, { date: '1875-11-30', title: 'Matrimonio', type: 'marriage' as const }];
  return <MainLayout><TimelineViewer personId="p1" events={events} /></MainLayout>;
}
function MapsPage() { return <MainLayout><GeoMapViewer /></MainLayout>; }
function AlbumPage() { return <MainLayout><AlbumView /></MainLayout>; }
function StoriesPage() { return <MainLayout><StoryEditor personId="p1" initialStory="Giovanni Giardina fu un notaio di Palermo..." /></MainLayout>; }
function StatsPage() { return <MainLayout><StatisticsView /></MainLayout>; }
function RelationsPage() { return <MainLayout><RelationsView /></MainLayout>; }
function ResourcesPage() { return <MainLayout><ResourcesView /></MainLayout>; }

/**
 * Componente che controlla se l'utente è autenticato
 */
function AuthenticatedRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', width: '100vw', 
        backgroundColor: '#000', color: '#00D9FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Fira Code", monospace'
      }}>
        [ INITIALIZING AUTH_GATE... ]
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<TreePage />} />
      <Route path="/tree" element={<TreePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/timeline" element={<TimelinePage />} />
      <Route path="/maps" element={<MapsPage />} />
      <Route path="/album" element={<AlbumPage />} />
      <Route path="/stories" element={<StoriesPage />} />
      <Route path="/relations" element={<RelationsPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
    </Routes>
  );
}

export function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AnalyticsProvider trackingId="G-XXXXXXXXXX" consentRequired={true} privacyMode={false}>
          <BrowserRouter>
            <CookieConsentBanner />
            <AuthenticatedRoutes />
          </BrowserRouter>
        </AnalyticsProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

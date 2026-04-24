import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import StudioAI from './pages/StudioAI';
import Clients from './pages/Clients';
import BrandAssets from './pages/BrandAssets';
import VideoEditor from './pages/VideoEditor';
import Login from './pages/Login';

function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="flex bg-surface text-on-surface min-h-screen">
      <Sidebar />
      <Header />
      <main className="ml-[268px] pt-12 flex-1 relative overflow-hidden nebula-glow min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/assets" element={<BrandAssets />} />
          <Route path="/editor" element={<VideoEditor />} />
          <Route path="/studio" element={<StudioAI />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppShell />
      </Router>
    </AuthProvider>
  );
}

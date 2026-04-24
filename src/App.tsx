/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import StudioAI from './pages/StudioAI';
import Clients from './pages/Clients';
import BrandAssets from './pages/BrandAssets';
import VideoEditor from './pages/VideoEditor';

export default function App() {
  return (
    <Router>
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
    </Router>
  );
}

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/common';
import { ToastProvider } from './context/ToastContext';
import { Dashboard, VaultManagement, DocumentUpload, AgentManagement } from './pages';
import './App.css';

// Lazy load the Chat page for code splitting
const ChatConsole = lazy(() => 
  import('./pages/ChatConsole').then(module => ({ default: module.ChatConsole }))
);

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Suspense fallback={<div className="loading-page">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/vaults" element={<VaultManagement />} />
                <Route path="/documents" element={<DocumentUpload />} />
                <Route path="/agents" element={<AgentManagement />} />
                <Route path="/chat" element={<ChatConsole />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;

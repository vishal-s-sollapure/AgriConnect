import React, { useState } from 'react';
import { AgriProvider, useAgri } from './context/AgriContext';
import Navbar from './components/common/Navbar';
import LandingPage from './pages/public/LandingPage';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import Footer from './components/common/Footer';
import AuthModal from './pages/auth/AuthModal';
import AIAssistantWidget from './components/common/AIAssistantWidget';

function MainApp() {
  const { currentUser } = useAgri();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState('farmer');

  const handleOpenAuth = (mode = 'login', role = 'farmer') => {
    setAuthMode(mode);
    setSelectedRole(role);
    setAuthModalOpen(true);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Navigation Header */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* Main Content View */}
      <main style={{ flex: 1 }}>
        {!currentUser ? (
          <LandingPage 
            onSelectRole={handleRoleSelect} 
            onOpenAuth={handleOpenAuth} 
          />
        ) : currentUser.role === 'farmer' ? (
          <FarmerDashboard />
        ) : (
          <WorkerDashboard />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating AI Voice & Multilingual Layer Widget */}
      <AIAssistantWidget />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        initialRole={selectedRole}
      />
    </div>
  );
}

export default function App() {
  return (
    <AgriProvider>
      <MainApp />
    </AgriProvider>
  );
}

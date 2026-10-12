import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AgriProvider, useAgri } from './context/AgriContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import LandingPage from './pages/public/LandingPage';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import CreateJob from './pages/farmer/CreateJob';
import MyJobs from './pages/farmer/MyJobs';
import JobDetails from './pages/farmer/JobDetails';
import EditJob from './pages/farmer/EditJob';
import JobApplicants from './pages/farmer/JobApplicants';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import JobDiscovery from './pages/worker/JobDiscovery';
import JobPublicDetails from './pages/worker/JobPublicDetails';
import MyApplications from './pages/worker/MyApplications';
import Footer from './components/common/Footer';
import AuthModal from './pages/auth/AuthModal';
import AIAssistantWidget from './components/common/AIAssistantWidget';
import ProtectedRoute from './components/common/ProtectedRoute';

function MainApp() {
  const { currentUser: agriUser } = useAgri();
  const { currentUser: authUser } = useAuth();
  
  const currentUser = authUser || agriUser;

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

      {/* Main Content Router */}
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Home / Landing Page */}
          <Route 
            path="/" 
            element={
              !currentUser ? (
                <LandingPage 
                  onSelectRole={handleRoleSelect} 
                  onOpenAuth={handleOpenAuth} 
                />
              ) : currentUser.role === 'farmer' ? (
                <Navigate to="/farmer" replace />
              ) : (
                <Navigate to="/worker" replace />
              )
            } 
          />

          {/* Farmer Portal Protected Routes */}
          <Route 
            path="/farmer" 
            element={
              <ProtectedRoute allowedRoles={['farmer']} onOpenAuth={handleOpenAuth}>
                <FarmerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/farmer/jobs" 
            element={
              <ProtectedRoute allowedRoles={['farmer']} onOpenAuth={handleOpenAuth}>
                <MyJobs />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/farmer/jobs/new" 
            element={
              <ProtectedRoute allowedRoles={['farmer']} onOpenAuth={handleOpenAuth}>
                <CreateJob />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/farmer/jobs/:id" 
            element={
              <ProtectedRoute allowedRoles={['farmer']} onOpenAuth={handleOpenAuth}>
                <JobDetails />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/farmer/jobs/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['farmer']} onOpenAuth={handleOpenAuth}>
                <EditJob />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/farmer/jobs/:id/applicants" 
            element={
              <ProtectedRoute allowedRoles={['farmer']} onOpenAuth={handleOpenAuth}>
                <JobApplicants />
              </ProtectedRoute>
            } 
          />

          {/* Worker Portal Protected Routes */}
          <Route 
            path="/worker" 
            element={
              <ProtectedRoute allowedRoles={['worker']} onOpenAuth={handleOpenAuth}>
                <WorkerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/worker/applications" 
            element={
              <ProtectedRoute allowedRoles={['worker']} onOpenAuth={handleOpenAuth}>
                <MyApplications />
              </ProtectedRoute>
            } 
          />

          {/* Public Job Marketplace Routes */}
          <Route 
            path="/jobs" 
            element={<JobDiscovery />} 
          />

          <Route 
            path="/jobs/:id" 
            element={<JobPublicDetails onOpenAuth={handleOpenAuth} />} 
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating AI Voice Layer Widget */}
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
    <AuthProvider>
      <AgriProvider>
        <BrowserRouter>
          <MainApp />
        </BrowserRouter>
      </AgriProvider>
    </AuthProvider>
  );
}

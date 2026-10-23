import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AgriProvider, useAgri } from './context/AgriContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const FarmerDashboard = lazy(() => import('./pages/farmer/FarmerDashboard'));
const CreateJob = lazy(() => import('./pages/farmer/CreateJob'));
const MyJobs = lazy(() => import('./pages/farmer/MyJobs'));
const JobDetails = lazy(() => import('./pages/farmer/JobDetails'));
const EditJob = lazy(() => import('./pages/farmer/EditJob'));
const JobApplicants = lazy(() => import('./pages/farmer/JobApplicants'));
const WorkerDashboard = lazy(() => import('./pages/worker/WorkerDashboard'));
const JobDiscovery = lazy(() => import('./pages/worker/JobDiscovery'));
const JobPublicDetails = lazy(() => import('./pages/worker/JobPublicDetails'));
const MyApplications = lazy(() => import('./pages/worker/MyApplications'));
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
  const [authEmail, setAuthEmail] = useState('');

  const handleOpenAuth = (mode = 'login', role = 'farmer', email = '') => {
    setAuthMode(mode);
    setSelectedRole(role);
    setAuthEmail(email);
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
        <Suspense fallback={<div className="container" style={{ padding: '4rem 1rem', color: '#cbd5e1' }}>Loading page…</div>}>
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
                <CreateJob onOpenAuth={handleOpenAuth} />
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
        </Suspense>
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
        initialEmail={authEmail}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AgriProvider>
          <BrowserRouter>
            <MainApp />
          </BrowserRouter>
        </AgriProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

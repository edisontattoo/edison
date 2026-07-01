



import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ArtistsPage from './pages/ArtistsPage';
import LocationsPage from './pages/LocationsPage';
import BookingPage from './pages/BookingPage';
import ReleaseFormPage from './pages/ReleaseFormPage';
import AIToolsPage from './pages/AIToolsPage';
import { AppRoutes } from './constants';
import ReleaseFormViewerPage from './pages/ReleaseFormViewerPage';
import WalkinPage from './pages/WalkinPage';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { initializeData } from './services/dataService';
import ServicesPage from './pages/ServicesPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

const AdminBanner: React.FC = () => {
  const { isAuthenticated } = useAdmin();
  if (!isAuthenticated) return null;
  
  return (
    <div className="bg-cyan-600 text-white text-center py-1 text-sm font-semibold">
      Admin Mode is Active
    </div>
  );
};

const AppContent: React.FC = () => {
    // Initialize data from localStorage on app start
    useEffect(() => {
        initializeData();
    }, []);

    return (
        <HashRouter>
            <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
                <AdminBanner />
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
                    <Routes>
                        <Route path={AppRoutes.HOME} element={<HomePage />} />
                        <Route path={AppRoutes.ARTISTS} element={<ArtistsPage />} />
                        <Route path={AppRoutes.LOCATIONS} element={<LocationsPage />} />
                        <Route path={AppRoutes.BOOKING} element={<BookingPage />} />
                        <Route path={AppRoutes.WALK_IN} element={<WalkinPage />} />
                        <Route path={AppRoutes.RELEASE_FORM} element={<ReleaseFormPage />} />
                        <Route path="/release-form/view/:id" element={<ReleaseFormViewerPage />} />
                        <Route path={AppRoutes.MANAGE_SERVICES} element={<ServicesPage />} />
                        <Route path={AppRoutes.ADMIN_SETTINGS} element={<AdminSettingsPage />} />
                        <Route path={AppRoutes.AI_TOOLS} element={<AIToolsPage />} /> 
                    </Routes>
                </main>
                <Footer />
            </div>
        </HashRouter>
    );
};

const App: React.FC = () => (
    <AdminProvider>
        <AppContent />
    </AdminProvider>
);

export default App;
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';

import { HomePage } from './pages/HomePage';
import { RestaurantPage } from './pages/RestaurantPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { RestaurantAdminPage } from './pages/RestaurantAdminPage';
import { DeliveryDashboardPage } from './pages/DeliveryDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { Zap } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-zinc-100 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar onOpenAuthModal={() => setIsAuthModalOpen(true)} />
      <CartDrawer />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          
          <Route
            path="/checkout"
            element={
              <ProtectedRoute roles={['customer']}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking/:id"
            element={
              <ProtectedRoute>
                <OrderTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute roles={['customer']}>
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant-admin"
            element={
              <ProtectedRoute roles={['restaurant_admin', 'admin']}>
                <RestaurantAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery"
            element={
              <ProtectedRoute roles={['delivery', 'admin']}>
                <DeliveryDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin', 'restaurant_admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-zinc-950 text-zinc-400 text-xs py-8 border-t border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-500 fill-brand-500" />
            <span className="font-black text-white text-sm font-['Outfit']">Quick<span className="text-brand-500">Bite!</span></span>
            <span className="text-zinc-500">— Discover Delicious Food Delivered Fast</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            © 2026 QuickBite! Inc. All rights reserved. Powered by Google OAuth 2.0 & React 18
          </p>
        </div>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '109876543210-demo-google-oauth-client-id.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;

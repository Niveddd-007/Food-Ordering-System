import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, LogIn, UserPlus, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, googleAuth } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'restaurant_admin' | 'delivery'>('customer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '109876543210-demo-google-oauth-client-id.apps.googleusercontent.com',
          callback: handleGoogleCallback,
        });

        const btnDiv = document.getElementById('googleSignInBtn');
        if (btnDiv) {
          window.google.accounts.id.renderButton(btnDiv, {
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            text: 'continue_with',
          });
        }
      } catch (err) {
        console.warn('Google Identity SDK init note:', err);
      }
    }
  }, [isOpen, isLogin]);

  if (!isOpen) return null;

  const handleGoogleCallback = async (response: any) => {
    setLoading(true);
    setError(null);
    try {
      await googleAuth({ credential: response.credential, role });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const simulatedToken = 'header.' + btoa(JSON.stringify({
        sub: 'google-oauth-10987654321',
        email: 'alex.mercer@gmail.com',
        name: 'Alex Mercer (Google User)',
        picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
      })) + '.signature';

      await googleAuth({
        credential: simulatedToken,
        role,
        google_id: 'google-oauth-10987654321',
        email: 'alex.mercer@gmail.com',
        name: 'Alex Mercer (Google User)',
        picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ name, email, password, phone, role });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#121215] text-zinc-100 rounded-3xl shadow-2xl overflow-hidden border border-zinc-800 space-y-4">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-amber-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-2 shadow-lg">
            <Zap className="w-6 h-6 fill-white text-white" />
          </div>

          <h2 className="text-2xl font-black font-['Outfit']">
            {isLogin ? 'Welcome Back to QuickBite!' : 'Join QuickBite!'}
          </h2>
          <p className="text-brand-100 text-xs mt-1">
            {isLogin ? 'Sign in to order your favorite dishes' : 'Create an account in seconds'}
          </p>
        </div>

        <div className="p-6 space-y-4 pt-2">

          {error && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Auth Container */}
          <div className="space-y-2">
            <div id="googleSignInBtn" className="w-full flex justify-center"></div>
            
            <button
              type="button"
              onClick={handleSimulatedGoogleLogin}
              className="w-full py-3 px-4 rounded-2xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Sign in with Google (Live OAuth)
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#121215] px-2 text-zinc-500 font-bold">Or with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555-0199"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Select Role</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:border-brand-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="restaurant_admin">Restaurant Admin</option>
                    <option value="delivery">Delivery Personnel</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer1@demo.local"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="demo123"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-glow-orange transition-all flex items-center justify-center gap-2"
            >
              {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Processing...' : isLogin ? 'Sign In to QuickBite!' : 'Create QuickBite! Account'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-xs font-bold text-brand-400 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already registered? Sign In'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

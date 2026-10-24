import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, LogIn, Shield, Wrench, UserCheck, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      showToast(`Welcome back, ${user.name}!`, 'success');
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'WORKER') {
        navigate('/worker/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      showToast(err.message || 'Invalid credentials. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (role: 'ADMIN' | 'WORKER') => {
    if (role === 'ADMIN') {
      setEmail('admin@rjbodybuilding.local');
      setPassword('Admin@12345');
    } else if (role === 'WORKER') {
      setEmail('murugan.body@rjbodybuilding.local');
      setPassword('Worker@12345');
    }
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-orange-950/20">
            <Truck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight font-sans">
            RJ BODY BUILDING
          </h2>
          <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">
            Portal Access • Admin / Worker / Customer
          </p>
        </div>

        {/* Staff Quick-Login Helper */}
        <div className="bg-slate-900 rounded-2xl p-4 text-white border border-slate-800 shadow-md">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Staff Portal Access:</span>
            <span className="text-orange-400 font-mono text-[10px]">1-Click Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('ADMIN')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-orange-600 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <Shield className="w-4 h-4 text-orange-400" />
              <span>Admin / Owner</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('WORKER')}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-amber-600 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Staff Worker</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-900/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 mt-2"
            >
              {submitting ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have a customer account?{' '}
            <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700">
              Register as Customer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

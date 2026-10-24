import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Truck, Menu, X, LogIn, LogOut, LayoutDashboard, Shield, Wrench, UserCheck, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, switchDemoRole, isAdmin, isWorker, isCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Vehicle Categories', path: '/categories' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isWorker) return '/worker/dashboard';
    if (isCustomer) return '/customer/dashboard';
    return '/login';
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Demo Quick Switcher & Workshop Banner */}
      <div className="bg-slate-950 text-xs px-4 py-1.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-200">Vasthanagar, Madurai</span>
          <span className="text-slate-500">|</span>
          <a
            href="tel:6379302952"
            className="text-orange-400 font-bold hover:text-orange-300 flex items-center gap-1 transition-colors"
            title="Call RJ Body Building"
          >
            <Phone className="w-3 h-3" /> +91 63793 02952
          </a>
          <span className="text-slate-500 hidden lg:inline">|</span>
          <span className="text-slate-400 font-medium hidden lg:inline">35 Years Experience (1991–2026)</span>
        </div>

        {/* Staff / Admin Quick Login */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Staff Access:</span>
          <button
            onClick={() => switchDemoRole('ADMIN')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              isAdmin ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Log in as Admin (R. Jayachandran)"
          >
            <Shield className="w-3 h-3" /> Admin
          </button>
          <button
            onClick={() => switchDemoRole('WORKER')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              isWorker ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Log in as Worker (Murugan P. - Body Work)"
          >
            <Wrench className="w-3 h-3" /> Worker
          </button>
          {!user && (
            <Link
              to="/login"
              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" /> Staff Login
            </Link>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-950/40 border border-orange-400/30 group-hover:scale-105 transition-transform">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-wider text-white uppercase font-sans flex items-center gap-2">
                RJ BODY BUILDING
              </div>
              <div className="text-[11px] tracking-wide text-orange-400 uppercase font-semibold">
                Lorry Body Building &amp; Modification Workshop
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-slate-800 text-orange-400'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* CTA & User Controls */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/services"
              className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-orange-900/30 transition-all transform hover:-translate-y-0.5"
            >
              Book / Enquire
            </Link>

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-200 border border-slate-700"
                >
                  <LayoutDashboard className="w-4 h-4 text-orange-400" />
                  <span>Dashboard</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-900 text-orange-400 font-mono">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <LogIn className="w-4 h-4 text-orange-400" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link
              to="/services"
              className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              Book / Enquire
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 text-white"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-orange-400" /> Dashboard
                  </span>
                  <span className="text-xs font-mono uppercase bg-slate-900 px-2 py-0.5 rounded text-orange-400">
                    {user.role}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-slate-800 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" /> Logout ({user.name})
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 text-white font-medium"
              >
                <LogIn className="w-4 h-4 text-orange-400" /> Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

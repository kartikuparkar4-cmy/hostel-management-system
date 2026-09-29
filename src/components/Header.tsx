import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, ShieldCheck, UserCheck, RefreshCw, LayoutDashboard, Globe } from 'lucide-react';
import { api } from '../services/api';

interface HeaderProps {
  activeView: 'landing' | 'portal';
  onViewChange: (view: 'landing' | 'portal') => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onViewChange,
  onRefreshData,
  isRefreshing,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleResetDemo = async () => {
    if (confirm('Reset hostel dataset back to demo defaults? This will restore sample rooms, students, and complaints.')) {
      try {
        await api.resetDemoData();
        if (onRefreshData) onRefreshData();
      } catch (err: any) {
        console.error('Failed to reset data:', err);
      }
    }
  };

  const scrollToSection = (id: string) => {
    onViewChange('landing');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Hosteller Logo matching Screenshot 1 */}
        <button
          onClick={() => onViewChange('landing')}
          className="flex items-center gap-2.5 group focus-visible:outline-none"
        >
          {/* Logo Mark: Square with dual diagonal white cuts */}
          <div className="w-8 h-8 rounded bg-[#1b4d79] flex items-center justify-center text-white shadow-sm overflow-hidden p-1 relative">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-white stroke-[2.5] stroke-linecap-round">
              <path d="M4 18L18 4" />
              <path d="M10 20L20 10" />
            </svg>
          </div>
          <span className="font-bold text-xl sm:text-2xl tracking-tight text-[#1b4d79] dark:text-white font-sans">
            Hosteller
          </span>
        </button>

        {/* Center: Navigation Links (Screenshot 1: Home, About, Rooms, News, Pages, Contacts) */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => scrollToSection('hero')}
            className={`transition-colors hover:text-[#1b4d79] dark:hover:text-white ${
              activeView === 'landing' ? 'text-[#1b4d79] dark:text-white underline underline-offset-8 decoration-2' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('amenities')}
            className="transition-colors hover:text-[#1b4d79] dark:hover:text-white"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('hostel-rooms')}
            className="transition-colors hover:text-[#1b4d79] dark:hover:text-white"
          >
            Rooms
          </button>
          <button
            onClick={() => scrollToSection('reviews')}
            className="transition-colors hover:text-[#1b4d79] dark:hover:text-white"
          >
            Reviews
          </button>
          <button
            onClick={() => scrollToSection('contacts')}
            className="px-3.5 py-1.5 rounded-full bg-[#e8f1f8] dark:bg-slate-800 text-[#1b4d79] dark:text-sky-300 hover:bg-[#d6e7f4] dark:hover:bg-slate-700 transition-colors"
          >
            Contacts
          </button>

          {/* If logged in, show Portal link */}
          {user && (
            <button
              onClick={() => onViewChange(activeView === 'portal' ? 'landing' : 'portal')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeView === 'portal'
                  ? 'bg-[#1b4d79] text-white shadow-sm'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60'
              }`}
            >
              {activeView === 'portal' ? (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public Site</span>
                </>
              ) : (
                <>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{user.role === 'admin' ? 'Warden Console' : 'Resident Portal'}</span>
                </>
              )}
            </button>
          )}
        </nav>

        {/* Right: Actions (Theme Toggle, Refresh, Demo Reset, Login / Logout) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              title="Refresh data"
              aria-label="Refresh data"
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79]"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#1b4d79]' : ''}`} />
            </button>
          )}

          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79]"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Reset Demo Data button */}
          <button
            onClick={handleResetDemo}
            title="Reset demo data"
            className="hidden sm:inline-flex px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79]"
          >
            Reset Demo
          </button>

          {/* Portal / Auth Switch Button */}
          {!user ? (
            <button
              onClick={() => onViewChange('portal')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1b4d79] hover:bg-[#14395a] active:bg-[#0f2c46] rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79]"
            >
              <span>Portal Login</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewChange(activeView === 'portal' ? 'landing' : 'portal')}
                className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-[#1b4d79] text-white"
              >
                {activeView === 'portal' ? 'Website' : 'Portal'}
              </button>

              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

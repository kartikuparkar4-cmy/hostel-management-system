import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { HostellerLanding } from './components/HostellerLanding';
import { AuthCard } from './components/AuthCard';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { api } from './services/api';
import { Room } from './types';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<'landing' | 'portal'>('landing');
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Fetch rooms for public display and inventory counts
  const loadRooms = async () => {
    try {
      if (user?.role === 'admin') {
        const res = await api.getRooms();
        setRooms(res.rooms || []);
      } else {
        const res = await api.getPublicRooms();
        setRooms(res.rooms || []);
      }
    } catch {
      // Fallback demo rooms
      setRooms([
        { _id: '101', number: '101', occupants: [{ _id: '1', name: 'Alex Johnson', email: 'alex@student.edu' }, { _id: '2', name: 'Samantha Lee', email: 'sam@student.edu' }] },
        { _id: '102', number: '102', occupants: [{ _id: '3', name: 'Jordan Miller', email: 'jordan@student.edu' }] },
        { _id: '103', number: '103', occupants: [] },
      ]);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [refreshCounter]);

  // When user logs in, automatically switch to portal view
  useEffect(() => {
    if (user) {
      setActiveView('portal');
    }
  }, [user]);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setRefreshCounter((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1b4d79] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono">Initializing Hosteller Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      <Header
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1">
        {activeView === 'landing' ? (
          <HostellerLanding
            rooms={rooms}
            onOpenPortal={() => setActiveView('portal')}
            isLoggedIn={!!user}
            userRole={user?.role}
            currentUser={user}
            onRefreshData={handleRefreshData}
          />
        ) : !user ? (
          <div className="py-8">
            <AuthCard onBackToWebsite={() => setActiveView('landing')} />
          </div>
        ) : user.role === 'admin' ? (
          <div className="space-y-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex items-center justify-between">
              <button
                onClick={() => setActiveView('landing')}
                className="text-xs font-semibold text-[#1b4d79] dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                ← Back to Hosteller Public Website
              </button>
              <span className="text-xs text-slate-500 font-mono">Warden Management Mode</span>
            </div>
            <AdminDashboard refreshTrigger={refreshCounter} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex items-center justify-between">
              <button
                onClick={() => setActiveView('landing')}
                className="text-xs font-semibold text-[#1b4d79] dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                ← Back to Hosteller Public Website
              </button>
              <span className="text-xs text-slate-500 font-mono">Resident Portal Mode</span>
            </div>
            <StudentDashboard refreshTrigger={refreshCounter} />
          </div>
        )}
      </main>

      {/* Footer matching Hosteller branding */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 py-10 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-[#1b4d79] flex items-center justify-center text-white">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 stroke-white stroke-[2.5] stroke-linecap-round">
                  <path d="M4 18L18 4" />
                  <path d="M10 20L20 10" />
                </svg>
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base">Hosteller</span>
              <span className="text-slate-400">· Premium Student Living & Residence Management</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
              <button onClick={() => setActiveView('landing')} className="hover:text-slate-900 dark:hover:text-white">
                Home
              </button>
              <a href="#hostel-rooms" onClick={() => setActiveView('landing')} className="hover:text-slate-900 dark:hover:text-white">
                Rooms
              </a>
              <a href="#amenities" onClick={() => setActiveView('landing')} className="hover:text-slate-900 dark:hover:text-white">
                Amenities
              </a>
              <a href="#contacts" onClick={() => setActiveView('landing')} className="hover:text-slate-900 dark:hover:text-white">
                Contacts
              </a>
              <button
                onClick={() => setActiveView('portal')}
                className="font-semibold text-[#1b4d79] dark:text-sky-400 hover:underline"
              >
                Resident & Warden Portal
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>© {new Date().getFullYear()} Hosteller. All rights reserved.</span>
            <span className="font-mono">Strict 2-Bed Maximum Capacity Enforced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

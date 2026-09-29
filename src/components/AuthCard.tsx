import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import {
  ShieldCheck,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  KeyRound,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface AuthCardProps {
  onBackToWebsite?: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onBackToWebsite }) => {
  const { login, register, quickLogin } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<Role>('student');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleRoleChange = (newRole: Role) => {
    clearMessages();
    setRole(newRole);
  };

  const handleModeChange = (newMode: 'login' | 'register') => {
    clearMessages();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    // Client-side pre-validation
    if (mode === 'register' && !name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register' && role === 'admin' && !adminCode.trim()) {
      setErrorMsg('Admin registration requires the secret warden authorization code.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password, role);
      } else {
        await register(name.trim(), email.trim(), password, role, adminCode.trim());
        setSuccessMsg('Account registered successfully! Redirecting to portal...');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoEmail: string, demoPass: string, demoRole: Role) => {
    clearMessages();
    setEmail(demoEmail);
    setPassword(demoPass);
    setRole(demoRole);
    setMode('login');
    setLoading(true);
    try {
      await quickLogin(demoEmail, demoPass, demoRole);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-6 sm:my-10 px-4">
      {/* Back button */}
      {onBackToWebsite && (
        <button
          onClick={onBackToWebsite}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#1b4d79] dark:hover:text-sky-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Hosteller Website</span>
        </button>
      )}

      {/* Container Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8">
        {/* Hosteller Logo Mark & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#1b4d79] text-white shadow-sm mb-3">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 stroke-white stroke-[2.5] stroke-linecap-round">
              <path d="M4 18L18 4" />
              <path d="M10 20L20 10" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {mode === 'login' ? 'Hosteller Portal' : 'Create Resident Account'}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login'
              ? 'Sign in to access your room allocation and maintenance tickets'
              : 'Register for room bed allocation or warden management'}
          </p>
        </div>

        {/* Tab switch: Login vs Register */}
        <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 mb-6">
          <button
            type="button"
            onClick={() => handleModeChange('login')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-[#1b4d79] dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('register')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-700 text-[#1b4d79] dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Role Selector */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            Select your portal role
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                role === 'student'
                  ? 'border-[#1b4d79] dark:border-sky-500 bg-[#e8f1f8]/60 dark:bg-sky-950/40 text-[#1b4d79] dark:text-sky-200'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <UserCheck className={`w-4 h-4 ${role === 'student' ? 'text-[#1b4d79] dark:text-sky-400' : 'text-slate-400'}`} />
              <span>Student Resident</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                role === 'admin'
                  ? 'border-[#1b4d79] dark:border-sky-500 bg-[#e8f1f8]/60 dark:bg-sky-950/40 text-[#1b4d79] dark:text-sky-200'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${role === 'admin' ? 'text-[#1b4d79] dark:text-sky-400' : 'text-slate-400'}`} />
              <span>Warden / Admin</span>
            </button>
          </div>
        </div>

        {/* Inline Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div className="flex-1 leading-relaxed">{successMsg}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder={role === 'admin' ? 'warden@hostel.edu' : 'student@hostel.edu'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Password <span className="text-slate-400 font-normal">(min 6 characters)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79] transition-colors"
              />
            </div>
          </div>

          {/* Admin registration secret code */}
          {mode === 'register' && role === 'admin' && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Admin registration code
                </label>
                <span className="text-[11px] text-amber-700 dark:text-amber-300 font-mono">
                  Default: warden123
                </span>
              </div>
              <input
                type="password"
                required
                placeholder="Enter secret warden code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#1b4d79] hover:bg-[#14395a] active:bg-[#0f2c46] rounded-lg shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79] disabled:opacity-50"
          >
            {loading
              ? 'Processing...'
              : mode === 'login'
              ? `Sign in as ${role === 'admin' ? 'Warden / Admin' : 'Resident Student'}`
              : `Create ${role === 'admin' ? 'Warden' : 'Student'} Account`}
          </button>
        </form>

        {/* Demo Fast Logins Section */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1b4d79] dark:text-sky-400" />
              1-Click Demo Logins
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Pre-seeded</span>
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleDemoClick('warden@hostel.edu', 'warden123', 'admin')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-[#e8f1f8]/40 dark:hover:bg-slate-800/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79]"
            >
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Dr. Arthur Vance</span>
                <span className="text-slate-500 text-[11px] ml-1.5">Warden (Admin)</span>
              </div>
              <span className="text-[#1b4d79] dark:text-sky-400 font-mono text-[11px]">warden123</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('alex@student.edu', 'student123', 'student')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-[#e8f1f8]/40 dark:hover:bg-slate-800/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79]"
            >
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Alex Johnson</span>
                <span className="text-slate-500 text-[11px] ml-1.5">Resident (Room 101)</span>
              </div>
              <span className="text-[#1b4d79] dark:text-sky-400 font-mono text-[11px]">student123</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('rohan@student.edu', 'student123', 'student')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-[#e8f1f8]/40 dark:hover:bg-slate-800/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4d79]"
            >
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Rohan Sharma</span>
                <span className="text-amber-600 dark:text-amber-400 text-[11px] ml-1.5">Unallocated Student</span>
              </div>
              <span className="text-[#1b4d79] dark:text-sky-400 font-mono text-[11px]">student123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

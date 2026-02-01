
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Activity, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

interface LoginProps {
  onSwitchToRegister: () => void;
  onVerificationRequired: (email: string) => void;
  onForgotPassword: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onVerificationRequired, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (!user.emailVerified) {
        const userEmail = user.email || email;
        await signOut(auth); // Do not allow session if not verified
        onVerificationRequired(userEmail);
        return;
      }
      
      // On success, App.tsx will pick up the auth state change
    } catch (err: any) {
      console.error(err);
      setError("Password or Email Incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-600/20">
            <Activity className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CheXNet AI Access</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Clinical Diagnostic Gateway</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="text-red-600 dark:text-red-400 shrink-0" size={18} />
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.org"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                <button 
                  type="button"
                  onClick={() => onForgotPassword(email)}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Sign In to Laboratory"}
          </button>

          <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              New clinician?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Create Account
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

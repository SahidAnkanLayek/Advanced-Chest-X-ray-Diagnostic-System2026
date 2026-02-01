
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Activity, Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface ForgotPasswordProps {
  initialEmail: string;
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ initialEmail, onBackToLogin }) => {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError("Account not found with this email.");
      } else {
        setError("Failed to send reset link. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-10 text-center animate-in zoom-in-95 duration-500">
          <div className="inline-flex bg-green-500 p-4 rounded-full mb-6">
            <CheckCircle2 className="text-white" size={48} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check Your Email</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">We sent you a password change link to <span className="font-bold text-slate-900 dark:text-white">{email}</span>.</p>
          
          <button
            onClick={onBackToLogin}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-600/20">
            <Activity className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recover Password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleReset} className="p-8 space-y-6">
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Get Reset Link"}
          </button>

          <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-sm text-slate-500 dark:text-slate-400 font-medium hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft size={16} /> Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

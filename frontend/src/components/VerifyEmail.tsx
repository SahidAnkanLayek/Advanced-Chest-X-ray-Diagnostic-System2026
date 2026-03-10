
import React from 'react';
import { Mail, ArrowRight, Activity } from 'lucide-react';

interface VerifyEmailProps {
  email: string;
  onGoToLogin: () => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ email, onGoToLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-600/20">
            <Activity className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verify Your Identity</h1>
        </div>

        <div className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Mail size={40} className="animate-bounce" />
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              We have sent you a verification email to <span className="font-bold text-slate-900 dark:text-white">{email}</span>.
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Please verify your email and then log in.
            </p>
          </div>

          <button
            onClick={onGoToLogin}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            Go to Login <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;


import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  FileSearch, 
  History, 
  Settings as SettingsIcon,
  ChevronRight,
  User,
  Bell,
  Moon,
  Sun,
  ShieldAlert,
  Clock,
  MessageSquare,
  Book,
  Terminal,
  X
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import XRayLab from './components/XRayLab';
import ReportsHistory from './components/ReportsHistory';
import LiveHelpDesk from './components/LiveHelpDesk';
import { AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.ANALYZE);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isLiveHelpOpen, setIsLiveHelpOpen] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const notificationRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (supportRef.current && !supportRef.current.contains(event.target as Node)) {
        setIsSupportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return <Dashboard />;
      case AppTab.ANALYZE:
        return <XRayLab />;
      case AppTab.REPORTS:
        return <ReportsHistory />;
      case AppTab.SETTINGS:
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold dark:text-white text-slate-900">System Settings</h1>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-semibold dark:text-white text-slate-900">Appearance</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Customize how CheXNet-AI looks on your screen.</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium dark:text-white text-slate-900">Display Theme</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark modes.</p>
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      <Sun size={14} /> Light
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      <Moon size={14} /> Dark
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between opacity-50 cursor-not-allowed">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium dark:text-white text-slate-900">High Contrast Mode</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Increase visibility for critical reviews.</p>
                  </div>
                  <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-slate-400 rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
               <SettingsIcon size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
               <p className="text-sm text-slate-500 dark:text-slate-400">More configuration options (Network, API, PACS Integration) are available in the Enterprise Dashboard.</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">CheXNet<span className="text-blue-500">AI</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === AppTab.DASHBOARD}
            onClick={() => setActiveTab(AppTab.DASHBOARD)}
          />
          <SidebarItem 
            icon={<FileSearch size={20} />} 
            label="New Analysis" 
            active={activeTab === AppTab.ANALYZE}
            onClick={() => setActiveTab(AppTab.ANALYZE)}
          />
          <SidebarItem 
            icon={<History size={20} />} 
            label="Report History" 
            active={activeTab === AppTab.REPORTS}
            onClick={() => setActiveTab(AppTab.REPORTS)}
          />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <SidebarItem 
            icon={<SettingsIcon size={20} />} 
            label="Settings" 
            active={activeTab === AppTab.SETTINGS}
            onClick={() => setActiveTab(AppTab.SETTINGS)}
          />
          <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">DR</div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Dr. Smith</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Radiology Dept.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-30 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
            <span>Diagnostics</span>
            <ChevronRight size={14} />
            <span className="text-slate-700 dark:text-slate-200 capitalize font-semibold tracking-tight">
              {activeTab === AppTab.SETTINGS ? 'Settings' : activeTab.toLowerCase().replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 rounded-lg transition-all relative ${isNotificationsOpen ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h4 className="font-bold text-sm">Notifications</h4>
                    <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase">3 New</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <NotificationItem 
                      icon={<ShieldAlert className="text-red-500" size={16} />} 
                      title="Urgent: High Probability Finding" 
                      desc="Case PT-882192: Confidence score 96.0% for Cardiomegaly."
                      time="12m ago"
                    />
                    <NotificationItem 
                      icon={<Clock className="text-blue-500" size={16} />} 
                      title="Analysis Complete" 
                      desc="Report for 23049_source.png is ready for review."
                      time="1h ago"
                    />
                    <NotificationItem 
                      icon={<Terminal className="text-slate-400" size={16} />} 
                      title="System Update" 
                      desc="Neural weights updated to CheXNet-v2.4.1 (Stable)."
                      time="4h ago"
                    />
                  </div>
                  <button className="w-full py-3 text-xs text-blue-600 dark:text-blue-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-t border-slate-100 dark:border-slate-800">
                    View All Diagnostics
                  </button>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-3"></div>
            
            <div className="relative" ref={supportRef}>
              <button 
                onClick={() => setIsSupportOpen(!isSupportOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${isSupportOpen ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium'}`}
              >
                <User size={18} />
                <span>Support</span>
              </button>

              {isSupportOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 mb-1">Support Hub</div>
                  <SupportItem 
                    icon={<MessageSquare size={16} />} 
                    label="Live Help Desk" 
                    sub="24/7 Clinical Support" 
                    onClick={() => { setIsSupportOpen(false); setIsLiveHelpOpen(true); }}
                  />
                  <SupportItem icon={<Book size={16} />} label="Documentation" sub="API Reference & Guides" onClick={() => {}} />
                  <SupportItem icon={<Terminal size={16} />} label="PACS Test" sub="Verify DICOM Connection" onClick={() => {}} />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-8 transition-colors duration-300">
          {renderContent()}
        </div>

        {/* Live Help Desk Overlay */}
        {isLiveHelpOpen && <LiveHelpDesk onClose={() => setIsLiveHelpOpen(false)} />}
      </main>
    </div>
  );
};

const NotificationItem: React.FC<{ icon: React.ReactNode; title: string; desc: string; time: string }> = ({ icon, title, desc, time }) => (
  <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800/50 last:border-0">
    <div className="flex gap-3">
      <div className="mt-1">{icon}</div>
      <div className="space-y-1">
        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{title}</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{desc}</p>
        <p className="text-[9px] text-slate-400 dark:text-slate-600 font-medium">{time}</p>
      </div>
    </div>
  </div>
);

const SupportItem: React.FC<{ icon: React.ReactNode; label: string; sub: string; onClick: () => void }> = ({ icon, label, sub, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group"
  >
    <div className="text-slate-400 dark:text-slate-600 group-hover:text-blue-500 transition-colors">{icon}</div>
    <div className="flex-1">
      <p className="text-xs font-bold text-slate-900 dark:text-white">{label}</p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400">{sub}</p>
    </div>
  </button>
);

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default App;


// import React, { useMemo } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
// import { ShieldCheck, Zap, AlertTriangle, FileText, Activity } from 'lucide-react';
// import { getHistory } from '../services/api';

// const Dashboard: React.FC = () => {
//   const history = useMemo(() => getHistory(), []);

//   const stats = useMemo(() => {
//     const totalScans = history.length;
//     let criticalFinds = 0;
//     const distribution: Record<string, number> = {};

//     history.forEach(report => {
//       const topPred = [...report.predictions].sort((a, b) => b.probability - a.probability)[0];
//       if (topPred && topPred.probability > 0.5) {
//         criticalFinds++;
//         distribution[topPred.label] = (distribution[topPred.label] || 0) + 1;
//       }
//     });

//     const chartData = Object.entries(distribution).map(([name, count]) => ({
//       name: name.replace('_', ' '),
//       count,
//       color: '#3b82f6'
//     })).sort((a, b) => b.count - a.count).slice(0, 5);

//     return { totalScans, criticalFinds, chartData };
//   }, [history]);

//   if (history.length === 0) {
//     return (
//       <div className="max-w-6xl mx-auto h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
//         <div className="p-6 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-xl">
//           <Activity size={48} className="text-blue-500 opacity-50" />
//         </div>
//         <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No Diagnostic Data Yet</h2>
//         <p className="text-slate-500 max-w-sm">
//           Run your first chest X-ray analysis to populate the hospital analytics dashboard with real-time insights.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Hospital Analytics</h1>
//           <p className="text-slate-500 dark:text-slate-400">Live radiological overview from user-performed scans</p>
//         </div>
//         <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-lg text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-2">
//           <ShieldCheck size={16} />
//           System Active: v2.4.1 (Stable)
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <StatCard 
//           icon={<Zap className="text-yellow-600 dark:text-yellow-400" />} 
//           label="User Scans" 
//           value={stats.totalScans.toString()} 
//           trend="Current Session Total" 
//         />
//         <StatCard 
//           icon={<AlertTriangle className="text-red-600 dark:text-red-400" />} 
//           label="Pathology Found" 
//           value={stats.criticalFinds.toString()} 
//           trend="Confidence > 50%" 
//           urgent={stats.criticalFinds > 0}
//         />
//         <StatCard 
//           icon={<ShieldCheck className="text-green-600 dark:text-green-400" />} 
//           label="AI Sensitivity" 
//           value="94.2%" 
//           trend="CheXNet Baseline" 
//         />
//         <StatCard 
//           icon={<FileText className="text-blue-600 dark:text-blue-400" />} 
//           label="Archived" 
//           value={stats.totalScans.toString()} 
//           trend="Saved to local database" 
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
//           <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Discovery Frequency</h2>
//           <div className="h-[300px] w-full">
//             {stats.chartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={stats.chartData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:hidden" />
//                   <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} className="hidden dark:block" />
//                   <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
//                   <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
//                   <Tooltip 
//                     cursor={{ fill: '#f1f5f9' }} 
//                     contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
//                     itemStyle={{ color: '#1e293b' }}
//                   />
//                   <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="h-full flex items-center justify-center text-slate-400 text-sm">
//                 Insufficient multi-class data for visualization
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
//           <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Recent Alerts</h2>
//           <div className="space-y-4">
//             {history.slice(0, 5).map((rep) => {
//                const top = [...rep.predictions].sort((a,b) => b.probability - a.probability)[0];
//                return (
//                 <div key={rep.reportId} className="p-3 border-l-4 border-blue-500 bg-slate-50 dark:bg-slate-800/50 rounded-r-lg flex justify-between items-center shadow-sm dark:shadow-none">
//                   <div>
//                     <p className="text-sm font-medium text-slate-900 dark:text-white">{rep.fileName}</p>
//                     <p className="text-xs text-slate-500 dark:text-slate-400">{top.label.replace('_', ' ')} ({(top.probability * 100).toFixed(0)}%)</p>
//                   </div>
//                 </div>
//                );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// interface StatCardProps {
//   icon: React.ReactNode;
//   label: string;
//   value: string;
//   trend: string;
//   urgent?: boolean;
// }

// const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, urgent }) => (
//   <div className={`bg-white dark:bg-slate-900/50 border ${urgent ? 'border-red-500/30 ring-1 ring-red-500/10' : 'border-slate-200 dark:border-slate-800'} p-6 rounded-2xl shadow-sm`}>
//     <div className="flex items-center gap-3 mb-4">
//       <div className={`p-2 rounded-lg ${urgent ? 'bg-red-500/10' : 'bg-slate-100 dark:bg-slate-800'}`}>{icon}</div>
//       <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</span>
//     </div>
//     <div className="flex flex-col">
//       <span className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</span>
//       <span className={`text-xs ${urgent ? 'text-red-500 dark:text-red-400' : 'text-slate-500'}`}>{trend}</span>
//     </div>
//   </div>
// );

//  export default Dashboard;

import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  ShieldCheck,
  Zap,
  AlertTriangle,
  FileText,
  Activity
} from 'lucide-react';
import { getHistory } from '../services/api';

interface Prediction {
  label: string;
  probability: number;
}

interface Report {
  reportId: string;
  fileName: string;
  predictions: Prediction[];
}

const Dashboard: React.FC = () => {
  const [history, setHistory] = useState<Report[]>([]);

  // ✅ Load history SAFELY using useEffect
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getHistory();
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load history:', error);
        setHistory([]);
      }
    };

    loadHistory();
  }, []);

  // ✅ Compute stats only after data is available
  const stats = useMemo(() => {
    const totalScans = history.length;
    let criticalFinds = 0;
    const distribution: Record<string, number> = {};

    history.forEach((report) => {
      if (!report.predictions || report.predictions.length === 0) return;

      const topPred = [...report.predictions].sort(
        (a, b) => b.probability - a.probability
      )[0];

      if (topPred && topPred.probability > 0.5) {
        criticalFinds++;
        distribution[topPred.label] =
          (distribution[topPred.label] || 0) + 1;
      }
    });

    const chartData = Object.entries(distribution)
      .map(([name, count]) => ({
        name: name.replace('_', ' '),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { totalScans, criticalFinds, chartData };
  }, [history]);

  // ✅ Empty state (NO crash)
  if (history.length === 0) {
    return (
      <div className="max-w-6xl mx-auto h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-xl">
          <Activity size={48} className="text-blue-500 opacity-50" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          No Diagnostic Data Yet
        </h2>
        <p className="text-slate-500 max-w-sm">
          Run your first chest X-ray analysis to populate the hospital analytics
          dashboard with real-time insights.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Hospital Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Live radiological overview from user-performed scans
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-lg text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-2">
          <ShieldCheck size={16} />
          System Active: v2.4.1 (Stable)
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Zap className="text-yellow-600 dark:text-yellow-400" />}
          label="User Scans"
          value={stats.totalScans.toString()}
          trend="Current Session Total"
        />
        <StatCard
          icon={<AlertTriangle className="text-red-600 dark:text-red-400" />}
          label="Pathology Found"
          value={stats.criticalFinds.toString()}
          trend="Confidence > 50%"
          urgent={stats.criticalFinds > 0}
        />
        <StatCard
          icon={<ShieldCheck className="text-green-600 dark:text-green-400" />}
          label="AI Sensitivity"
          value="94.2%"
          trend="CheXNet Baseline"
        />
        <StatCard
          icon={<FileText className="text-blue-600 dark:text-blue-400" />}
          label="Archived"
          value={stats.totalScans.toString()}
          trend="Saved to local database"
        />
      </div>

      {/* Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Discovery Frequency
          </h2>
          <div className="h-[300px] w-full">
            {stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} />
                  <YAxis fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Insufficient multi-class data for visualization
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Recent Alerts
          </h2>
          <div className="space-y-4">
            {history.slice(0, 5).map((rep) => {
              if (!rep.predictions?.length) return null;

              const top = [...rep.predictions].sort(
                (a, b) => b.probability - a.probability
              )[0];

              return (
                <div
                  key={rep.reportId}
                  className="p-3 border-l-4 border-blue-500 bg-slate-50 dark:bg-slate-800/50 rounded-r-lg"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {rep.fileName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {top.label.replace('_', ' ')} (
                    {(top.probability * 100).toFixed(0)}%)
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  urgent?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  urgent
}) => (
  <div
    className={`bg-white dark:bg-slate-900/50 border ${
      urgent
        ? 'border-red-500/30 ring-1 ring-red-500/10'
        : 'border-slate-200 dark:border-slate-800'
    } p-6 rounded-2xl shadow-sm`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div
        className={`p-2 rounded-lg ${
          urgent ? 'bg-red-500/10' : 'bg-slate-100 dark:bg-slate-800'
        }`}
      >
        {icon}
      </div>
      <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">
        {label}
      </span>
    </div>
    <span className="text-2xl font-bold text-slate-900 dark:text-white">
      {value}
    </span>
    <p
      className={`text-xs ${
        urgent ? 'text-red-500 dark:text-red-400' : 'text-slate-500'
      }`}
    >
      {trend}
    </p>
  </div>
);

export default Dashboard;


import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, FileText, Download, X, Calendar as CalendarIcon, ChevronDown, Trash2 } from 'lucide-react';
import { CLASS_NAMES, AnalysisResult } from '../types';
import { getHistory, downloadReport } from '../services/api';

const ReportsHistory: React.FC = () => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [diagnosisFilter, setDiagnosisFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const filteredReports = useMemo(() => {
    return history.filter((report) => {
      const matchesSearch = 
        report.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        report.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const topPred = [...report.predictions].sort((a,b) => b.probability - a.probability)[0];
      const matchesDiagnosis = diagnosisFilter === 'All' || topPred.label === diagnosisFilter;

      return matchesSearch && matchesDiagnosis;
    });
  }, [searchTerm, diagnosisFilter, history]);

  const clearFilters = () => {
    setSearchTerm('');
    setDiagnosisFilter('All');
  };

  const clearHistory = () => {
    if (confirm("Permanently clear all analysis history?")) {
      localStorage.removeItem('chexnet_history');
      setHistory([]);
    }
  };

  const handleDownload = (rep: AnalysisResult) => {
    downloadReport(rep, rep.heatmapUrl, rep.patient);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clinical Report Archive</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">History of user-initiated radiological analyses</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search file name or patient..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-colors ${showFilters ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 shadow-sm'}`}
          >
            <Filter size={18} />
          </button>
          <button 
            onClick={clearHistory}
            className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm"
            title="Clear History"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl animate-in slide-in-from-top-2 shadow-sm">
          <div className="w-full max-w-xs space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Primary Finding Filter</label>
            <div className="relative">
              <select 
                value={diagnosisFilter}
                onChange={(e) => setDiagnosisFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none appearance-none"
              >
                <option value="All">All Diagnoses</option>
                {CLASS_NAMES.map(name => (
                  <option key={name} value={name}>{name.replace('_', ' ')}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden min-h-[300px] shadow-sm">
        {filteredReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">File / Patient</th>
                  <th className="px-6 py-4">Report ID</th>
                  <th className="px-6 py-4">Primary Finding</th>
                  <th className="px-6 py-4 text-center">Confidence</th>
                  <th className="px-6 py-4 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReports.map((rep) => {
                  const top = [...rep.predictions].sort((a,b) => b.probability - a.probability)[0];
                  return (
                    <tr key={rep.reportId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                           <span className="font-medium text-slate-900 dark:text-white">{rep.fileName}</span>
                           <span className="text-[10px] text-slate-400 dark:text-slate-500">{rep.patient?.name || 'Unknown Patient'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 dark:text-slate-500 font-mono text-xs">{rep.reportId}</td>
                      <td className="px-6 py-4 capitalize text-slate-700 dark:text-slate-300">{top.label.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${top.probability > 0.5 ? 'bg-red-500/10 text-red-600 dark:text-red-500' : 'bg-blue-500/10 text-blue-600 dark:text-blue-500'}`}>
                          {(top.probability * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDownload(rep)} 
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-white transition-colors"
                        >
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="text-slate-200 dark:text-slate-700 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400">No historical analyses found matching current criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsHistory;
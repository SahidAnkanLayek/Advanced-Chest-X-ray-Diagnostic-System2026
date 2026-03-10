
import React from 'react';
import { Prediction } from '../types';

interface PredictionListProps {
  predictions: Prediction[];
}

const PredictionList: React.FC<PredictionListProps> = ({ predictions }) => {
  const sorted = [...predictions].sort((a, b) => b.probability - a.probability);

  return (
    <div className="space-y-4">
      {sorted.map((pred) => {
        const percentage = Math.round(pred.probability * 100);
        let colorClass = "bg-slate-400 dark:bg-slate-700";
        let textClass = "text-slate-500 dark:text-slate-400";
        
        if (percentage > 70) {
          colorClass = "bg-red-500 shadow-red-500/20";
          textClass = "text-red-600 dark:text-red-400";
        } else if (percentage > 40) {
          colorClass = "bg-amber-500 shadow-amber-500/20";
          textClass = "text-amber-600 dark:text-amber-400";
        } else if (percentage > 15) {
          colorClass = "bg-blue-500 shadow-blue-500/20";
          textClass = "text-blue-600 dark:text-blue-400";
        }

        return (
          <div key={pred.label} className="group cursor-default">
            <div className="flex justify-between items-end mb-1.5">
              <span className={`text-sm font-semibold tracking-wide ${percentage > 50 ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                {pred.label.replace('_', ' ')}
              </span>
              <span className={`text-xs font-mono font-bold ${textClass}`}>
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${colorClass}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PredictionList;
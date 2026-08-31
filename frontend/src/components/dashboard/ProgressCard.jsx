import React from 'react';

export default function ProgressCard({ percentage = 0 }) {
  return (
    <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
      <h3 className="text-slate-500 text-sm font-medium mb-2">Overall Progress</h3>
      <div className="flex items-end justify-between mb-3">
        <span className="text-3xl font-bold text-slate-900">{percentage}%</span>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">On Track</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
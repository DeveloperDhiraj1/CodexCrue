import React from 'react';

export default function StatsCard({ title, value, unit }) {
  return (
    <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <div className="flex items-baseline space-x-1">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        {unit && <span className="text-xs text-slate-400 font-semibold">{unit}</span>}
      </div>
    </div>
  );
}
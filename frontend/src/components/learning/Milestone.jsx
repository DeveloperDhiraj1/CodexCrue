import React from 'react';

export default function Milestone({ phase, title, description, status }) {
  return (
    <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Phase {phase}</span>
        <span className="text-xs font-semibold text-slate-500 uppercase">{status}</span>
      </div>
      <h4 className="font-bold text-slate-900 text-lg mb-1">{title}</h4>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}
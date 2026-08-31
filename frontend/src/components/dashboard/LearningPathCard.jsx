import React from 'react';

export default function LearningPathCard({ goal, duration, activePhase }) {
  return (
    <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">Current Path</span>
        <span className="text-xs text-slate-500 font-medium">{duration || '3 Months'}</span>
      </div>
      <h4 className="font-bold text-slate-900 text-lg">{goal || 'Full Stack Developer'}</h4>
      <p className="text-xs text-emerald-600 font-semibold">Active: Phase {activePhase || 2}</p>
    </div>
  );
}
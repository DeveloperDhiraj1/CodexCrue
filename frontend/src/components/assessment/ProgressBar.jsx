import React from 'react';

export default function ProgressBar({ current, total }) {
  const percentage = Math.round((current / total) * 100);
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
      <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
    </div>
  );
}
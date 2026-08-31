import React from 'react';

export default function PrerequisiteGraph({ skills }) {
  return (
    <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
      <h4 className="font-bold text-slate-900 mb-3 text-sm">Dependency Skill Map</h4>
      <div className="flex flex-wrap gap-2">
        {skills?.map((s, i) => (
          <span key={i} className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-xl font-medium border border-slate-200">
            {s} ➔
          </span>
        ))}
      </div>
    </div>
  );
}
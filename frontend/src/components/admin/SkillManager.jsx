import React from 'react';

export default function SkillManager({ skills }) {
  return (
    <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm">
      <h4 className="font-bold text-slate-900 mb-4">Platform Skill Inventory</h4>
      <div className="flex flex-wrap gap-2">
        {skills?.map((s, i) => (
          <span key={i} className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-200">
            {s} ✕
          </span>
        ))}
      </div>
    </div>
  );
}
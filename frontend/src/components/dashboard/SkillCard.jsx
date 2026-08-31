import React from 'react';

export default function SkillCard({ skillName, level }) {
  return (
    <div className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
      <span className="font-bold text-slate-900 text-sm">{skillName}</span>
      <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-xl border border-emerald-200">
        {level || 'Proficient'}
      </span>
    </div>
  );
}
import React from 'react';

export default function SkillGapChart({ matched = 70, missing = 30 }) {
  return (
    <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm space-y-4">
      <h3 className="font-bold text-slate-900 text-base">Competency Breakdown</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
            <span>Matched Skills</span>
            <span>{matched}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${matched}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
            <span>Missing Gaps</span>
            <span>{missing}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${missing}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
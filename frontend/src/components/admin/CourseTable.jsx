import React from 'react';

export default function CourseTable({ courses }) {
  return (
    <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
            <th className="p-4">Title</th>
            <th className="p-4">Difficulty</th>
            <th className="p-4">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {courses?.map((c, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <td className="p-4 font-semibold text-slate-900">{c.title}</td>
              <td className="p-4 text-emerald-600">{c.difficulty}</td>
              <td className="p-4 text-slate-600">{c.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
import React from 'react';

export default function CourseCard({ title, description, difficulty, duration }) {
  return (
    <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-all">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">{difficulty || 'Intermediate'}</span>
          <span className="text-xs text-slate-400 font-medium">{duration || '4 Weeks'}</span>
        </div>
        <h4 className="font-bold text-slate-900 text-lg mb-2">{title}</h4>
        <p className="text-slate-600 text-sm mb-4 leading-relaxed">{description}</p>
      </div>
      <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20">
        Start Module
      </button>
    </div>
  );
}
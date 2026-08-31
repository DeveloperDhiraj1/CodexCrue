import React from 'react';

export default function QuizCard({ question, options, onSelect }) {
  return (
    <div className="bg-white border border-emerald-100 p-6 rounded-2xl shadow-sm space-y-4">
      <h4 className="font-bold text-slate-900 text-base">{question}</h4>
      <div className="space-y-2">
        {options?.map((opt, i) => (
          <button 
            key={i} 
            onClick={() => onSelect(opt)}
            className="w-full text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500 border border-slate-200 p-3 rounded-xl text-sm font-medium transition-all"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
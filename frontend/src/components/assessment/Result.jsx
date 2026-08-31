import React from 'react';

export default function Result({ score, passed }) {
  return (
    <div className={`p-6 rounded-2xl text-center border ${passed ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
      <h3 className="text-2xl font-black mb-1">{passed ? 'Assessment Passed! 🎉' : 'Needs Improvement'}</h3>
      <p className="text-sm font-semibold">Your Score: {score}%</p>
    </div>
  );
}
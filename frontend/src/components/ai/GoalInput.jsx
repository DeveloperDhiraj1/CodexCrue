import React, { useState } from 'react';

export default function GoalInput({ onSubmit }) {
  const [goal, setGoal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (goal.trim()) {
      onSubmit(goal);
      setGoal('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-emerald-100 p-6 rounded-3xl shadow-sm flex gap-4 items-center">
      <input 
        type="text" 
        value={goal} 
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Enter your target career goal (e.g., Full Stack Developer, AI Engineer)..."
        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
      />
      <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md shadow-emerald-500/20">
        Set Goal
      </button>
    </form>
  );
}
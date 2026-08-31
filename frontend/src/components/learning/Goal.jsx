import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';

export default function Goal() {
  const [goal, setGoal] = useState('Full Stack Developer');
  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 space-y-6">
          <div className="bg-white border border-emerald-100 p-8 rounded-3xl shadow-sm max-w-xl">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Manage Career Goal</h2>
            <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm mt-4">
              <option>Full Stack Developer</option>
              <option>AI Engineer</option>
              <option>Data Scientist</option>
            </select>
          </div>
        </main>
      </div>
    </div>
  );
}
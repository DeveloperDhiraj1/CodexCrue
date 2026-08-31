import React from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';

export default function CourseDetails() {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="bg-white border border-emerald-100 p-8 rounded-3xl shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">Course Details & Syllabus</h2>
          </div>
        </main>
      </div>
    </div>
  );
}
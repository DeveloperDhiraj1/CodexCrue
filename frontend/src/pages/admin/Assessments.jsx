import React from 'react';
import Navbar from '../../components/common/Navbar';

export default function AdminAssessments() {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <Navbar />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-black text-slate-900">Global Assessments & Quizzes Manager</h2>
      </div>
    </div>
  );
}
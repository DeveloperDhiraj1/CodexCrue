import React from 'react';
import Navbar from '../../components/common/Navbar';
import RecommendationAnalytics from '../../components/admin/RecommendationAnalytics';

export default function AdminRecommendations() {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <Navbar />
      <div className="flex-1 p-8 space-y-6">
        <h2 className="text-2xl font-black text-slate-900">Recommendation Engine Oversight</h2>
        <RecommendationAnalytics />
      </div>
    </div>
  );
}
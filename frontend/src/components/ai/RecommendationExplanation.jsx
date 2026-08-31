import React from 'react';

export default function RecommendationExplanation({ rationale }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-800">
      <span className="font-bold">AI Rationale: </span> {rationale || 'Selected based on your missing dependency graph and target career milestones.'}
    </div>
  );
}
import React from 'react';

export default function ChatMessage({ sender, content }) {
  const isAI = sender === 'ai';
  return (
    <div className={`p-4 rounded-2xl max-w-lg text-sm ${isAI ? 'bg-emerald-50 text-slate-800 border border-emerald-100' : 'bg-emerald-500 text-white ml-auto'}`}>
      {content}
    </div>
  );
}
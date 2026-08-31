import React from 'react';

export default function ChatWindow({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
      <div className="bg-emerald-50 text-slate-800 p-4 rounded-2xl max-w-lg text-sm border border-emerald-100">
        Hello! I am your CortexCrew AI Mentor. Ask me anything about your learning path, missing skill gaps, or course doubts.
      </div>
      {messages.map((msg, index) => (
        <div 
          key={index} 
          className={`p-4 rounded-2xl max-w-lg text-sm ${msg.sender === 'ai' ? 'bg-emerald-50 text-slate-800 border border-emerald-100' : 'bg-emerald-500 text-white ml-auto'}`}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
}
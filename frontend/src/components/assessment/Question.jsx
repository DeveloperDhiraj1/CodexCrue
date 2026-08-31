import React from 'react';

export default function Question({ number, text }) {
  return (
    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
      Question {number}: {text}
    </div>
  );
}
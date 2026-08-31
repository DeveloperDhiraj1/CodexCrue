import React from 'react';
export default function Toast({ message, tone='success', onClose }) { if (!message) return null; return <div className={`ui-toast ui-toast-${tone}`} role="status">{message}<button onClick={onClose} aria-label="Dismiss">×</button></div>; }

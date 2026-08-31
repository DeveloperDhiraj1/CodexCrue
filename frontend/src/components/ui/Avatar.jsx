import React from 'react';
export default function Avatar({ name='', src, size='md' }) { return <span className={`ui-avatar ui-avatar-${size}`}>{src ? <img src={src} alt={`${name} avatar`} /> : name.slice(0,1).toUpperCase() || '?'}</span>; }

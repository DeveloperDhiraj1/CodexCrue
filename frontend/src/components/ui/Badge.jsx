import React from 'react';
export default function Badge({ tone='neutral', children }) { return <span className={`ui-badge ui-badge-${tone}`}>{children}</span>; }

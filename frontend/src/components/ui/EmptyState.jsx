import React from 'react';
export default function EmptyState({ title, description, action }) { return <div className="ui-state"><strong>{title}</strong><p>{description}</p>{action}</div>; }

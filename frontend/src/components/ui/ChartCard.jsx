import React from 'react';
import Card from './Card';
export default function ChartCard({ title, description, children }) { return <Card><div className="ui-card-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div></div>{children}</Card>; }

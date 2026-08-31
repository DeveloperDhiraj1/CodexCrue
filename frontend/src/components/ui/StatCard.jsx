import React from 'react';
import Card from './Card';
export default function StatCard({ label, value, note }) { return <Card className="ui-stat-card"><span className="ui-stat-label">{label}</span><strong className="ui-stat-value">{value}</strong>{note && <span className="ui-stat-note">{note}</span>}</Card>; }

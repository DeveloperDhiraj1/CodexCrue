import React from 'react';
export default function Progress({ value=0, label, className='' }) { return <div className={`ui-progress-wrap ${className}`}>{label && <div className="ui-progress-label"><span>{label}</span><strong>{value}%</strong></div>}<div className="ui-progress"><span style={{width:`${Math.max(0,Math.min(100,value))}%`}} /></div></div>; }

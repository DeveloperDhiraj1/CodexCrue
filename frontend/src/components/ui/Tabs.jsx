import React from 'react';
export default function Tabs({ items, active, onChange }) { return <div className="ui-tabs" role="tablist">{items.map((item) => <button key={item.value} className={active===item.value?'active':''} role="tab" aria-selected={active===item.value} onClick={() => onChange(item.value)}>{item.label}</button>)}</div>; }

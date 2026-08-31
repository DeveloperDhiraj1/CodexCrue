import React from 'react';
export default function Select({ label, children, ...props }) { return <label className="ui-field">{label && <span className="ui-label">{label}</span>}<select className="ui-input" {...props}>{children}</select></label>; }

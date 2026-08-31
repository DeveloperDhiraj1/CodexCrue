import React from 'react';
export default function Tooltip({ label, children }) { return <span className="ui-tooltip" data-tooltip={label}>{children}</span>; }

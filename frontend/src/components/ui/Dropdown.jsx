import React from 'react';
export default function Dropdown({ label, children }) { return <details className="ui-dropdown"><summary>{label}</summary><div className="ui-dropdown-menu">{children}</div></details>; }

import React from 'react';
export default function Textarea({ label, ...props }) { return <label className="ui-field">{label && <span className="ui-label">{label}</span>}<textarea className="ui-input ui-textarea" {...props} /></label>; }

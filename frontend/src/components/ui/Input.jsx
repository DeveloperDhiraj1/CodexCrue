import React from 'react';
export default function Input({ label, error, id, ...props }) { return <label className="ui-field">{label && <span className="ui-label">{label}</span>}<input id={id} className={`ui-input ${error?'ui-input-error':''}`} {...props} />{error && <span className="ui-field-error">{error}</span>}</label>; }

import React from 'react';
export default function ErrorState({ message='Something went wrong.', onRetry }) { return <div className="ui-state ui-state-error"><strong>Unable to load this view</strong><p>{message}</p>{onRetry && <button className="ui-button ui-button-secondary" onClick={onRetry}>Try again</button>}</div>; }

import React from 'react';

export default class AppErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (!this.state.hasError) return this.props.children;
    return <div className="app-shell" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}><div className="surface surface-pad" style={{ maxWidth: 520, textAlign: 'center' }}><div className="eyebrow">Unexpected interruption</div><h1 className="page-title" style={{ fontSize: 32 }}>Your workspace needs a refresh.</h1><p className="page-subtitle" style={{ margin: '14px auto 22px' }}>The application could not render this view. Refresh to restore your learning session.</p><button className="button button-primary" onClick={() => window.location.reload()}>Refresh workspace</button></div></div>;
  }
}

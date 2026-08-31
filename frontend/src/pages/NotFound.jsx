import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() { return <div className="app-shell" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}><div className="surface surface-pad" style={{ maxWidth: 520, textAlign: 'center' }}><div className="eyebrow">404 · Off the roadmap</div><h1 className="page-title" style={{ fontSize: 40 }}>This page does not exist.</h1><p className="page-subtitle" style={{ margin: '14px auto 22px' }}>The route may have moved, but your learning path is still here.</p><Link className="button button-primary" to="/dashboard">Return to dashboard</Link></div></div>; }

import React from 'react';

function linePoints(values, width = 760, height = 220) {
  const max = Math.max(...values, 1); const step = width / Math.max(values.length - 1, 1);
  return values.map((value, index) => `${Math.round(index * step)},${height - Math.round((value / max) * (height - 20))}`).join(' ');
}

export default function AnalyticsChart({ analytics }) {
  const labels = analytics?.labels || ['—', '—', '—', '—', '—', '—', '—'];
  const users = analytics?.users || [0, 0, 0, 0, 0, 0, 0]; const paths = analytics?.paths || [0, 0, 0, 0, 0, 0, 0];
  return <section className="surface surface-pad admin-chart-card"><div className="section-title"><div><div className="eyebrow">Last 7 days</div><h2>Platform momentum</h2><p>New learners and learning paths created over time.</p></div><span className="tag">Live data</span></div><div className="admin-chart-legend"><span><i className="legend-dot blue" /> New learners</span><span><i className="legend-dot purple" /> Learning paths</span></div><div className="admin-chart-wrap"><svg viewBox="0 0 760 260" role="img" aria-label="Learner and learning path activity chart" preserveAspectRatio="none"><g className="chart-grid">{[0, 1, 2, 3].map((line) => <line key={line} x1="0" x2="760" y1={line * 60 + 10} y2={line * 60 + 10} />)}</g><polyline className="chart-line blue-line" points={linePoints(users)} /><polyline className="chart-line purple-line" points={linePoints(paths)} /></svg></div><div className="admin-chart-labels">{labels.map((label) => <span key={label}>{label.slice(5) || '—'}</span>)}</div></section>;
}

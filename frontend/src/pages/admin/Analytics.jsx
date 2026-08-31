import React, { useEffect, useState } from 'react';
import AppShell from '../../components/common/AppShell';
import AnalyticsChart from '../../components/admin/AnalyticsChart';
import api from '../../services/api';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => setAnalytics(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Unable to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const totalUsers = (analytics?.users || []).reduce((a, b) => a + b, 0);
  const totalPaths = (analytics?.paths || []).reduce((a, b) => a + b, 0);
  const recScore = Math.round((analytics?.averageRecommendationScore || 0) * 100);

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="page-eyebrow">Intelligence Centre</div>
            <h1 className="page-title">Analytics</h1>
            <p className="page-subtitle">Learner growth, path creation, and recommendation quality at a glance.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}></span>
            System healthy
          </div>
        </div>

        {error && <div className="error-box" style={{ marginBottom: 20 }}>{error}</div>}

        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-label">Recommendation Quality</div>
            <div className="stat-value">{recScore}%</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Average model score</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">New Learners</div>
            <div className="stat-value">{totalUsers}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Last 7 days</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Paths Created</div>
            <div className="stat-value">{totalPaths}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Last 7 days</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">AI Chats</div>
            <div className="stat-value">{analytics?.aiChats || '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Total sessions</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">7-Day Trends</div>
          </div>
          <div style={{ padding: '0 24px 24px' }}>
            {loading ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading chart data…</p>
            ) : (
              <AnalyticsChart analytics={analytics} />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

import React, { useEffect, useState } from 'react';
import AppShell from '../../components/common/AppShell';
import UserTable from '../../components/admin/UserTable';
import api from '../../services/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/admin/dashboard')
    ])
      .then(([userRes, statsRes]) => {
        setUsers(userRes.data.data || []);
        setStats(statsRes.data.data);
      })
      .catch(err => setError(err.response?.data?.message || 'Unable to load admin data.'));
  }, []);

  const updateUser = (userId, status) =>
    setUsers(curr => curr.map(u => u._id === userId ? { ...u, status, isActive: status === 'active' } : u));

  const statCards = [
    { label: 'Total Learners', value: stats?.totalUsers || 0, note: 'Registered accounts', icon: '👥' },
    { label: 'Published Courses', value: stats?.publishedCourses || 0, note: 'In the catalog', icon: '📚' },
    { label: 'Active Paths', value: stats?.activeLearningPaths || 0, note: 'Roadmaps in motion', icon: '🗺️' },
    { label: 'Total Courses', value: stats?.totalCourses || 0, note: 'Across all statuses', icon: '🎓' },
  ];

  return (
    <AppShell>
      <div className="page-wrap">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-eyebrow">CodexCrue Operations</div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Monitor your catalog, learners, and recommendation system from one workspace.</p>
        </div>

        {error && <div className="error-box" style={{ marginBottom: 20 }}>{error}</div>}

        {/* Stats Grid */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {statCards.map(({ label, value, note, icon }) => (
            <div className="stat-card" key={label}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{note}</div>
            </div>
          ))}
        </div>

        {/* Users Panel */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="page-eyebrow">People</div>
              <div className="card-title">Learner Accounts</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Change access instantly. Inactive accounts cannot sign in.</p>
            </div>
            <span className="badge badge-gray">{users.length} users</span>
          </div>
          <UserTable users={users} onStatusChange={updateUser} />
        </div>
      </div>
    </AppShell>
  );
}

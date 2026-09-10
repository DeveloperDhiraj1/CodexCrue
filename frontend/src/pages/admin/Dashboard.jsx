import React, { useEffect, useState } from 'react';
import AppShell from '../../components/common/AppShell';
import UserTable from '../../components/admin/UserTable';
import Icon from '../../components/ui/Icon';
import api from '../../services/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]); const [stats, setStats] = useState(null); const [error, setError] = useState('');
  useEffect(() => { Promise.all([api.get('/users'), api.get('/admin/dashboard')]).then(([usersResponse, statsResponse]) => { setUsers(usersResponse.data.data || []); setStats(statsResponse.data.data); }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load admin data.')); }, []);
  const updateUser = (userId, status) => setUsers((current) => current.map((user) => user._id === userId ? { ...user, status, isActive: status === 'active' } : user));
  const statCards = [['Total Learners', stats?.totalUsers || 0, 'Registered accounts', 'users'], ['Published Courses', stats?.publishedCourses || 0, 'In the catalog', 'courses'], ['Active Paths', stats?.activeLearningPaths || 0, 'Roadmaps in motion', 'paths'], ['Total Courses', stats?.totalCourses || 0, 'Across all statuses', 'learning']];
  return <AppShell><div className="page-wrap"><div className="page-header"><div className="page-eyebrow">CodexCrue Operations</div><h1 className="page-title">Admin Dashboard</h1><p className="page-subtitle">Monitor your catalog, learners, and recommendation system from one workspace.</p></div>{error && <div className="error-box" style={{ marginBottom: 20 }}>{error}</div>}<div className="stats-grid" style={{ marginBottom: 24 }}>{statCards.map(([label, value, note, icon]) => <div className="stat-card" key={label}><div className="admin-stat-icon"><Icon name={icon} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{note}</div></div>)}</div><div className="card"><div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div className="page-eyebrow">People</div><div className="card-title">Learner Accounts</div><p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Change access instantly. Inactive accounts cannot sign in.</p></div><span className="badge badge-gray">{users.length} users</span></div><UserTable users={users} onStatusChange={updateUser} /></div></div></AppShell>;
}

import React, { useEffect, useState } from 'react';
import AppShell from '../../components/common/AppShell';
import UserTable from '../../components/admin/UserTable';
import api from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/users')
      .then(res => setUsers(res.data.data || []))
      .catch(err => setError(err.response?.data?.message || 'Unable to load users.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="page-eyebrow">Administration</div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Review registered learners and manage account access.</p>
          </div>
          <input
            className="courses-search"
            style={{ maxWidth: 260 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
          />
        </div>

        {error && <div className="error-box" style={{ marginBottom: 20 }}>{error}</div>}

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title">User Directory</div>
            <span className="badge badge-gray">{filteredUsers.length} of {users.length} users</span>
          </div>
          {loading ? (
            <p style={{ padding: '32px 24px', color: 'var(--text-muted)', textAlign: 'center' }}>Loading users…</p>
          ) : (
            <UserTable users={filteredUsers} />
          )}
        </div>
      </div>
    </AppShell>
  );
}

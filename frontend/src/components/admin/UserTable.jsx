import React, { useState } from 'react';
import api from '../../services/api';

const statusFromUser = (user) => user.status || (user.isActive === false ? 'inactive' : 'active');

function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U';
}

export default function UserTable({ users, onStatusChange }) {
  const [savingId, setSavingId] = useState('');

  const updateStatus = async (user, status) => {
    setSavingId(user._id);
    try {
      await api.patch(`/users/${user._id}/status`, { status });
      onStatusChange?.(user._id, status);
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to update user status.');
    } finally {
      setSavingId('');
    }
  };

  if (!users?.length) {
    return <div className="admin-users-empty"><div className="admin-users-empty-icon">◎</div><strong>No users found</strong><span>Try a different search term or wait for a new account to register.</span></div>;
  }

  return (
    <div className="admin-user-table-wrap">
      <table className="admin-user-table">
        <thead><tr><th>User</th><th>Contact</th><th>Role</th><th>Account status</th><th>Manage access</th></tr></thead>
        <tbody>
          {users.map((user) => {
            const status = statusFromUser(user);
            return <tr key={user._id}>
              <td><div className="admin-user-identity"><span className="admin-user-avatar">{initials(user.name)}</span><span><strong>{user.name || 'Unnamed user'}</strong><small>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</small></span></div></td>
              <td><span className="admin-user-email">{user.email}</span></td>
              <td><span className={`admin-role-pill ${user.role === 'admin' ? 'admin' : ''}`}>{user.role === 'admin' ? 'Admin' : 'Learner'}</span></td>
              <td><span className={`admin-status-pill ${status}`}>{status === 'banned' ? 'Banned' : status === 'inactive' ? 'Inactive' : 'Active'}</span></td>
              <td><div className="admin-status-actions"><button className={`admin-status-button ${status === 'active' ? 'selected active' : ''}`} disabled={savingId === user._id || status === 'active'} onClick={() => updateStatus(user, 'active')}>Active</button><button className={`admin-status-button ${status === 'inactive' ? 'selected inactive' : ''}`} disabled={savingId === user._id || status === 'inactive'} onClick={() => updateStatus(user, 'inactive')}>Inactive</button><button className={`admin-status-button ${status === 'banned' ? 'selected banned' : ''}`} disabled={savingId === user._id || status === 'banned'} onClick={() => updateStatus(user, 'banned')}>Ban</button></div></td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

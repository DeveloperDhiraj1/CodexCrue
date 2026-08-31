import React, { useState } from 'react';
import api from '../../services/api';

const statusFromUser = (user) => user.status || (user.isActive === false ? 'inactive' : 'active');

export default function UserTable({ users, onStatusChange }) {
  const [savingId, setSavingId] = useState('');
  const updateStatus = async (user, status) => {
    setSavingId(user._id);
    try { await api.patch(`/users/${user._id}/status`, { status }); onStatusChange?.(user._id, status); }
    catch (error) { window.alert(error.response?.data?.message || 'Unable to update user status.'); }
    finally { setSavingId(''); }
  };
  return <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm overflow-hidden"><table className="w-full text-left border-collapse"><thead><tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Goal</th><th className="p-4">Account status</th><th className="p-4">Manage access</th></tr></thead><tbody className="divide-y divide-slate-100 text-sm">{users?.map((user) => { const status = statusFromUser(user); return <tr key={user._id} className="hover:bg-slate-50"><td className="p-4 font-semibold text-slate-900">{user.name}</td><td className="p-4 text-slate-600">{user.email}</td><td className="p-4 text-emerald-600 font-medium">{user.learningGoal || '—'}</td><td className="p-4"><span className={`tag ${status === 'banned' ? 'red' : status === 'inactive' ? 'orange' : ''}`}>{status === 'banned' ? 'Banned' : status === 'inactive' ? 'Inactive' : 'Active'}</span></td><td className="p-4"><div className="status-actions"><button className={`status-button ${status === 'active' ? 'selected active' : ''}`} disabled={savingId === user._id || status === 'active'} onClick={() => updateStatus(user, 'active')}>Active</button><button className={`status-button ${status === 'inactive' ? 'selected inactive' : ''}`} disabled={savingId === user._id || status === 'inactive'} onClick={() => updateStatus(user, 'inactive')}>Inactive</button><button className={`status-button ${status === 'banned' ? 'selected banned' : ''}`} disabled={savingId === user._id || status === 'banned'} onClick={() => updateStatus(user, 'banned')}>Ban</button></div></td></tr>; })}</tbody></table></div>;
}

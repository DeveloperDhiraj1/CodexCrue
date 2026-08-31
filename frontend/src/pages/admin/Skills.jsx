import React, { useEffect, useState } from 'react';
import AppShell from '../../components/common/AppShell';
import api from '../../services/api';

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.get('/skills', { params: { limit: 100 } })
      .then(res => setSkills(res.data.data || []));

  useEffect(() => {
    load().catch(err => setError(err.response?.data?.message || 'Unable to load skills.'));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/skills', form);
      setForm({ name: '', category: '', description: '' });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create skill.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (skill) => {
    if (!window.confirm(`Delete ${skill.name}?`)) return;
    try {
      await api.delete(`/skills/${skill._id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete skill.');
    }
  };

  // Group skills by category for the list
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-header">
          <div className="page-eyebrow">Administration</div>
          <h1 className="page-title">Skill Taxonomy</h1>
          <p className="page-subtitle">Maintain the skill vocabulary used by paths, gap analysis, and recommendations.</p>
        </div>

        {error && <div className="error-box" style={{ marginBottom: 20 }}>{error}</div>}

        <div className="dash-grid">
          {/* Left: Create form */}
          <form className="card" onSubmit={create}>
            <div className="card-header">
              <div className="card-title">Add a Skill</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Use clear, learner-facing names.</p>
            </div>
            <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label className="label">Name</label>
                <input className="input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="field">
                <label className="label">Category</label>
                <input className="input" required value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              </div>
              <div className="field">
                <label className="label">Description</label>
                <textarea className="input" rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={saving}>
                {saving ? 'Creating…' : 'Create Skill'}
              </button>
            </div>
          </form>

          {/* Right: Skills list */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">Skill Inventory</div>
              <span className="badge badge-gray">{skills.length} skills</span>
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              {skills.length === 0 ? (
                <div className="empty-state">No skills found. Create the first taxonomy entry.</div>
              ) : (
                Object.entries(groupedSkills).map(([category, catSkills]) => (
                  <div key={category} style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #E5E7EB' }}>
                      {category}
                    </div>
                    {catSkills.map(skill => (
                      <div key={skill._id} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{skill.name}</div>
                          {skill.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{skill.description}</div>}
                        </div>
                        <button type="button" className="btn btn-sm" style={{ background: '#FEF2F2', color: '#DC2626' }} onClick={() => remove(skill)}>
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

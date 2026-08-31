import React, { useState } from 'react';
import AppShell from '../../components/common/AppShell';
import api from '../../services/api';

const empty = {
  title: '', description: '', url: '', provider: '',
  sourceType: 'official', skills: '', difficulty: 'Beginner', qualityScore: 0.8
};

export default function AdminResources() {
  const [form, setForm] = useState(empty);
  const [resources, setResources] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.post('/learning-resources/import', {
        resources: [{
          ...form,
          skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
          qualityScore: Number(form.qualityScore)
        }]
      });
      setResources(current => [{
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        _id: form.url // temp id
      }, ...current]);
      setForm(empty);
      setMessage('Resource added to the learner recommendation pool.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add resource.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-header">
          <div className="page-eyebrow">Admin Curation</div>
          <h1 className="page-title">Learning Resources</h1>
          <p className="page-subtitle">Manually curate trusted free resources. Learners receive automatic matches from their profile.</p>
        </div>

        {message && <div className="success-msg" style={{ marginBottom: 20 }}>{message}</div>}
        {error && <div className="error-box" style={{ marginBottom: 20 }}>{error}</div>}

        {/* Form Card */}
        <form className="card" onSubmit={save} style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-title">Add a Resource</div>
          </div>
          <div style={{ padding: '0 24px 24px' }}>
            {/* 2-col grid for most fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="field">
                <label className="label">Resource Title</label>
                <input className="input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div className="field">
                <label className="label">Provider</label>
                <input className="input" required placeholder="MDN, freeCodeCamp, MIT OCW" value={form.provider} onChange={e => setForm({...form, provider: e.target.value})} />
              </div>
              <div className="field">
                <label className="label">URL</label>
                <input className="input" type="url" required value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
              </div>
              <div className="field">
                <label className="label">Source Type</label>
                <select className="input" value={form.sourceType} onChange={e => setForm({...form, sourceType: e.target.value})}>
                  <option value="official">Official</option>
                  <option value="documentation">Documentation</option>
                  <option value="course">Course</option>
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Difficulty</label>
                <select className="input" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Quality Score (0-1)</label>
                <input className="input" type="number" min="0" max="1" step="0.01" value={form.qualityScore} onChange={e => setForm({...form, qualityScore: e.target.value})} />
              </div>
            </div>
            {/* skills full-width */}
            <div className="field" style={{ marginBottom: 16 }}>
              <label className="label">Skills</label>
              <input className="input" required value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} placeholder="JavaScript, React, Web Development (comma separated)" />
            </div>
            {/* description full-width */}
            <div className="field" style={{ marginBottom: 16 }}>
              <label className="label">Description</label>
              <textarea className="input" rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary">
              {saving ? 'Adding Resource...' : 'Add Resource'}
            </button>
          </div>
        </form>

        {/* Session log */}
        {resources.length > 0 && (
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="card-title">Added This Session</div>
              <span className="badge badge-green">{resources.length} added</span>
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              {resources.map(resource => (
                <div key={resource._id} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #E5E7EB' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{resource.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{resource.provider} · {resource.sourceType}</div>
                  </div>
                  <span className="badge badge-gray">Published</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

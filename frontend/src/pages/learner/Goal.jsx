import React, { useEffect, useState } from 'react';
import AppShell from '../../components/common/AppShell';
import api from '../../services/api';

export default function Goal() {
  const [goal, setGoal] = useState(null);
  const [form, setForm] = useState({ title: '', careerTarget: '', targetDate: '', weeklyLearningHours: 7 });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/goals')
      .then((response) => {
        const value = response.data.data;
        setGoal(value);
        if (value) {
          setForm({
            title: value.title || '',
            careerTarget: value.careerTarget || '',
            targetDate: value.targetDate ? value.targetDate.slice(0, 10) : '',
            weeklyLearningHours: value.weeklyLearningHours || 7
          });
        }
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load goal.'));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await api[goal ? 'put' : 'post']('/goals', form);
      setGoal(response.data.data);
      setMessage('Goal saved. Your recommendations will adapt.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save goal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-header">
          <div className="page-eyebrow">Direction</div>
          <h1 className="page-title">Your Career Goal</h1>
          <p className="page-subtitle">A clear goal gives your AI roadmap the context to prioritize the right skills and courses.</p>
        </div>

        <div className="dash-grid">
          <form className="card" onSubmit={save}>
            <div className="card-header">
              <div className="card-title">{goal ? 'Update your goal' : 'Set your goal'}</div>
            </div>
            
            <div className="field" style={{ marginBottom: 16 }}>
              <label className="label">Goal title</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Become job-ready" required />
            </div>
            
            <div className="field" style={{ marginBottom: 16 }}>
              <label className="label">Career target</label>
              <input className="input" value={form.careerTarget} onChange={(e) => setForm({ ...form, careerTarget: e.target.value })} placeholder="Full Stack Developer" required />
            </div>
            
            <div className="field" style={{ marginBottom: 16 }}>
              <label className="label">Target date</label>
              <input className="input" type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            </div>
            
            <div className="field" style={{ marginBottom: 16 }}>
              <label className="label">Hours per week</label>
              <input className="input" type="number" min="0" max="168" value={form.weeklyLearningHours} onChange={(e) => setForm({ ...form, weeklyLearningHours: Number(e.target.value) })} required />
            </div>
            
            {error && <div className="error-box" style={{ marginTop: 16 }}>{error}</div>}
            {message && <p style={{ color: 'var(--primary)', marginTop: 16, fontSize: 14 }}>{message}</p>}
            
            <button className="btn btn-primary btn-lg" style={{ marginTop: 20, width: '100%' }} disabled={saving}>
              {saving ? 'Saving…' : 'Save goal'}
            </button>
          </form>

          <section className="card">
            <div className="card-header"><div className="card-title">Why this matters</div></div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Your goal shapes the skill-gap analysis, course ranking, and learning-path milestones. Update it whenever your direction changes.
            </p>
            {goal && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13 }}>Overall Progress</span>
                  <strong style={{ color: 'var(--primary)' }}>{goal.progress || 0}%</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${goal.progress || 0}%` }} />
                </div>
                {goal.careerTarget && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Target Role</div>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>{goal.careerTarget}</div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

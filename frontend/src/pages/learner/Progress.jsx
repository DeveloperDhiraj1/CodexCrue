import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '../../components/common/AppShell';
import api from '../../services/api';

const initialSession = { courseId: '', durationMinutes: 30, note: '' };

export default function Progress() {
  const [items, setItems] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [badges, setBadges] = useState([]);
  const [session, setSession] = useState(initialSession);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([
    api.get('/progress'), 
    api.get('/progress/sessions'), 
    api.get('/rewards'), 
    api.get('/rewards/badges'), 
    api.get('/courses', { params: { limit: 100 } })
  ])
    .then(([progressResponse, sessionsResponse, rewardResponse, badgeResponse, coursesResponse]) => {
      setItems(progressResponse.data.data || []);
      setSessions(sessionsResponse.data.data || []);
      setRewards(rewardResponse.data.data || []);
      setBadges(badgeResponse.data.data || []);
      setCatalog(coursesResponse.data.data || []);
    })
    .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load progress.'));

  useEffect(() => { load(); }, []);

  const logSession = async (event) => {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      await api.post('/progress/session', { ...session, durationMinutes: Number(session.durationMinutes) });
      setMessage('Study session logged. Your course and goal progress were updated.');
      setSession(initialSession);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to log study session.');
    } finally { setSaving(false); }
  };

  const average = items.length ? Math.round(items.reduce((sum, item) => sum + (item.completionPercentage || 0), 0) / items.length) : 0;
  const totalHours = items.reduce((sum, item) => sum + Number(item.timeSpentHours || 0), 0);
  const weekHours = useMemo(() => {
    const start = new Date(); start.setDate(start.getDate() - 7);
    return sessions.filter((item) => new Date(item.studiedAt) >= start).reduce((sum, item) => sum + Number(item.durationMinutes || 0) / 60, 0);
  }, [sessions]);
  const formatHours = (hours) => Number(hours || 0).toFixed(1).replace('.0', '');

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-header">
          <div className="page-eyebrow">Momentum</div>
          <h1 className="page-title">Your Progress</h1>
          <p className="page-subtitle">Log study time. Track completion. Build your momentum.</p>
        </div>

        {error && <div className="error-box" style={{ marginBottom: 18 }}>{error}</div>}
        {message && <div className="badge badge-green" style={{ marginBottom: 18 }}>{message}</div>}

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-label">Average Completion</div>
            <div className="stat-value">{average}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Tracked study time</div>
            <div className="stat-value">{formatHours(totalHours)}h</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Last 7 days</div>
            <div className="stat-value">{formatHours(weekHours)}h</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Reward points</div>
            <div className="stat-value">{rewards.reduce((sum, reward) => sum + reward.points, 0)}</div>
          </div>
        </div>

        <div className="dash-grid" style={{ marginBottom: 20 }}>
          <form className="card" onSubmit={logSession}>
            <div className="card-header"><div className="card-title">Log a study session</div></div>
            <div className="field">
              <label className="label">Course</label>
              <select className="input" required value={session.courseId} onChange={(event) => setSession({ ...session, courseId: event.target.value })}>
                <option value="">Choose a course</option>
                {catalog.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
              </select>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label className="label">Study time (minutes)</label>
              <input className="input" type="number" min="1" max="1440" required value={session.durationMinutes} onChange={(event) => setSession({ ...session, durationMinutes: event.target.value })} />
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label className="label">Note (optional)</label>
              <input className="input" maxLength="500" value={session.note} onChange={(event) => setSession({ ...session, note: event.target.value })} placeholder="React hooks practice" />
            </div>
            <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} disabled={saving}>
              {saving ? 'Saving session...' : 'Log study time'}
            </button>
          </form>

          <section className="card">
            <div className="card-header"><div className="card-title">Recent activity</div></div>
            {sessions.length ? (
              <div>
                {sessions.slice(0, 8).map((item) => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', padding: '12px 0' }}>
                    <div>
                      <strong>{item.courseId?.title || 'Course'}</strong>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                        {new Date(item.studiedAt).toLocaleDateString()} {item.note ? '· ' + item.note : ''}
                      </div>
                    </div>
                    <span className="badge badge-green">{formatHours(Number(item.durationMinutes) / 60)}h</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><strong>No sessions yet</strong><p>Log your first study session to start real tracking.</p></div>
            )}
          </section>
        </div>

        <section className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><div className="card-title">Course Progress</div></div>
          {items.length ? (
            <div>
              {items.map(item => (
                <div key={item._id} style={{ borderBottom: '1px solid var(--border-light)', padding: '14px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{item.courseId?.title || 'Course'}</strong>
                    <span className="badge badge-green">{item.completionPercentage || 0}%</span>
                  </div>
                  <div className="progress-bar" style={{ marginTop: 8 }}>
                    <div className="progress-fill" style={{ width: (item.completionPercentage || 0) + '%' }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{formatHours(item.timeSpentHours)}h studied · {item.status}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><strong>No progress yet</strong><p>Start a recommended course to see your momentum here.</p></div>
          )}
        </section>

        <div className="dash-grid">
          <section className="card">
            <div className="card-header"><div className="card-title">Your badges</div></div>
            {badges.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {badges.map((badge) => (
                  <div key={badge.key} style={{ padding: 14, border: '1px solid var(--border-light)', borderRadius: 8, opacity: badge.earned ? 1 : 0.5 }}>
                    <div style={{ fontSize: 28 }}>{badge.icon}</div>
                    <strong>{badge.title}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>{badge.description}</div>
                    <div className="badge badge-green" style={{ marginTop: 10 }}>{badge.earned ? 'Unlocked · +' + badge.points + ' pts' : 'Locked'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">Badges will appear as you build your learning habit.</div>
            )}
          </section>

          <section className="card">
            <div className="card-header"><div className="card-title">Your rewards</div></div>
            {rewards.length ? (
              <div>
                {rewards.map((reward) => (
                  <div key={reward._id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', padding: '12px 0' }}>
                    <span>{reward.icon} {reward.title}</span>
                    <strong>+{reward.points} pts</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">Complete your first course to earn a reward.</div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

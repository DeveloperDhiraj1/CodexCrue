import React, { useEffect, useState } from 'react';
import AppShell from '../../components/common/AppShell';
import api from '../../services/api';

const initial = {
  title: '', description: '', instructor: '', difficulty: 'Beginner',
  duration: '', category: '', skills: '', status: 'draft'
};

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.get('/courses', { params: { status: 'all', limit: 100 } })
      .then(res => setCourses(res.data.data || []));

  useEffect(() => {
    load().catch(err => setError(err.response?.data?.message || 'Unable to load courses.'));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/courses', {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      setForm(initial);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create course.');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (course) => {
    try {
      await api.patch(`/courses/${course._id}/status`, {
        status: course.status === 'published' ? 'draft' : 'published'
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update course status.');
    }
  };

  const remove = async (course) => {
    if (!window.confirm(`Delete ${course.title}?`)) return;
    try {
      await api.delete(`/courses/${course._id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete course.');
    }
  };

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-header">
          <div className="page-eyebrow">Administration</div>
          <h1 className="page-title">Course Catalog</h1>
          <p className="page-subtitle">Create, publish, and maintain the course library that powers learner paths.</p>
        </div>

        {error && <div className="error-box" style={{ marginBottom: 20 }}>{error}</div>}

        <div className="dash-grid">
          {/* LEFT: Create Form */}
          <form className="card" onSubmit={create}>
            <div className="card-header">
              <div className="card-title">Add a Course</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>New courses start as drafts.</p>
            </div>
            <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label className="label">Title</label>
                <input className="input" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label className="label">Instructor</label>
                  <input className="input" required value={form.instructor} onChange={e => setForm({...form, instructor: e.target.value})} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label className="label">Category</label>
                  <input className="input" required value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label className="label">Duration</label>
                  <input className="input" required value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} />
                </div>
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
                <label className="label">Skills</label>
                <input className="input" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} placeholder="e.g. JavaScript, React (comma separated)" />
              </div>
              <div className="field">
                <label className="label">Description</label>
                <textarea className="input" rows={4} required value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={saving}>
                {saving ? 'Creating…' : 'Create Draft'}
              </button>
            </div>
          </form>

          {/* RIGHT: Course List */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="card-title">Course Inventory</div>
              <span className="badge badge-gray">{courses.length} courses</span>
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              {courses.length === 0 ? (
                <div className="empty-state">No courses yet. Create the first draft.</div>
              ) : (
                courses.map(course => (
                  <div key={course._id} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #E5E7EB' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{course.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                        {course.category} · {course.difficulty} ·{' '}
                        <span className={course.status === 'published' ? 'badge badge-green' : 'badge badge-gray'} style={{ fontSize: 11 }}>
                          {course.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => changeStatus(course)}>
                        {course.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button type="button" className="btn btn-sm" style={{ background: '#FEF2F2', color: '#DC2626' }} onClick={() => remove(course)}>
                        Delete
                      </button>
                    </div>
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

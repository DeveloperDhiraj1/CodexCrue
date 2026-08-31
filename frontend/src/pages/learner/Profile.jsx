import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AppShell from '../../components/common/AppShell';
import Avatar from '../../components/ui/Avatar';
import api from '../../services/api';
import { initializeAuth } from '../../store/slices/authSlice';

const emptyForm = { bio: '', location: '', education: { degree: '', institution: '', field: '', graduationYear: '' }, experienceLevel: 'beginner', currentSkills: '', interests: '', preferredLearningStyle: 'project-based', preferredLanguage: 'en' };

export default function Profile() {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarStatus, setAvatarStatus] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/profile').then((response) => {
      const value = response.data.data;
      setProfile(value);
      setForm({
        bio: value?.bio || '', location: value?.location || '',
        education: { ...emptyForm.education, ...(value?.education || {}) },
        experienceLevel: value?.experienceLevel || 'beginner',
        currentSkills: (value?.currentSkills || []).join(', '),
        interests: (value?.interests || []).join(', '),
        preferredLearningStyle: value?.preferredLearningStyle || 'project-based', preferredLanguage: value?.preferredLanguage || 'en'
      });
    }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load profile.'));
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateEducation = (field, value) => setForm((current) => ({ ...current, education: { ...current.education, [field]: value } }));
  
  const uploadAvatar = async (file) => {
    if (!file) return;
    setAvatarFile(file); setAvatarStatus('Uploading photo...'); setError('');
    const data = new FormData(); data.append('avatar', file);
    try {
      const uploadResponse = await api.post('/users/upload-avatar', data, {
        headers: { 'Content-Type': undefined }
      });
      const avatarUrl = uploadResponse.data?.data?.avatar;
      if (!avatarUrl) throw new Error('Server did not return an avatar URL.');
      setProfile((current) => ({ ...current, userId: { ...current?.userId, avatar: avatarUrl } }));
      await dispatch(initializeAuth()).unwrap().catch(() => null);
      setAvatarStatus('Photo uploaded successfully.');
    } catch (requestError) {
      setAvatarStatus(''); setError(requestError.response?.data?.message || requestError.message || 'Photo upload failed.');
    }
  };

  const save = async (event) => {
    event.preventDefault(); setSaving(true); setMessage(''); setError('');
    try {
      const response = await api.put('/profile', {
        ...form,
        education: { ...form.education, graduationYear: form.education.graduationYear ? Number(form.education.graduationYear) : undefined },
        currentSkills: form.currentSkills.split(',').map((item) => item.trim()).filter(Boolean),
        interests: form.interests.split(',').map((item) => item.trim()).filter(Boolean)
      });
      setProfile((current) => ({ ...response.data.data, userId: { ...response.data.data.userId, avatar: current?.userId?.avatar || response.data.data.userId?.avatar } }));
      setMessage('Profile saved. Your learning path will use these details.');
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save profile.'); }
    finally { setSaving(false); }
  };

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="profile-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div className="page-eyebrow">Personal profile</div>
            <h1 className="page-title">Your story, your starting point.</h1>
            <p className="page-subtitle">Keep your personal details here. When you are ready, create a separate goal to generate your learning path.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Avatar name={profile?.userId?.name} src={profile?.userId?.avatar} size="lg" />
            <label className="btn btn-ghost avatar-upload">
              Choose photo
              <input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={(event) => uploadAvatar(event.target.files?.[0])} />
            </label>
            {avatarStatus && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{avatarStatus}</span>}
          </div>
        </div>
        
        {error && <div className="error-box" style={{ marginBottom: 18 }}>{error}</div>}
        {message && <p style={{ color: 'var(--primary)', marginBottom: 18, fontSize: 14 }}>{message}</p>}
        
        <form onSubmit={save}>
          <section className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div className="card-header">
              <div className="page-eyebrow">About you</div>
              <h2 className="card-title">Personal details</h2>
              <p className="card-subtitle">These details help us understand your context without mixing in a learning goal.</p>
            </div>
            <div className="profile-grid">
              <div className="field" style={{ gridColumn: 'span 2' }}>
                <label className="label">Short bio</label>
                <textarea className="input" rows="3" maxLength="500" value={form.bio} onChange={(event) => update('bio', event.target.value)} placeholder="Tell us a little about yourself..." />
              </div>
              <div className="field">
                <label className="label">Location</label>
                <input className="input" value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Delhi, India" />
              </div>
              <div className="field">
                <label className="label">Experience level</label>
                <select className="input" value={form.experienceLevel} onChange={(event) => update('experienceLevel', event.target.value)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </section>

          <section className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div className="card-header">
              <div className="page-eyebrow">Background</div>
              <h2 className="card-title">Education</h2>
              <p className="card-subtitle">Optional details that help set the right context.</p>
            </div>
            <div className="profile-grid">
              <div className="field">
                <label className="label">Degree / qualification</label>
                <input className="input" value={form.education.degree} onChange={(event) => updateEducation('degree', event.target.value)} placeholder="B.Tech" />
              </div>
              <div className="field">
                <label className="label">Institution</label>
                <input className="input" value={form.education.institution} onChange={(event) => updateEducation('institution', event.target.value)} placeholder="University or school" />
              </div>
              <div className="field">
                <label className="label">Field of study</label>
                <input className="input" value={form.education.field} onChange={(event) => updateEducation('field', event.target.value)} placeholder="Computer Science" />
              </div>
              <div className="field">
                <label className="label">Graduation year</label>
                <input className="input" type="number" min="1950" max="2200" value={form.education.graduationYear} onChange={(event) => updateEducation('graduationYear', event.target.value)} placeholder="2026" />
              </div>
            </div>
          </section>

          <section className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div className="card-header">
              <div className="page-eyebrow">Learning context</div>
              <h2 className="card-title">Skills & preferences</h2>
              <p className="card-subtitle">Used later when your goal-based path is generated.</p>
            </div>
            <div className="field" style={{ marginBottom: 16 }}>
              <label className="label">Current skills <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>(comma separated)</span></label>
              <textarea className="input" rows="3" value={form.currentSkills} onChange={(event) => update('currentSkills', event.target.value)} placeholder="HTML, JavaScript, Excel" />
            </div>
            <div className="profile-grid">
              <div className="field">
                <label className="label">Interests <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>(comma separated)</span></label>
                <input className="input" value={form.interests} onChange={(event) => update('interests', event.target.value)} placeholder="AI, design, startups" />
              </div>
              <div className="field">
                <label className="label">Preferred learning style</label>
                <select className="input" value={form.preferredLearningStyle} onChange={(event) => update('preferredLearningStyle', event.target.value)}>
                  <option value="project-based">Project based</option>
                  <option value="video">Video lessons</option>
                  <option value="reading">Reading & docs</option>
                  <option value="mixed">A mix of everything</option>
                </select>
              </div>
            </div>
          </section>

          <section className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div className="field">
              <label className="label">Content language</label>
              <select className="input" value={form.preferredLanguage} onChange={(event) => update('preferredLanguage', event.target.value)}>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="hinglish">Hinglish</option>
              </select>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>Hindi/Hinglish resources get priority.</span>
            </div>
          </section>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'Saving...' : 'Save personal profile'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

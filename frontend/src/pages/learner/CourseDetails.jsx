import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../../components/common/AppShell';
import api from '../../services/api';

const getResourceUrl = (course) => course?.sourceUrl || course?.resources?.find((resource) => resource?.url)?.url || '';

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const trackingRef = useRef(null);
  const intervalRef = useRef(null);

  const loadProgress = async () => {
    const response = await api.get('/progress');
    setProgress((response.data.data || []).find((item) => item.courseId?._id === id || item.courseId === id) || null);
  };

  useEffect(() => {
    Promise.all([api.get(`/courses/${id}`), api.get('/progress')])
      .then(([courseResponse, progressResponse]) => {
        setCourse(courseResponse.data.data);
        setProgress((progressResponse.data.data || []).find((item) => item.courseId?._id === id || item.courseId === id) || null);
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load course.'));
  }, [id]);

  useEffect(() => () => {
    const session = trackingRef.current;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (session) {
      const minutes = Math.floor((Date.now() - session.startedAt) / 60000);
      if (minutes >= 1) api.post('/progress/session', { courseId: session.courseId, durationMinutes: Math.min(1440, minutes), note: 'Course detail session auto-tracked' }).catch(() => null);
    }
  }, []);

  const logCurrentSession = async () => {
    const session = trackingRef.current;
    if (!session) return;
    const minutes = Math.floor((Date.now() - session.lastLoggedAt) / 60000);
    if (minutes < 1) return;
    await api.post('/progress/session', { courseId: session.courseId, durationMinutes: Math.min(1440, minutes), note: 'Course detail session auto-tracked' });
    trackingRef.current = { ...session, lastLoggedAt: session.lastLoggedAt + minutes * 60000 };
    await loadProgress();
  };

  const startLearning = () => {
    if (tracking) return;
    const resourceUrl = getResourceUrl(course);
    if (resourceUrl) window.open(resourceUrl, '_blank', 'noopener,noreferrer');
    trackingRef.current = { courseId: id, startedAt: Date.now(), lastLoggedAt: Date.now() };
    setTracking(true);
    setMessage(resourceUrl ? 'Learning opened in a new tab. Your study time is being tracked.' : 'Tracking started. This course does not have an external resource link yet.');
    intervalRef.current = window.setInterval(() => logCurrentSession().catch(() => null), 30000);
  };

  const stopTracking = async () => {
    if (!trackingRef.current) return;
    try {
      await logCurrentSession();
      setMessage('Study session saved. Your progress is up to date.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save this study session.');
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      trackingRef.current = null;
      setTracking(false);
    }
  };

  const sendFeedback = async (event) => {
    event.preventDefault(); setFeedbackSaving(true); setMessage(''); setError('');
    try {
      await api.post('/feedback', { targetType: 'course', targetId: id, rating: Number(rating), comment });
      setMessage('Thanks — your feedback was recorded.'); setRating(''); setComment('');
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to submit feedback.'); }
    finally { setFeedbackSaving(false); }
  };

  const resourceUrl = getResourceUrl(course);
  const skills = Array.isArray(course?.skills) ? course.skills : String(course?.skills || '').split(',').map((skill) => skill.trim()).filter(Boolean);
  const completion = progress?.completionPercentage || 0;

  return <AppShell><div className="page-wrap learner-course-page">
    {error && !course ? <div className="error-box">{error}</div> : course ? <>
      <Link to="/courses" className="course-back-link">← Back to catalog</Link>
      <section className="learner-course-hero">
        <div className="learner-course-hero-copy">
          <div className="course-meta"><span className="tag navy">{course.category || 'Course'}</span><span className="tag">{course.difficulty || 'Self-paced'}</span>{course.isFree && <span className="tag green">Free</span>}</div>
          <h1>{course.title}</h1>
          <p>{course.description || 'Build practical skills with a focused, structured learning experience.'}</p>
          {skills.length > 0 && <div className="learner-course-skills"><span className="learner-course-skills-label">Technology stack</span><div className="learner-course-skill-list">{skills.map((skill) => <span className="learner-course-skill" key={skill}>{skill}</span>)}</div></div>}
          <div className="learner-course-actions">
            {tracking ? <button className="button button-danger" onClick={stopTracking}>Stop tracking</button> : <button className="button button-primary" onClick={startLearning}>Start learning & track ↗</button>}
            {resourceUrl && <a className="button button-ghost" href={resourceUrl} target="_blank" rel="noreferrer">Open resource ↗</a>}
          </div>
          {tracking && <div className="course-tracking-note"><span className="tracking-dot" /> Study session is active. Keep this page open while learning.</div>}
        </div>
        <div className="learner-course-hero-mark">{course.thumbnail ? <img src={course.thumbnail} alt="" /> : <span>{course.title?.charAt(0)?.toUpperCase() || 'C'}</span>}</div>
      </section>

      {message && <div className="profile-success learner-course-message">✓ {message}</div>}
      {error && <div className="error-box learner-course-message">{error}</div>}

      <div className="grid grid-2 learner-course-grid">
        <section className="surface surface-pad">
          <div className="section-title"><div><div className="eyebrow">Your progress</div><h2>Course overview</h2><p>Progress is updated from verified study sessions.</p></div><strong className="course-progress-number">{completion}%</strong></div>
          <div className="course-progress-track"><div className="course-progress-fill" style={{ width: `${completion}%` }} /></div>
          <div className="course-overview-list"><div><span>Duration</span><strong>{course.duration || 'Self-paced'}</strong></div><div><span>Instructor</span><strong>{course.instructor || 'CodexCrue'}</strong></div><div><span>Provider</span><strong>{course.provider || 'Open Source'}</strong></div><div><span>Time studied</span><strong>{Number(progress?.timeSpentHours || 0).toFixed(1)}h</strong></div></div>
        </section>
        <section className="surface surface-pad">
          <div className="section-title"><div><div className="eyebrow">Help us improve</div><h2>Share feedback</h2><p>Your feedback improves future recommendations.</p></div></div>
          <form onSubmit={sendFeedback}><div className="field"><label>Rating</label><select className="input" value={rating} onChange={(event) => setRating(event.target.value)} required><option value="">Choose a rating</option><option value="1">1 — Needs work</option><option value="2">2 — Fair</option><option value="3">3 — Good</option><option value="4">4 — Great</option><option value="5">5 — Excellent</option></select></div><div className="field" style={{ marginTop: 14 }}><label>Comment</label><textarea className="input" rows="4" maxLength="2000" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What helped or could be clearer?" /></div><button className="button button-primary" style={{ marginTop: 16 }} disabled={feedbackSaving}>{feedbackSaving ? 'Sending…' : 'Submit feedback'}</button></form>
        </section>
      </div>
    </> : <div className="surface empty">Loading course…</div>}
  </div></AppShell>;
}

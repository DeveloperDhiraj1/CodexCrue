import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PublicLayout from '../../components/public/PublicLayout';
import api from '../../services/api';

export default function PublicCourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then(res => setCourse(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Unable to load course.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStart = () => {
    if (isAuthenticated) {
      navigate(`/courses/${id}`);
    } else {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
    }
  };

  const getCategoryEmoji = (category = '') => {
    const map = {
      python: '🐍', javascript: '🟡', web: '🌐', ml: '🧠',
      ai: '🧠', data: '📊', design: '🎨', cloud: '☁️',
      mobile: '📱', security: '🔒', devops: '⚙️'
    };
    const key = Object.keys(map).find(k => category.toLowerCase().includes(k));
    return map[key] || '📚';
  };

  const getDifficultyColor = (difficulty = '') => {
    if (difficulty.toLowerCase() === 'beginner') return { bg: '#DCFCE7', color: '#15803D' };
    if (difficulty.toLowerCase() === 'intermediate') return { bg: '#FEF9C3', color: '#854D0E' };
    return { bg: '#FEE2E2', color: '#991B1B' };
  };

  return (
    <PublicLayout>
      <div style={{ minHeight: '70vh', padding: '0 clamp(20px, 5vw, 80px) 80px' }}>

        {/* Back link */}
        <div style={{ padding: '28px 0 0' }}>
          <Link
            to="/courses"
            style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            ← Back to catalog
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="public-course-error" style={{ marginTop: 24 }}>{error}</div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="public-course-state" style={{ marginTop: 40 }}>
            <strong>Loading course…</strong>
          </div>
        )}

        {/* Course content */}
        {course && (
          <div style={{ maxWidth: 900, margin: '0 auto', paddingTop: 40 }}>

            {/* Hero */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'start', marginBottom: 40 }}>
              <div>
                {/* Category + difficulty badges */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {course.category && (
                    <span className="badge badge-gray">{course.category}</span>
                  )}
                  {course.difficulty && (
                    <span
                      className="badge"
                      style={getDifficultyColor(course.difficulty)}
                    >
                      {course.difficulty}
                    </span>
                  )}
                  {course.isFree && (
                    <span className="badge badge-green">Free</span>
                  )}
                </div>

                {/* Title */}
                <h1 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  fontWeight: 800,
                  color: 'var(--text)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  marginBottom: 16
                }}>
                  {course.title}
                </h1>

                {/* Description */}
                <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.75, marginBottom: 28 }}>
                  {course.description || 'Build practical skills with a focused, structured learning experience.'}
                </p>

                {/* Skills tags */}
                {course.skills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                    {course.skills.map(skill => (
                      <span key={skill} className="badge badge-gray">{skill}</span>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    onClick={handleStart}
                    style={{
                      padding: '14px 28px',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
                  >
                    {isAuthenticated ? 'Open in Workspace →' : 'Start Learning →'}
                  </button>
                  {course.sourceUrl && (
                    <a
                      href={course.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '12px 24px',
                        border: '2px solid var(--border)',
                        borderRadius: 12,
                        color: 'var(--text)',
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      View Source ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Icon card */}
              <div style={{
                width: 140,
                height: 140,
                background: 'linear-gradient(135deg, var(--primary-xlight), var(--primary-light))',
                borderRadius: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 64,
                flexShrink: 0
              }}>
                {getCategoryEmoji(course.category)}
              </div>
            </div>

            {/* Meta cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
              {[
                { label: 'Duration', value: course.duration || 'Self-paced' },
                { label: 'Instructor', value: course.instructor || 'CodexCrue' },
                { label: 'Provider', value: course.provider || 'Open Source' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  padding: '20px 24px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 12,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 8 }}>
                    {label}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Sign up prompt for unauthenticated users */}
            {!isAuthenticated && (
              <div style={{
                padding: '32px 40px',
                background: 'var(--primary-xlight)',
                border: '1px solid var(--primary-light)',
                borderRadius: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 24,
                flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    Track this course in your learning path
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                    Create a free account to add this to your personalized path and track progress.
                  </p>
                </div>
                <Link
                  to="/register"
                  style={{
                    padding: '12px 24px',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Create Free Account
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

import React, { useState } from 'react';
import api from '../../services/api';

const signalLabels = {
  comment: 'Your comment',
  goal: 'Goal match',
  skill: 'Skills',
  quality: 'Course quality',
  timeFit: 'Time fit',
  preference: 'Level fit',
  prerequisite: 'Prerequisites',
  feedback: 'Feedback',
  language: 'Language fit'
};

function percentage(value) { return `${Math.round(Math.max(0, Math.min(1, Number(value || 0))) * 100)}%`; }

export default function RecommendationCard({ recommendation, onFeedbackSubmitted }) {
  const course = recommendation?.courseId || recommendation?.courseDetails || {};
  const signals = recommendation?.rankingSignals || {};
  const [feedbackState, setFeedbackState] = useState('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const visibleSignals = ['comment', 'goal', 'skill', 'quality', 'timeFit', 'language'].filter((key) => signals[key] !== undefined);
  const submitFeedback = async (sentiment, rating) => {
    if (!course?._id || feedbackState === 'saving') return;
    setFeedbackState('saving'); setFeedbackMessage('');
    try {
      await api.post('/feedback', { targetType: 'course', targetId: course._id, sentiment, rating });
      setFeedbackState('saved'); setFeedbackMessage('Saved - future recommendations will adapt.');
      window.dispatchEvent(new Event('recommendations-updated'));
      onFeedbackSubmitted?.();
    } catch (error) {
      setFeedbackState('idle'); setFeedbackMessage(error.response?.data?.message || 'Unable to save feedback.');
    }
  };
  return <article className="surface" style={{ padding: 18, display: 'grid', gap: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ minWidth: 0 }}>
        <div className="course-meta" style={{ marginTop: 0 }}><span className="tag">#{recommendation?.rank || 1}</span><span className="tag navy">{course.provider || 'Public course'}</span><span className="tag">{course.contentType || 'course'}</span><span className="tag">{course.language || 'en'}</span>{course.isFree && <span className="tag">Free</span>}</div>
        <h3 style={{ fontSize: 18, marginTop: 10 }}>{course.title || 'Recommended course'}</h3>
      </div>
      <div style={{ textAlign: 'right', flex: '0 0 auto' }}><div className="metric-value" style={{ fontSize: 25, marginTop: 0 }}>{percentage(recommendation?.score)}</div><div className="metric-label">match</div></div>
    </div>
    <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.55, margin: 0 }}>{recommendation?.explanation || 'Recommended from your learning profile.'}</p>
    {visibleSignals.length > 0 && <div style={{ display: 'grid', gap: 9 }}>{visibleSignals.map((key) => <div key={key}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}><span>{signalLabels[key]}</span><strong style={{ color: 'var(--ink)' }}>{percentage(signals[key])}</strong></div><div className="progress-track" style={{ height: 6 }}><div className="progress-fill" style={{ width: percentage(signals[key]) }} /></div></div>)}</div>}
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}><span className="metric-label">{course.duration || 'Self-paced'}{course.difficulty ? ` · ${course.difficulty}` : ''}</span>{course.sourceUrl ? <a className="button button-primary" href={course.sourceUrl} target="_blank" rel="noreferrer">Start course ↗</a> : course._id ? <a className="button button-ghost" href={`/courses/${course._id}`}>View course</a> : null}</div>
    {course._id && <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}><div className="metric-label">Improve this recommendation</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}><button className="button button-ghost" type="button" disabled={feedbackState === 'saving'} onClick={() => submitFeedback('relevant', 5)}>Useful</button><button className="button button-ghost" type="button" disabled={feedbackState === 'saving'} onClick={() => submitFeedback('not_relevant', 1)}>Not relevant</button><button className="button button-ghost" type="button" disabled={feedbackState === 'saving'} onClick={() => submitFeedback('too_easy', 3)}>Too easy</button><button className="button button-ghost" type="button" disabled={feedbackState === 'saving'} onClick={() => submitFeedback('too_difficult', 3)}>Too difficult</button></div>{feedbackMessage && <div className="metric-note" style={{ marginTop: 8, color: feedbackState === 'idle' ? 'var(--danger)' : 'var(--muted)' }}>{feedbackMessage}</div>}</div>}
  </article>;
}

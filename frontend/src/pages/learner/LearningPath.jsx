import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import AppShell from '../../components/common/AppShell';

const LearningPath = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [learningPath, setLearningPath] = useState(null);
  const [error, setError] = useState(null);
  const [showPlanner, setShowPlanner] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [trackingCourse, setTrackingCourse] = useState(null);

  // Form state for generating
  const [formData, setFormData] = useState({
    goalTitle: '',
    careerTarget: '',
    interests: '',
    weeklyHours: '',
    targetDate: '',
    language: 'English'
  });

  const trackingInterval = useRef(null);

  useEffect(() => {
    fetchData();
    return () => stopTracking();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, goalsRes, pathRes] = await Promise.all([
        api.get('/profile'),
        api.get('/goals'),
        api.get('/learning-path')
      ]);
      setProfile(profileRes.data?.data);
      setGoals(goalsRes.data?.data);
      setLearningPath(pathRes.data?.data);
      if (profileRes.data?.data) {
        setFormData(prev => ({
          ...prev,
          interests: profileRes.data.data.interests?.join(', ') || '',
          language: profileRes.data.data.language || 'English',
          goalTitle: profileRes.data.data.learningGoal || ''
        }));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load learning path data.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    try {
      await api.post('/learning-path/generate', formData);
      await fetchData();
      setShowPlanner(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate learning path. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const startTracking = (courseId, url) => {
    setTrackingCourse(courseId);
    if (url) window.open(url, '_blank');

    if (trackingInterval.current) clearInterval(trackingInterval.current);
    trackingInterval.current = setInterval(async () => {
      try {
        await api.post('/progress/session', { courseId });
      } catch (err) {
        console.error('Failed to track progress:', err);
      }
    }, 30000);
  };

  const stopTracking = () => {
    setTrackingCourse(null);
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="page-wrap"><p>Loading learning path...</p></div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="page-eyebrow">Your Roadmap</div>
            <h1 className="page-title">Learning Path</h1>
            <p className="page-subtitle">Your personalized journey to your learning goals.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setShowPlanner(!showPlanner)}>
            {showPlanner ? 'Hide Planner' : 'Show Planner'}
          </button>
        </div>

        {error && <div className="error-box" style={{ marginBottom: '1rem' }}>{error}</div>}
        {trackingCourse && (
          <div className="badge badge-green" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="path-phase-dot current"></span> Currently tracking study session. <button className="btn btn-sm btn-ghost" onClick={stopTracking}>Stop</button>
          </div>
        )}

        {showPlanner && (
          <div className="path-generate-form card" style={{ marginBottom: '2rem' }}>
            <div className="card-header"><h2 className="card-title">Generate New Path</h2></div>
            <form className="card-body" onSubmit={handleGenerate}>
              <div className="field">
                <label className="label">Goal Title</label>
                <input className="input" name="goalTitle" value={formData.goalTitle} onChange={handleInputChange} required />
              </div>
              <div className="field">
                <label className="label">Career Target</label>
                <input className="input" name="careerTarget" value={formData.careerTarget} onChange={handleInputChange} />
              </div>
              <div className="field">
                <label className="label">Interests (comma separated)</label>
                <input className="input" name="interests" value={formData.interests} onChange={handleInputChange} />
              </div>
              <div className="field" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label">Weekly Hours</label>
                  <input className="input" type="number" name="weeklyHours" value={formData.weeklyHours} onChange={handleInputChange} required />
                </div>
                <div>
                  <label className="label">Target Date</label>
                  <input className="input" type="date" name="targetDate" value={formData.targetDate} onChange={handleInputChange} required />
                </div>
                <div>
                  <label className="label">Language</label>
                  <input className="input" name="language" value={formData.language} onChange={handleInputChange} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={generating}>
                {generating ? 'Generating...' : 'Generate Learning Path'}
              </button>
            </form>
          </div>
        )}

        {learningPath ? (
          <div>
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div className="card-body">
                <h2 className="card-title">{learningPath.goalTitle || 'Your Learning Path'}</h2>
                <p>Estimated Duration: {learningPath.estimatedDuration || 'N/A'}</p>
                <div className="progress-bar" style={{ marginTop: '1rem' }}>
                  <div className="progress-fill" style={{ width: `${learningPath.overallProgress || 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="path-timeline">
              {(learningPath.milestones || []).map((milestone, idx) => {
                const statusClass = milestone.status === 'completed' ? 'done' : milestone.status === 'in-progress' ? 'current' : 'locked';
                return (
                  <div key={milestone._id || idx} className="path-phase" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div className={`path-phase-dot ${statusClass}`} style={{ width: '16px', height: '16px', borderRadius: '50%', background: statusClass === 'done' ? '#16A34A' : statusClass === 'current' ? '#3B82F6' : '#E5E7EB', flexShrink: 0, marginTop: '5px' }}></div>
                    <div className="path-phase-card card" style={{ flexGrow: 1 }}>
                      <div className="path-phase-header card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <h3 className="path-phase-title">{milestone.title}</h3>
                          <div className="path-phase-meta" style={{ fontSize: '0.9rem', color: '#6B7280' }}>Duration: {milestone.duration || 'N/A'}</div>
                        </div>
                        <div className={`badge badge-${statusClass === 'done' ? 'green' : 'gray'}`}>{milestone.status || 'locked'}</div>
                      </div>
                      <div className="path-phase-body card-body">
                        <div className="progress-bar" style={{ marginBottom: '1rem' }}>
                          <div className="progress-fill" style={{ width: `${milestone.progress || 0}%` }}></div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>Skills:</strong> {(milestone.skills || []).map(skill => <span key={skill} className="badge badge-gray" style={{ marginLeft: '0.5rem' }}>{skill}</span>)}
                        </div>
                        {milestone.objectives && milestone.objectives.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <strong>Objectives:</strong>
                            <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                              {milestone.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                            </ul>
                          </div>
                        )}
                        {milestone.courses && milestone.courses.length > 0 && (
                          <div>
                            <strong>Courses:</strong>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '0.5rem' }}>
                              {milestone.courses.map((course, i) => {
                                const cId = course.courseId?._id || course.courseId;
                                const cTitle = course.courseId?.title || course.title || 'Course';
                                const cProvider = course.courseId?.provider || course.provider || 'Provider';
                                const cLang = course.courseId?.language || 'EN';
                                const cType = course.courseId?.contentType || 'Course';
                                return (
                                  <div key={i} className="path-course-item" style={{ padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="path-course-info">
                                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                        <span className="badge">{cType}</span>
                                        <span className="badge badge-gray">{cLang}</span>
                                      </div>
                                      <div style={{ fontWeight: '600' }}>{cTitle}</div>
                                      <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>{cProvider} • {course.duration || 'Flexible'}</div>
                                    </div>
                                    <button className="btn btn-sm btn-primary" onClick={() => startTracking(cId, course.sourceUrl || course.courseId?.sourceUrl)}>
                                      Start & Track
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>You don't have a learning path yet.</p>
            <button className="btn btn-primary" onClick={() => setShowPlanner(true)}>Create One Now</button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default LearningPath;

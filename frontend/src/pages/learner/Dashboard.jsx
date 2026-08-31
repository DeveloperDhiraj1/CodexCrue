import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import AppShell from '../../components/common/AppShell';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [learningPath, setLearningPath] = useState(null);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          profileRes,
          goalsRes,
          recRes,
          pathRes,
          progRes
        ] = await Promise.allSettled([
          api.get('/profile'),
          api.get('/goals'),
          api.get('/recommendations'),
          api.get('/learning-path'),
          api.get('/progress')
        ]);

        let loadedProfile = null;
        if (profileRes.status === 'fulfilled') {
          loadedProfile = profileRes.value.data?.data;
          setProfile(loadedProfile);
        }

        if (loadedProfile && loadedProfile.isOnboarded === false) {
          navigate('/onboarding');
          return;
        }

        if (goalsRes.status === 'fulfilled') setGoals(goalsRes.value.data?.data || []);
        if (recRes.status === 'fulfilled') setRecommendations(recRes.value.data?.data || []);
        if (pathRes.status === 'fulfilled') setLearningPath(pathRes.value.data?.data || null);
        if (progRes.status === 'fulfilled') setProgress(progRes.value.data?.data || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <AppShell>
        <div className="page-wrap">
          <p>Loading dashboard...</p>
        </div>
      </AppShell>
    );
  }

  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Learner';
  const currentGoal = profile?.learningGoal || 'Set your goal';
  const overallProgress = learningPath?.overallProgress || 0;
  const completedCoursesCount = profile?.completedCourses?.length || 0;
  
  const milestones = learningPath?.milestones || [];
  const nextMilestones = milestones.slice(0, 3);
  
  const topRecommendations = recommendations.slice(0, 2);

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="dashboard-welcome card">
          <div className="card-header">
            <h1 className="page-title">Good morning, {firstName}!</h1>
            <div className="welcome-goal badge badge-green">{currentGoal}</div>
          </div>
          <div className="card-body">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${overallProgress}%` }}></div>
            </div>
            <p className="page-subtitle">You are {overallProgress}% towards your current goal.</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" onClick={() => navigate('/learning-path')}>
                Continue Learning
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/recommendations')}>
                View Recommendations
              </button>
            </div>
          </div>
        </div>

        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', margin: '2rem 0' }}>
          <div className="card">
            <div className="card-body">
              <div className="page-eyebrow">Path Progress</div>
              <div className="page-title">{overallProgress}%</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="page-eyebrow">Courses Completed</div>
              <div className="page-title">{completedCoursesCount}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="page-eyebrow">Current Goal</div>
              <div className="page-title" style={{ fontSize: '1.25rem' }}>{currentGoal}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="page-eyebrow">Recommended</div>
              <div className="page-title">{recommendations.length}</div>
            </div>
          </div>
        </div>

        <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Your Learning Path</h2>
            </div>
            <div className="card-body">
              {nextMilestones.length > 0 ? (
                <div>
                  {nextMilestones.map((milestone, idx) => (
                    <div key={milestone._id || idx} className="milestone-item" style={{ marginBottom: '1rem' }}>
                      <div className="page-eyebrow">Milestone {idx + 1}</div>
                      <div className="page-title" style={{ fontSize: '1.1rem' }}>{milestone.title}</div>
                      <p className="page-subtitle">{milestone.skills?.join(', ')}</p>
                      <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                        <div className="progress-fill" style={{ width: `${milestone.progress || 0}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No active learning path.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/learning-path')}>
                    Generate your path
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recommended for You</h2>
            </div>
            <div className="card-body">
              {topRecommendations.length > 0 ? (
                <div>
                  {topRecommendations.map((rec, idx) => {
                    const course = typeof rec.courseId === 'object' ? rec.courseId : null;
                    const title = course?.title || rec.courseTitle || 'Course';
                    const provider = course?.provider || rec.provider || 'Provider';
                    const scorePct = Math.round((rec.score || 0) * 100);
                    return (
                      <div key={rec._id || idx} className="rec-card" style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                        <h3 className="rec-title" style={{ margin: '0 0 0.25rem 0' }}>{title}</h3>
                        <p className="page-subtitle" style={{ margin: '0 0 0.5rem 0' }}>{provider}</p>
                        <div className="badge badge-green" style={{ marginBottom: '0.5rem' }}>{scorePct}% Match</div>
                        <p style={{ fontSize: '0.9rem' }}>{rec.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No recommendations currently available.</p>
                  <button className="btn btn-secondary" onClick={() => navigate('/recommendations')}>
                    Get Recommendations
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2 className="card-title">What's next?</h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Link to="/skill-gap" className="quick-link btn btn-ghost">Skill Gap</Link>
            <Link to="/ai-assistant" className="quick-link btn btn-ghost">AI Assistant</Link>
            <Link to="/assessments" className="quick-link btn btn-ghost">Assessments</Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;

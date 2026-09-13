import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import AppShell from '../../components/common/AppShell';

function getTimeGreeting(date) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [learningPath, setLearningPath] = useState(null);
  const [progress, setProgress] = useState([]);
  const [currentTime, setCurrentTime] = useState(() => new Date());

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

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="page-wrap">
          <p>Loading dashboard...</p>
        </div>
      </AppShell>
    );
  }

  const firstName = (profile?.userId?.name || profile?.name || authUser?.name || authUser?.displayName || 'Learner').trim().split(/\s+/)[0];
  const greeting = getTimeGreeting(currentTime);
  const currentGoal = profile?.learningGoal || 'Set your goal';
  const overallProgress = learningPath?.overallProgress || 0;
  const completedCoursesCount = profile?.completedCourses?.length || 0;
  
  const milestones = learningPath?.milestones || [];
  const nextMilestones = milestones.slice(0, 3);
  const topRecommendations = recommendations.slice(0, 2);
  const activeMilestone = nextMilestones[0];
  const progressValue = Math.min(100, Math.max(0, Number(overallProgress) || 0));

  return (
    <AppShell>
      <div className="page-wrap dashboard-page">
        <div className="dashboard-heading">
          <div>
            <span className="page-eyebrow">Your learning cockpit</span>
            <h1 className="page-title">Ready for your next win?</h1>
            <p className="page-subtitle">A clear view of your progress, next lesson, and personalised recommendations.</p>
          </div>
          <span className="dashboard-date">{currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>

        <section className="dashboard-welcome dashboard-hero">
          <div className="dashboard-hero-copy">
            <span className="welcome-goal">Current focus · {currentGoal}</span>
            <h2>{greeting}, {firstName}!</h2>
            <p>{progressValue === 0 ? 'Start with one small step today and build your learning momentum.' : `You are ${progressValue}% through your current learning path. Keep the streak going.`}</p>
            <div className="welcome-actions">
              <button className="welcome-btn welcome-btn-white" onClick={() => navigate('/learning-path')}>
                {progressValue > 0 ? 'Continue learning' : 'Build my path'} <span aria-hidden="true">→</span>
              </button>
              <button className="welcome-btn welcome-btn-outline" onClick={() => navigate('/recommendations')}>
                Explore courses
              </button>
            </div>
          </div>
          <div className="dashboard-progress-ring" style={{ '--progress': `${progressValue * 3.6}deg` }} aria-label={`${progressValue}% path progress`}>
            <div className="dashboard-progress-ring-inner">
              <strong>{progressValue}%</strong>
              <span>path done</span>
            </div>
          </div>
        </section>

        <section className="stats-grid dashboard-stats" aria-label="Learning summary">
          <div className="stat-card dashboard-stat-card"><span className="dashboard-stat-icon dashboard-stat-icon-green">↗</span><div><div className="stat-label">Path progress</div><div className="stat-value">{progressValue}%</div><div className="stat-note">Keep moving forward</div></div></div>
          <div className="stat-card dashboard-stat-card"><span className="dashboard-stat-icon dashboard-stat-icon-blue">✓</span><div><div className="stat-label">Courses completed</div><div className="stat-value">{completedCoursesCount}</div><div className="stat-note">Nice work so far</div></div></div>
          <div className="stat-card dashboard-stat-card"><span className="dashboard-stat-icon dashboard-stat-icon-orange">◎</span><div><div className="stat-label">Active goals</div><div className="stat-value">{goals.length || (currentGoal !== 'Set your goal' ? 1 : 0)}</div><div className="stat-note">One step at a time</div></div></div>
          <div className="stat-card dashboard-stat-card"><span className="dashboard-stat-icon dashboard-stat-icon-purple">✦</span><div><div className="stat-label">For you</div><div className="stat-value">{recommendations.length}</div><div className="stat-note">Fresh recommendations</div></div></div>
        </section>

        <div className="dash-grid dashboard-content-grid">
          <section className="card dashboard-panel">
            <div className="dashboard-panel-heading"><div><span className="page-eyebrow">Roadmap</span><h2 className="card-title">Your learning path</h2></div><Link to="/learning-path" className="dashboard-text-link">View full path →</Link></div>
            {nextMilestones.length > 0 ? <div className="dashboard-milestones">
              {nextMilestones.map((milestone, idx) => <div key={milestone._id || idx} className={`dashboard-milestone ${idx === 0 ? 'is-current' : ''}`}>
                <div className="dashboard-milestone-number">{idx + 1}</div>
                <div className="dashboard-milestone-content"><div className="dashboard-milestone-top"><strong>{milestone.title}</strong>{idx === 0 && <span className="badge badge-green">Up next</span>}</div><p>{milestone.skills?.slice(0, 3).join(' · ') || 'Build practical skills'}</p><div className="progress-bar"><div className="progress-fill" style={{ width: `${milestone.progress || 0}%` }}></div></div></div><span className="dashboard-milestone-percent">{milestone.progress || 0}%</span>
              </div>)}
            </div> : <div className="dashboard-empty"><span className="dashboard-empty-icon">✦</span><strong>Your path starts here</strong><p>Create a roadmap matched to your goals, skills, and available time.</p><button className="btn btn-primary" onClick={() => navigate('/learning-path')}>Generate my path</button></div>}
            {activeMilestone && <button className="dashboard-next-lesson" onClick={() => navigate('/learning-path')}><span>Next best action</span><strong>Continue with {activeMilestone.title}</strong><span aria-hidden="true">→</span></button>}
          </section>

          <section className="card dashboard-panel">
            <div className="dashboard-panel-heading"><div><span className="page-eyebrow">Curated for you</span><h2 className="card-title">Recommended courses</h2></div><Link to="/recommendations" className="dashboard-text-link">See all →</Link></div>
            {topRecommendations.length > 0 ? <div className="dashboard-recommendations">
              {topRecommendations.map((rec, idx) => { const course = typeof rec.courseId === 'object' ? rec.courseId : null; const title = course?.title || rec.courseTitle || 'Course'; const provider = course?.provider || rec.provider || 'Provider'; const scorePct = Math.round((rec.score || 0) * 100); return <div key={rec._id || idx} className="dashboard-recommendation"><div className="dashboard-course-mark">{title.charAt(0).toUpperCase()}</div><div className="dashboard-course-info"><strong>{title}</strong><span>{provider}</span><small>{rec.explanation || 'Selected to support your learning goal.'}</small></div><span className="dashboard-match">{scorePct}%<small>match</small></span></div>; })}
            </div> : <div className="dashboard-empty"><span className="dashboard-empty-icon">✦</span><strong>Recommendations are on the way</strong><p>Complete your profile or generate a path to unlock better matches.</p><button className="btn btn-secondary" onClick={() => navigate('/recommendations')}>Find courses</button></div>}
          </section>
        </div>

        <section className="dashboard-quick-section"><div className="dashboard-panel-heading"><div><span className="page-eyebrow">Keep growing</span><h2 className="card-title">Quick actions</h2></div></div><div className="dashboard-quick-grid"><Link to="/skill-gap" className="dashboard-quick-card"><span className="dashboard-quick-icon">⌁</span><span><strong>Check skill gaps</strong><small>See what to learn next</small></span><span>→</span></Link><Link to="/ai-assistant" className="dashboard-quick-card"><span className="dashboard-quick-icon">✦</span><span><strong>Ask your mentor</strong><small>Get unstuck in minutes</small></span><span>→</span></Link><Link to="/assessments" className="dashboard-quick-card"><span className="dashboard-quick-icon">✓</span><span><strong>Take an assessment</strong><small>Measure your progress</small></span><span>→</span></Link></div></section>
      </div>
    </AppShell>
  );
};

export default Dashboard;

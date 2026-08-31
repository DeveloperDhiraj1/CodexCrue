import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import AppShell from '../../components/common/AppShell';

const MyLearning = () => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('in-progress'); // 'in-progress' | 'completed'

  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        const [progressRes, profileRes] = await Promise.all([
          api.get('/progress'),
          api.get('/profile')
        ]);
        
        setProgressData(progressRes.data?.data || []);
        
        // Sometimes profile returns completed courses as an array of IDs or populated objects
        setCompletedCourses(profileRes.data?.data?.completedCourses || []);
      } catch (err) {
        console.error('Error fetching learning data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, []);

  const handleAction = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="page-wrap"><p>Loading your learning data...</p></div>
      </AppShell>
    );
  }

  // Filter progress for in-progress only if they aren't explicitly marked as completed
  const inProgressCourses = progressData.filter(p => p.status !== 'completed');
  
  // Note: completed courses might be in progressData with status='completed' AND/OR in profile.completedCourses.
  // We'll combine them robustly if needed, but for now we'll just show what's in progressData with status='completed' 
  // plus anything in the profile array.
  
  const renderCourseCard = (item, isCompleted) => {
    const course = typeof item.courseId === 'object' ? item.courseId : null;
    if (!course) return null; // Can't render without course details

    const title = course.title || 'Unknown Course';
    const provider = course.provider || 'Unknown Provider';
    const url = course.sourceUrl;
    const progressPct = isCompleted ? 100 : (item.completionPercentage || 0);
    const studyMinutes = item.studyMinutes || 0;

    return (
      <div key={item._id || course._id} className="course-card card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="course-card-cover" style={{ height: '120px', backgroundColor: '#F3F4F6', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           {/* Placeholder for course image */}
           <span style={{ color: '#9CA3AF', fontSize: '2rem' }}>📚</span>
        </div>
        <div className="course-card-body card-body" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{title}</h3>
          <p className="page-subtitle" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{provider}</p>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <span>{progressPct}% Complete</span>
              <span>{studyMinutes} mins studied</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPct}%`, backgroundColor: isCompleted ? '#16A34A' : '#3B82F6' }}></div>
            </div>
          </div>
          
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <button 
              className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`} 
              style={{ width: '100%' }}
              onClick={() => handleAction(url)}
            >
              {isCompleted ? 'Review Course' : 'Continue Learning'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-header">
          <div className="page-eyebrow">Your Library</div>
          <h1 className="page-title">My Learning</h1>
          <p className="page-subtitle">Track your ongoing courses and review completed ones.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #E5E7EB', marginBottom: '2rem' }}>
          <button 
            style={{ 
              padding: '0.75rem 1rem', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'in-progress' ? '2px solid #16A34A' : '2px solid transparent',
              color: activeTab === 'in-progress' ? '#111827' : '#6B7280',
              fontWeight: activeTab === 'in-progress' ? '600' : '400',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('in-progress')}
          >
            In Progress ({inProgressCourses.length})
          </button>
          <button 
            style={{ 
              padding: '0.75rem 1rem', 
              background: 'none', 
              border: 'none', 
              borderBottom: activeTab === 'completed' ? '2px solid #16A34A' : '2px solid transparent',
              color: activeTab === 'completed' ? '#111827' : '#6B7280',
              fontWeight: activeTab === 'completed' ? '600' : '400',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>

        {activeTab === 'in-progress' && (
          <div>
            {inProgressCourses.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {inProgressCourses.map(p => renderCourseCard(p, false))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You aren't tracking any courses right now.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            {/* Combine explicit completed progress records and completed courses from profile. 
                In a real app we'd deduplicate, but here we just render what we found. */}
            {progressData.filter(p => p.status === 'completed').length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {progressData.filter(p => p.status === 'completed').map(p => renderCourseCard(p, true))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't completed any courses yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default MyLearning;

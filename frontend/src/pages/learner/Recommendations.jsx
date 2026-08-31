import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppShell from '../../components/common/AppShell';

const Recommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recommendations');
      setRecommendations(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleStartLearning = (url) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert("No course URL provided.");
    }
  };

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="page-eyebrow">For You</div>
            <h1 className="page-title">Personalized Recommendations</h1>
            <p className="page-subtitle">Courses matched to your goal and skills using AI + ML.</p>
          </div>
          <button className="btn btn-ghost" onClick={fetchRecommendations} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="rec-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="card rec-full-card" style={{ padding: '1.5rem', opacity: 0.5 }}>
                <div style={{ width: '40px', height: '24px', backgroundColor: '#E5E7EB', borderRadius: '12px', marginBottom: '1rem' }}></div>
                <div style={{ width: '80%', height: '24px', backgroundColor: '#E5E7EB', marginBottom: '0.5rem', borderRadius: '4px' }}></div>
                <div style={{ width: '50%', height: '16px', backgroundColor: '#E5E7EB', marginBottom: '1rem', borderRadius: '4px' }}></div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', marginBottom: '1rem', borderRadius: '4px' }}></div>
                <div style={{ width: '100%', height: '60px', backgroundColor: '#E5E7EB', borderRadius: '4px' }}></div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="rec-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {recommendations.map((rec, idx) => {
              const course = typeof rec.courseId === 'object' ? rec.courseId : null;
              const title = course?.title || rec.courseTitle || 'Unknown Course';
              const provider = course?.provider || rec.provider || 'Unknown Provider';
              const scorePct = Math.round((rec.score || 0) * 100);
              const skills = course?.skills || rec.skills || [];
              const sourceUrl = course?.sourceUrl || rec.sourceUrl;

              return (
                <div key={rec._id || idx} className="card rec-full-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="card-body" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="rec-rank badge badge-gray" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>
                      #{rec.rank || (idx + 1)}
                    </div>
                    
                    <h2 className="rec-full-title card-title" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                      {title}
                    </h2>
                    <p className="rec-full-provider page-subtitle" style={{ marginBottom: '1rem' }}>
                      {provider}
                    </p>

                    <div className="rec-match-score" style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>
                        <span>Match Score</span>
                        <span className="rec-match-pct" style={{ color: '#16A34A' }}>{scorePct}%</span>
                      </div>
                      <div className="rec-match-bar progress-bar">
                        <div className="rec-match-fill progress-fill" style={{ width: `${scorePct}%`, backgroundColor: '#16A34A' }}></div>
                      </div>
                    </div>

                    <p className="rec-explanation" style={{ fontSize: '0.95rem', color: '#4B5563', marginBottom: '1rem', flexGrow: 1 }}>
                      {rec.explanation}
                    </p>

                    {skills.length > 0 && (
                      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {skills.map((s, i) => (
                          <span key={i} className="badge badge-gray">{s}</span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ flex: 1 }}
                        onClick={() => handleStartLearning(sourceUrl)}
                      >
                        Start Learning
                      </button>
                      <button 
                        className="btn btn-ghost"
                        style={{ flex: 1 }}
                        onClick={() => navigate('/learning-path')}
                      >
                        Add to Path
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ marginBottom: '1rem' }}>No recommendations yet. Complete your profile to get personalized matches.</p>
            <button className="btn btn-primary" onClick={() => navigate('/profile')}>
              Update Profile
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Recommendations;

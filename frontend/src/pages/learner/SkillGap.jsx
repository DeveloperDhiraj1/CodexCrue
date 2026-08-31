import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppShell from '../../components/common/AppShell';

const SkillGap = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [gapData, setGapData] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchSkillGap = async () => {
      try {
        const [gapRes, profileRes] = await Promise.all([
          api.get('/skills/gap'),
          api.get('/profile')
        ]);
        setGapData(gapRes.data?.data);
        setProfile(profileRes.data?.data);
      } catch (err) {
        console.error('Error fetching skill gap:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkillGap();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="page-wrap"><p>Analyzing skills...</p></div>
      </AppShell>
    );
  }

  const goal = gapData?.goal || profile?.learningGoal || 'Unknown Role';
  const matchPercentage = gapData?.matchPercentage || 0;
  const matchedSkills = gapData?.matchedSkills || [];
  const missingSkills = gapData?.missingSkills || [];

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-header">
          <div className="page-eyebrow">Readiness Map</div>
          <h1 className="page-title">Skill Gap Analysis</h1>
          <p className="page-subtitle">Understand how your current skills align with your target role.</p>
        </div>

        <div className="skill-gap-overview" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div className="overview-card card">
            <div className="card-body">
              <div className="overview-label page-eyebrow">Target Role</div>
              <div className="overview-value page-title" style={{ fontSize: '1.25rem' }}>{goal}</div>
            </div>
          </div>
          <div className="overview-card card">
            <div className="card-body">
              <div className="overview-label page-eyebrow">Match %</div>
              <div className="overview-value green page-title" style={{ fontSize: '1.25rem', color: '#16A34A' }}>{matchPercentage}%</div>
              <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                <div className="progress-fill" style={{ width: `${matchPercentage}%`, backgroundColor: '#16A34A' }}></div>
              </div>
            </div>
          </div>
          <div className="overview-card card">
            <div className="card-body">
              <div className="overview-label page-eyebrow">Priority Gaps</div>
              <div className="overview-value page-title" style={{ fontSize: '1.25rem' }}>{missingSkills.length}</div>
            </div>
          </div>
        </div>

        <div className="skills-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Your Strengths</h2>
            </div>
            <div className="card-body">
              {matchedSkills.length > 0 ? (
                <div className="skill-tag-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {matchedSkills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="skill-tag-green badge badge-green" 
                      style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      onClick={() => navigate(`/courses?skill=${encodeURIComponent(skill)}`)}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No matched skills found for this role yet.</p>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Skills to Build</h2>
            </div>
            <div className="card-body">
              {missingSkills.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {missingSkills.map((skill, idx) => (
                    <div key={idx} className="skill-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #eee' }}>
                      <span className="skill-name skill-tag-red" style={{ fontWeight: '500', color: '#DC2626' }}>{skill}</span>
                      <button 
                        className="btn btn-sm btn-ghost" 
                        onClick={() => navigate(`/courses?skill=${encodeURIComponent(skill)}`)}
                      >
                        Find Course
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>You have all the required skills for this role!</p>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/learning-path')}>
            Generate Learning Path
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default SkillGap;

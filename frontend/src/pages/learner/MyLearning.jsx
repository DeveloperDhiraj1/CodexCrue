import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppShell from '../../components/common/AppShell';

const getCourseThumbnail = (course) => {
  if (course?.thumbnail || course?.thumbnailUrl || course?.imageUrl) return course.thumbnail || course.thumbnailUrl || course.imageUrl;
  const match = String(course?.sourceUrl || '').match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/i);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
};

const MyLearning = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [activeTab, setActiveTab] = useState('in-progress');

  useEffect(() => {
    Promise.all([api.get('/progress'), api.get('/profile')])
      .then(([progressRes]) => setProgressData(progressRes.data?.data || []))
      .catch((err) => console.error('Error fetching learning data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppShell><div className="page-wrap"><div className="learning-loading">Loading your learning data...</div></div></AppShell>;

  const inProgressCourses = progressData.filter((item) => item.status !== 'completed');
  const completedCourses = progressData.filter((item) => item.status === 'completed');
  const visibleCourses = activeTab === 'in-progress' ? inProgressCourses : completedCourses;

  const renderCourseCard = (item, isCompleted) => {
    const course = typeof item.courseId === 'object' ? item.courseId : null;
    if (!course?._id) return null;
    const progress = isCompleted ? 100 : Math.min(100, Math.max(0, item.completionPercentage || 0));
    const skills = course.skills?.slice(0, 3) || [];
    const thumbnail = getCourseThumbnail(course);
    return <article className="learning-course-card" key={item._id || course._id}>
      <div className={`learning-course-cover ${thumbnail ? 'has-thumbnail' : ''}`}>{thumbnail ? <img src={thumbnail} alt={`${course.title} thumbnail`} /> : <span>{course.title?.charAt(0)?.toUpperCase() || 'C'}</span>}<small>{course.contentType || 'COURSE'}</small></div>
      <div className="learning-course-body">
        <div className="learning-course-topline"><span>{course.provider || 'CodexCrue'}</span><span className={`learning-status ${isCompleted ? 'complete' : 'active'}`}>{isCompleted ? 'Completed' : 'In progress'}</span></div>
        <h2>{course.title || 'Untitled course'}</h2>
        <p className="learning-course-description">{course.description || 'Continue building practical skills with this learning resource.'}</p>
        {skills.length > 0 && <div className="learning-tech-stack"><span className="learning-tech-label">Technology</span><div>{skills.map((skill) => <span className="learning-tech-tag" key={skill}>{skill}</span>)}</div></div>}
        <div className="learning-progress-head"><span>Your progress</span><strong>{progress}%</strong></div>
        <div className="learning-progress-track"><div className={`learning-progress-fill ${isCompleted ? 'complete' : ''}`} style={{ width: `${progress}%` }} /></div>
        <div className="learning-card-footer"><span>{Number(item.timeSpentHours || 0).toFixed(1)} hours studied</span><button className={`learning-card-button ${isCompleted ? 'secondary' : ''}`} onClick={() => navigate(`/courses/${course._id}`)}>{isCompleted ? 'Review course →' : 'Continue learning →'}</button></div>
      </div>
    </article>;
  };

  return <AppShell><div className="page-wrap learning-library-page">
    <div className="learning-library-header"><div><div className="page-eyebrow">Your library</div><h1 className="page-title">My Learning</h1><p className="page-subtitle">Pick up where you left off and keep your momentum going.</p></div><div className="learning-library-summary"><strong>{progressData.length}</strong><span>courses saved</span></div></div>
    <div className="learning-tabs" role="tablist"><button className={activeTab === 'in-progress' ? 'active' : ''} onClick={() => setActiveTab('in-progress')}>In progress <span>{inProgressCourses.length}</span></button><button className={activeTab === 'completed' ? 'active' : ''} onClick={() => setActiveTab('completed')}>Completed <span>{completedCourses.length}</span></button></div>
    {visibleCourses.length > 0 ? <div className="learning-course-grid">{visibleCourses.map((item) => renderCourseCard(item, activeTab === 'completed'))}</div> : <div className="learning-empty"><div className="learning-empty-icon">✦</div><h2>{activeTab === 'in-progress' ? 'Your learning shelf is waiting' : 'No completed courses yet'}</h2><p>{activeTab === 'in-progress' ? 'Start a course from the catalog and it will appear here.' : 'Keep learning—completed courses will collect here.'}</p><button className="button button-primary" onClick={() => navigate('/courses')}>Explore courses →</button></div>}
  </div></AppShell>;
};

export default MyLearning;

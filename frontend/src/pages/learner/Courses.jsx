import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../../components/common/AppShell';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';

const getCategoryEmoji = (category) => {
  const map = {
    python: '🐍', javascript: '🟡', web: '🌐', ml: '🧠',
    ai: '🧠', data: '📊', design: '🎨', cloud: '☁️',
    mobile: '📱', security: '🔒', devops: '⚙️', default: '📚'
  };
  const key = Object.keys(map).find(k => category.toLowerCase().includes(k));
  return map[key] || map.default;
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const query = useDebounce(search, 300);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    api.get('/courses', { params: { search: query, limit: 24 } })
      .then(r => {
        if (active) setCourses(r.data.data || []);
      })
      .catch(e => {
        if (active) setError(e.response?.data?.message || 'Unable to load courses.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [query]);

  return (
    <AppShell>
      <div className="page-wrap">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="page-eyebrow">The Catalog</div>
            <h1 className="page-title">Find your next course.</h1>
            <p className="page-subtitle">Every course listed is free and publicly available online.</p>
          </div>
          <input 
            className="courses-search" 
            style={{ maxWidth: 280 }} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search courses…" 
          />
        </div>
        
        {error && <div className="error-box" style={{ marginBottom: 18 }}>{error}</div>}
        
        {loading ? (
          <div className="public-course-state">Loading the catalog…</div>
        ) : courses.length ? (
          <div className="public-course-grid">
            {courses.map(course => (
              <article className="public-course-card" key={course._id}>
                <div className="public-course-cover">
                  {getCategoryEmoji(course.category || course.provider || '')}
                </div>
                <div className="public-course-body">
                  <div className="public-course-meta-row">
                    <span className="badge badge-gray">{course.difficulty || 'All levels'}</span>
                    {course.isFree && <span className="badge badge-green">Free</span>}
                    {course.duration && <span className="badge badge-gray">{course.duration}</span>}
                  </div>
                  <h3>{course.title}</h3>
                  <p>{course.description || 'Build practical skills with a focused learning experience.'}</p>
                  <div className="public-course-skills">
                    {(course.skills || []).slice(0, 3).map(skill => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                  <div className="public-course-actions">
                    {course.sourceUrl ? (
                      <a href={course.sourceUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                        Start Course
                      </a>
                    ) : (
                      <Link to={`/courses/${course._id}`} className="btn btn-primary btn-sm">
                        View Course
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="public-course-state">No courses found. Try a different search.</div>
        )}
      </div>
    </AppShell>
  );
}

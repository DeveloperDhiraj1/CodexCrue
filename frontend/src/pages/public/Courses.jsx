import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PublicLayout from '../../components/public/PublicLayout';
import AuthPrompt from '../../components/public/AuthPrompt';
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

export default function PublicCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promptPath, setPromptPath] = useState(null);

  const query = useDebounce(search, 300);
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get('/courses', { params: { search: query, limit: 24 } })
      .then((response) => {
        if (active) setCourses(response.data.data || []);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Unable to load courses.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    
    return () => { active = false; };
  }, [query]);

  const start = (id) => {
    if (isAuthenticated) {
      navigate(`/courses/${id}`);
    } else {
      setPromptPath(`/courses/${id}`);
    }
  };

  return (
    <PublicLayout>
      <section className="public-courses-page">
        <div className="page-eyebrow">The Catalog</div>
        <h1>Explore courses with a clear next step.</h1>
        <p>Browse free learning resources by topic, difficulty and skills. Create an account to add courses to your personal path.</p>
        
        <div className="courses-search-row">
          <input
            className="courses-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses…"
            aria-label="Search courses"
          />
        </div>
        
        {error && <div className="public-course-error">{error}</div>}
        
        {loading ? (
          <div className="public-course-state">
            <strong>Loading courses…</strong>
          </div>
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
                    <Link className="btn btn-ghost btn-sm" to={`/courses/${course._id}`}>
                      Details
                    </Link>
                    <button className="btn btn-primary btn-sm" onClick={() => start(course._id)}>
                      Start Learning →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="public-course-state">
            <strong>No courses found</strong>
            Try a different search term.
          </div>
        )}
      </section>
      
      {promptPath && <AuthPrompt path={promptPath} onClose={() => setPromptPath(null)} />}
    </PublicLayout>
  );
}

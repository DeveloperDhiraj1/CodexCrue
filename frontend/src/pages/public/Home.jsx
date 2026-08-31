import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PublicLayout from '../../components/public/PublicLayout';

const Home = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard'); // or /learning-path as requested for primary
    } else {
      navigate('/register');
    }
  };

  return (
    <PublicLayout>
      <div className="home">
        
        {/* 1. HERO */}
        <section className="home-hero public-container">
          <div className="home-hero-content">
            <div className="home-kicker">
              <span className="home-kicker-dot"></span> AI-Powered Learning Platform
            </div>
            <h1>
              Your learning journey,<br />
              <em>personalized.</em>
            </h1>
            <p>
              Tell CodexCrue what you want to become. We analyze your skills, find the gaps, and build a personalized path to get you there.—using free resources.
            </p>
            <div className="home-hero-actions">
              <button 
                onClick={() => navigate(isAuthenticated ? '/learning-path' : '/register')} 
                className="home-cta-primary"
              >
                Build My Learning Path
              </button>
              <Link to="/courses" className="home-cta-secondary">
                Explore Courses
              </Link>
            </div>
            <div className="home-trust">
              <span>✓ Free resources</span>
              <span>·</span>
              <span>✓ AI-powered</span>
              <span>·</span>
              <span>✓ Personalized path</span>
            </div>
          </div>

          <div className="home-visual">
            <div className="path-diagram">
              <div className="path-diagram-title">Your personalized journey</div>
              
              <div className="path-step">
                <div className="path-step-icon active">🎯</div>
                <div className="path-step-content">Goal Setting</div>
              </div>
              <div className="path-connector"></div>
              
              <div className="path-step">
                <div className="path-step-icon">🔍</div>
                <div className="path-step-content">Skill Analysis</div>
              </div>
              <div className="path-connector"></div>
              
              <div className="path-step">
                <div className="path-step-icon">✨</div>
                <div className="path-step-content">AI Recommendations</div>
              </div>
              <div className="path-connector"></div>
              
              <div className="path-step">
                <div className="path-step-icon">📚</div>
                <div className="path-step-content">Learning Path</div>
              </div>
              <div className="path-connector"></div>
              
              <div className="path-step">
                <div className="path-step-icon">📈</div>
                <div className="path-step-content">Progress & Growth</div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. HOW IT WORKS */}
        <section id="how-it-works" className="home-section alt">
          <div className="public-container">
            <div className="section-label">The Process</div>
            <h2 className="section-heading">
              Three steps to <em>your goal</em>
            </h2>
            <p className="section-sub">
              CodexCrue turns your ambition into a structured, achievable learning journey.
            </p>
            
            <div className="how-grid">
              <div className="how-step">
                <div className="how-step-num">1</div>
                <h3>Step 1 — Tell us your goal</h3>
                <p>Share what you want to become and your current skills. Takes less than 3 minutes.</p>
              </div>
              <div className="how-step">
                <div className="how-step-num">2</div>
                <h3>Step 2 — We analyze your gaps</h3>
                <p>Our AI compares your skills against your goal and identifies exactly what you need to learn.</p>
              </div>
              <div className="how-step">
                <div className="how-step-num">3</div>
                <h3>Step 3 — Follow your path</h3>
                <p>Get a personalized course sequence from free public resources, updated as you progress.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FEATURES */}
        <section id="features" className="home-section">
          <div className="public-container">
            <div className="section-label">What you get</div>
            <h2 className="section-heading">
              Everything for <em>focused learning</em>
            </h2>
            
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🧠</div>
                <h3>Skill Gap Analysis</h3>
                <p>See exactly what skills you're missing for your target role.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🤖</div>
                <h3>AI Learning Mentor</h3>
                <p>Ask questions, get explanations, generate quizzes.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📍</div>
                <h3>Personalized Path</h3>
                <p>A step-by-step course sequence built for your specific goal.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>ML Recommendations</h3>
                <p>Our recommendation engine matches courses to your unique profile.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">✅</div>
                <h3>Progress Tracking</h3>
                <p>Track study time, completed courses, and skill improvements.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎓</div>
                <h3>Free Resources</h3>
                <p>All courses are sourced from free public platforms.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FINAL CTA */}
        <section className="home-cta-section home-section">
          <div className="public-container">
            <div className="home-cta-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
              <div className="home-cta-left">
                <div className="section-label">Start today</div>
                <h2 className="section-heading" style={{ margin: '1rem 0' }}>Make your next hour count.</h2>
                <p>Free to use. No credit card. Build your path in minutes.</p>
              </div>
              <div className="home-cta-right">
                <button onClick={handleCtaClick} className="home-cta-primary" style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}>
                  Start Learning for Free
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
};

export default Home;

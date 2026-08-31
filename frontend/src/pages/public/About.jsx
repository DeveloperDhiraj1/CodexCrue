import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/public/PublicLayout';

export default function About() {
  const pillars = [
    {
      icon: '🎯',
      title: 'Personal',
      description: 'Learning plans shaped around your specific goals and current skill level — not a generic curriculum.'
    },
    {
      icon: '🤖',
      title: 'AI-Powered',
      description: 'An AI mentor answers your questions, explains concepts, and generates quizzes tailored to your path.'
    },
    {
      icon: '📊',
      title: 'Analytical',
      description: 'Skill gap analysis shows exactly where you stand versus your target role, so nothing falls through the cracks.'
    },
    {
      icon: '🆓',
      title: 'Free Resources',
      description: 'Every recommended course is sourced from free public platforms — YouTube, Coursera audits, freeCodeCamp, MDN.'
    },
    {
      icon: '📈',
      title: 'Visible Progress',
      description: 'Track study time, milestones, and skill growth. Make momentum tangible and keep yourself accountable.'
    },
    {
      icon: '🔀',
      title: 'Adaptive',
      description: 'Recommendations and your learning path evolve as your skills grow and your goals change.'
    },
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="home-section" style={{ background: 'linear-gradient(160deg, var(--primary-xlight) 0%, white 60%)', paddingTop: 100, paddingBottom: 80 }}>
        <div style={{ maxWidth: 680 }}>
          <div className="section-label">About CodexCrue</div>
          <h1 className="section-heading">
            Learning is easier when<br />
            the <em>next step</em> is clear.
          </h1>
          <p className="section-sub">
            CodexCrue is an AI-powered personalized learning platform. Tell it what you want to become —
            it analyzes your skills, finds the gaps, and builds a step-by-step path using free resources.
            No subscription fees. No wasted time.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/register" className="home-cta-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '14px 24px', borderRadius: 12, background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: 14 }}>
              Start Learning Free
            </Link>
            <Link to="/courses" className="home-cta-secondary" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 24px', borderRadius: 12, border: '2px solid var(--primary-light)', color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="home-section alt" id="pillars">
        <div className="section-label">What We Stand For</div>
        <h2 className="section-heading">
          Built on <em>six principles</em>
        </h2>
        <p className="section-sub">
          Every design decision in CodexCrue comes back to one question: does this help the learner make progress today?
        </p>
        <div className="feature-grid">
          {pillars.map(({ icon, title, description }) => (
            <div className="feature-card" key={title}>
              <div className="feature-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="home-section" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-label">Our Mission</div>
          <h2 className="section-heading" style={{ marginBottom: 20 }}>
            Democratizing <em>career-ready</em> learning
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.8, maxWidth: 620, margin: '0 auto 40px' }}>
            The best learning resources in the world are free. The problem is knowing which ones to use, in what order,
            for your specific goal. That's the problem CodexCrue solves — combining ML-based course matching with
            AI guidance to give every learner a personal tutor and a clear roadmap.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              ['100%', 'Free to Use'],
              ['AI + ML', 'Powered Recommendations'],
              ['∞', 'Learning Paths'],
            ].map(([stat, label]) => (
              <div key={label} style={{ padding: '28px 20px', background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>{stat}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-section alt" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="home-cta-section">
          <div>
            <div className="section-label">Get Started</div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(28px, 3.5vw, 40px)', color: 'var(--text)', marginBottom: 12 }}>
              Ready to build your path?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 460 }}>
              Create a free account, tell us your goal, and get a personalized learning path in minutes.
            </p>
          </div>
          <Link
            to="/register"
            style={{ display: 'inline-block', textDecoration: 'none', padding: '16px 32px', background: 'var(--primary)', color: 'white', borderRadius: 12, fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}
          >
            Create Free Account →
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}

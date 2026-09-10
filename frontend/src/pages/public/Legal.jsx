import React from 'react';
import PublicLayout from '../../components/public/PublicLayout';

const sections = {
  privacy: {
    eyebrow: 'Privacy',
    title: 'Your learning data stays yours.',
    intro: 'This page explains, in plain language, how CodexCrue uses information to personalise learning and keep your account secure.',
    items: [
      ['What we collect', 'We collect account details, profile information, learning goals, course activity, feedback and progress data that you choose to provide.'],
      ['How we use it', 'We use this information to create learning paths, improve course recommendations, track verified progress and provide the AI learning assistant.'],
      ['Your control', 'You can review and update your profile, change your preferences, and request account or data removal by contacting hello@codexcrue.com.'],
      ['Third-party services', 'Some features use trusted providers for hosting, email, media uploads and AI processing. Only the information needed to provide that feature is shared.'],
      ['Security', 'We use authenticated requests, protected routes, rate limits and secure production cookies to help protect your account.']
    ]
  },
  terms: {
    eyebrow: 'Terms of use',
    title: 'Learn responsibly. Build consistently.',
    intro: 'By using CodexCrue, you agree to use the platform responsibly and understand that learning recommendations are guidance, not guarantees.',
    items: [
      ['Using CodexCrue', 'You must provide accurate account information, protect your login details and use the service only for lawful educational purposes.'],
      ['Learning recommendations', 'Roadmaps, course recommendations and AI responses are educational suggestions. Check important information against the original course or official documentation.'],
      ['Public resources', 'Recommended videos, courses and documentation may be hosted by third parties. Their availability, content and policies are controlled by those providers.'],
      ['Your content', 'You retain responsibility for feedback, comments and other content you submit. Do not upload confidential, harmful or copyrighted material you do not have permission to share.'],
      ['Service changes', 'We may improve, update or temporarily suspend parts of CodexCrue to maintain security and product quality.']
    ]
  }
};

export default function Legal({ type = 'privacy' }) {
  const page = sections[type] || sections.privacy;

  return (
    <PublicLayout>
      <main className="legal-page page-wrap">
        <div className="legal-hero">
          <span className="section-label">{page.eyebrow}</span>
          <h1 className="section-heading">{page.title}</h1>
          <p className="section-sub">{page.intro}</p>
          <span className="legal-updated">Last updated: September 10, 2026</span>
        </div>
        <div className="legal-content">
          {page.items.map(([title, content]) => (
            <section className="legal-card" key={title}>
              <h2>{title}</h2>
              <p>{content}</p>
            </section>
          ))}
        </div>
        <p className="legal-contact">Questions about these terms? <a href="mailto:hello@codexcrue.com">Contact CodexCrue support</a>.</p>
      </main>
    </PublicLayout>
  );
}

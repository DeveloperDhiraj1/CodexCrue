import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CAREER_GOALS } from '../../utils/constants';

const Onboarding = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [careerGoal, setCareerGoal] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [currentSkills, setCurrentSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [preferredLearningStyle, setPreferredLearningStyle] = useState('mixed');
  const [availableHoursPerDay, setAvailableHoursPerDay] = useState(2);
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [targetCompletionDate, setTargetCompletionDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!careerGoal && !customGoal) {
        setError('Please select or enter a career goal.');
        return;
      }
    } else if (step === 2) {
      if (!experienceLevel) {
        setError('Please select your experience level.');
        return;
      }
    } else if (step === 3) {
      if (availableHoursPerDay <= 0) {
        setError('Please enter a valid number of hours.');
        return;
      }
    }
    
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    if (step === 1) {
      navigate('/dashboard');
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !currentSkills.includes(skillInput.trim())) {
      setCurrentSkills([...currentSkills, skillInput.trim()]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setCurrentSkills(currentSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/profile/onboarding', {
        careerGoal: careerGoal === 'custom' ? customGoal : careerGoal,
        experienceLevel,
        currentSkills,
        preferredLearningStyle,
        availableHoursPerDay: Number(availableHoursPerDay),
        preferredLanguage,
        targetCompletionDate: targetCompletionDate || undefined
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="onboarding-step">
      <div className="onboarding-step-num">Step 1 of 4</div>
      <h2>What do you want to become?</h2>
      <p>Choose your target career. This shapes your entire learning path.</p>
      
      <div className="goal-grid">
        {CAREER_GOALS?.map(goal => (
          <div
            key={goal}
            className={`goal-option ${careerGoal === goal ? 'selected' : ''}`}
            onClick={() => { setCareerGoal(goal); setCustomGoal(''); }}
          >
            {goal}
          </div>
        ))}
      </div>
      
      <div className="field" style={{ marginTop: '20px' }}>
        <label className="label">Or type your own goal...</label>
        <input 
          type="text" 
          className="input" 
          placeholder="e.g. Prompt Engineer" 
          value={customGoal}
          onChange={(e) => { setCustomGoal(e.target.value); setCareerGoal('custom'); }}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="onboarding-step">
      <div className="onboarding-step-num">Step 2 of 4</div>
      <h2>Tell us about yourself</h2>
      <p>We'll calibrate your learning path to your experience level.</p>
      
      <div className="level-grid">
        <div 
          className={`level-option ${experienceLevel === 'beginner' ? 'selected' : ''}`}
          onClick={() => setExperienceLevel('beginner')}
        >
          <h4>Beginner</h4>
          <p>Just starting out</p>
        </div>
        <div 
          className={`level-option ${experienceLevel === 'intermediate' ? 'selected' : ''}`}
          onClick={() => setExperienceLevel('intermediate')}
        >
          <h4>Intermediate</h4>
          <p>Some experience</p>
        </div>
        <div 
          className={`level-option ${experienceLevel === 'advanced' ? 'selected' : ''}`}
          onClick={() => setExperienceLevel('advanced')}
        >
          <h4>Advanced</h4>
          <p>Experienced developer</p>
        </div>
      </div>
      
      <div className="field" style={{ marginTop: '20px' }}>
        <label className="label">Current Skills</label>
        <div className="skill-input-wrap" style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            className="input" 
            placeholder="e.g. JavaScript, Python, SQL..." 
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(e); }}
          />
          <button type="button" onClick={handleAddSkill} className="btn-next">Add</button>
        </div>
        
        {currentSkills.length > 0 && (
          <div className="skill-tag-list" style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {currentSkills.map(skill => (
              <span key={skill} className="skill-tag badge-green" style={{ padding: '5px 10px', borderRadius: '15px', display: 'flex', alignItems: 'center' }}>
                {skill}
                <button type="button" onClick={() => handleRemoveSkill(skill)} style={{ marginLeft: '5px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="onboarding-step">
      <div className="onboarding-step-num">Step 3 of 4</div>
      <h2>How do you like to learn?</h2>
      <p>We'll prioritize the right type of content for you.</p>
      
      <div className="level-grid" style={{ marginBottom: '20px' }}>
        <div className={`level-option ${preferredLearningStyle === 'video' ? 'selected' : ''}`} onClick={() => setPreferredLearningStyle('video')}>
          <h4>📹 Video courses</h4>
        </div>
        <div className={`level-option ${preferredLearningStyle === 'reading' ? 'selected' : ''}`} onClick={() => setPreferredLearningStyle('reading')}>
          <h4>📖 Articles & docs</h4>
        </div>
        <div className={`level-option ${preferredLearningStyle === 'hands-on' ? 'selected' : ''}`} onClick={() => setPreferredLearningStyle('hands-on')}>
          <h4>💻 Projects & practice</h4>
        </div>
        <div className={`level-option ${preferredLearningStyle === 'mixed' ? 'selected' : ''}`} onClick={() => setPreferredLearningStyle('mixed')}>
          <h4>🔀 Mixed (recommended)</h4>
        </div>
      </div>
      
      <div className="field" style={{ marginBottom: '20px' }}>
        <label className="label">Available hours per week</label>
        <input 
          type="number" 
          className="input" 
          min="1" 
          max="40"
          value={availableHoursPerDay}
          onChange={(e) => setAvailableHoursPerDay(e.target.value)}
        />
      </div>
      
      <div className="field">
        <label className="label">Preferred Language</label>
        <select 
          className="input" 
          value={preferredLanguage}
          onChange={(e) => setPreferredLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="hinglish">Hinglish</option>
        </select>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="onboarding-step">
      <div className="onboarding-step-num">Step 4 of 4</div>
      <h2>When do you want to achieve this?</h2>
      <p>Give us a target and we'll keep you on track.</p>
      
      <div className="field" style={{ marginBottom: '20px' }}>
        <label className="label">Target Completion Date (Optional)</label>
        <input 
          type="date" 
          className="input" 
          value={targetCompletionDate}
          onChange={(e) => setTargetCompletionDate(e.target.value)}
        />
      </div>
      
      <div className="summary-card" style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Your Summary</h3>
        <p><strong>Goal:</strong> {careerGoal === 'custom' ? customGoal : careerGoal}</p>
        <p><strong>Experience:</strong> {experienceLevel}</p>
        <p><strong>Skills:</strong> {currentSkills.length} selected</p>
        <p><strong>Time commitment:</strong> {availableHoursPerDay} hours/week</p>
      </div>
    </div>
  );

  return (
    <div className="onboarding-page">
      <div className="onboarding-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div className="logo" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>CodexCrue</div>
        <div className="onboarding-progress" style={{ flex: 1, margin: '0 20px', display: 'flex', alignItems: 'center' }}>
          <div className="onboarding-progress-bar" style={{ flex: 1, height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
            <div className="onboarding-progress-fill" style={{ width: `${(step / 4) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>
        <div className="onboarding-progress-label">Step {step} of 4</div>
      </div>
      
      <div className="onboarding-body">
        {error && <div className="auth-error" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        
        <div className="onboarding-nav" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <button 
            type="button" 
            className="btn-back" 
            onClick={handleBack}
            disabled={loading}
          >
            {step === 1 ? 'Skip for now' : 'Back'}
          </button>
          
          {step < 4 ? (
            <button 
              type="button" 
              className="btn-next" 
              onClick={handleNext}
            >
              Continue
            </button>
          ) : (
            <button 
              type="button" 
              className="btn-next" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Finish Setup & Go to Dashboard'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

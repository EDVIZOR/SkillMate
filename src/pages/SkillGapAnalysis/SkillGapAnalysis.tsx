import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, TrendingUp, AlertCircle, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { roleReadyApi, CareerRole, Skill, SkillCategory, GapAnalysisResponse } from '../../services/roleReadyApi';
import { Button } from '../../components';
import './SkillGapAnalysis.css';

const SkillGapAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'select-role' | 'select-skills' | 'results'>('select-role');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data
  const [industries, setIndustries] = useState<any[]>([]);
  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<CareerRole | null>(null);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<Map<number, string>>(new Map());
  const [analysisResult, setAnalysisResult] = useState<GapAnalysisResponse | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [industriesData, rolesData, categoriesData, skillsData, userSkillsData] = await Promise.all([
        roleReadyApi.getIndustries(),
        roleReadyApi.getCareerRoles(),
        roleReadyApi.getSkillCategories(),
        roleReadyApi.getSkills(),
        roleReadyApi.getUserSkills(),
      ]);

      setIndustries(industriesData);
      setRoles(rolesData);
      setSkillCategories(categoriesData);
      setSkills(skillsData);

      // Map user skills
      const skillsMap = new Map<number, string>();
      userSkillsData.forEach((profile: any) => {
        skillsMap.set(profile.skill.id, profile.proficiency_level);
      });
      setUserSkills(skillsMap);
    } catch (err: any) {
      setError('Failed to load data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: CareerRole) => {
    setSelectedRole(role);
    setStep('select-skills');
  };

  const handleSkillProficiencyChange = (skillId: number, proficiency: string) => {
    const newUserSkills = new Map(userSkills);
    if (proficiency) {
      newUserSkills.set(skillId, proficiency);
    } else {
      newUserSkills.delete(skillId);
    }
    setUserSkills(newUserSkills);
  };

  const handleAnalyze = async () => {
    if (!selectedRole) return;

    try {
      setLoading(true);
      setError('');

      // Check authentication
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Please login to analyze your skills.');
        setLoading(false);
        return;
      }

      // Save user skills first
      const skillsArray = Array.from(userSkills.entries()).map(([skillId, proficiency]) => ({
        skill_id: skillId,
        proficiency_level: proficiency as any,
      }));

      try {
        await roleReadyApi.updateUserSkills(skillsArray);
      } catch (skillErr: any) {
        console.error('Error updating skills:', skillErr);
        // Continue even if skill update fails - user might not have selected any skills
        if (skillErr.response?.status === 403) {
          setError('Authentication failed. Please login again.');
          setLoading(false);
          return;
        }
      }

      // Run analysis
      const result = await roleReadyApi.analyzeSkillGap(selectedRole.id, false);
      setAnalysisResult(result);
      setStep('results');
    } catch (err: any) {
      console.error('Analysis error:', err);
      let errorMessage = 'Failed to analyze skills. Please try again.';
      
      if (err.response?.status === 403) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.error || err.response?.data?.detail || errorMessage;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSkillsByCategory = (categoryId: number) => {
    return skills.filter(skill => skill.category.id === categoryId);
  };

  if (step === 'results' && analysisResult) {
    return (
      <div className="skill-gap-analysis-page">
        <div className="analysis-container">
          <button onClick={() => setStep('select-role')} className="back-button">
            <ArrowLeft className="icon" />
            Back
          </button>

          <div className="results-header">
            <h1>Skill Gap Analysis Results</h1>
            <p className="subtitle">Target Role: {analysisResult.gap_analysis.target_role.name}</p>
          </div>

          {/* Readiness Score */}
          <div className="readiness-card">
            <div className="readiness-score">
              <div className="score-circle">
                <span className="score-value">{analysisResult.gap_analysis.readiness_score.toFixed(0)}%</span>
                <span className="score-label">Ready</span>
              </div>
            </div>
            <div className="readiness-details">
              <h2>Overall Readiness</h2>
              <p>{analysisResult.feedback.overview}</p>
            </div>
          </div>

          {/* Feedback */}
          <div className="feedback-section">
            <h3>Mentor Feedback</h3>
            <div className="feedback-card">
              <div className="feedback-item">
                <h4>💪 Your Strengths</h4>
                <p>{analysisResult.feedback.strengths}</p>
              </div>
              <div className="feedback-item">
                <h4>🎯 Focus Areas</h4>
                <p>{analysisResult.feedback.focus_areas}</p>
              </div>
              <div className="feedback-item">
                <h4>💡 Encouragement</h4>
                <p>{analysisResult.feedback.encouragement}</p>
              </div>
              <div className="feedback-item">
                <h4>✅ Next Steps</h4>
                <p>{analysisResult.feedback.next_steps}</p>
              </div>
            </div>
          </div>

          {/* Gap Summary */}
          <div className="gap-summary">
            <h3>Skill Gap Breakdown</h3>
            <div className="gap-stats">
              <div className="gap-stat critical">
                <AlertCircle className="icon" />
                <span className="count">{analysisResult.gap_analysis.gap_summary.critical}</span>
                <span className="label">Critical</span>
              </div>
              <div className="gap-stat medium">
                <Clock className="icon" />
                <span className="count">{analysisResult.gap_analysis.gap_summary.medium}</span>
                <span className="label">Medium</span>
              </div>
              <div className="gap-stat growth">
                <TrendingUp className="icon" />
                <span className="count">{analysisResult.gap_analysis.gap_summary.growth}</span>
                <span className="label">Growth</span>
              </div>
            </div>
          </div>

          {/* Critical Gaps */}
          {analysisResult.gap_analysis.critical_gaps.length > 0 && (
            <div className="critical-gaps">
              <h3>🚨 Critical Gaps</h3>
              <div className="gaps-list">
                {analysisResult.gap_analysis.critical_gaps.map((gap, idx) => (
                  <div key={idx} className="gap-item critical">
                    <div className="gap-header">
                      <span className="gap-skill">{gap.skill}</span>
                      <span className="gap-score">Gap: {gap.gap_score}%</span>
                    </div>
                    <p className="gap-recommendation">{gap.recommendations}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roadmap Preview */}
          <div className="roadmap-preview">
            <h3>📚 Your Learning Roadmap</h3>
            <div className="roadmap-stats">
              <div className="stat">
                <BookOpen className="icon" />
                <span>{analysisResult.roadmap.progress.total_steps} Steps</span>
              </div>
              <div className="stat">
                <Clock className="icon" />
                <span>{analysisResult.roadmap.time_estimate.total_hours} Hours</span>
              </div>
              <div className="stat">
                <CheckCircle className="icon" />
                <span>{analysisResult.roadmap.progress.completion_percentage.toFixed(0)}% Complete</span>
              </div>
            </div>
            <Button
              onClick={() => navigate(`/roadmaps?role_id=${selectedRole?.id}`)}
              variant="primary"
              size="lg"
              className="view-roadmap-button"
            >
              View Full Roadmap →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'select-skills') {
    return (
      <div className="skill-gap-analysis-page">
        <div className="analysis-container">
          <button onClick={() => setStep('select-role')} className="back-button">
            <ArrowLeft className="icon" />
            Back
          </button>

          <div className="step-header">
            <h1>Select Your Skills</h1>
            <p>Rate your proficiency level for each skill</p>
          </div>

          {skillCategories.map((category) => {
            const categorySkills = getSkillsByCategory(category.id);
            if (categorySkills.length === 0) return null;

            return (
              <div key={category.id} className="skills-category-section">
                <h3 className="category-title">{category.name} Skills</h3>
                <div className="skills-grid">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="skill-item">
                      <div className="skill-header">
                        <span className="skill-name">{skill.name}</span>
                      </div>
                      <select
                        value={userSkills.get(skill.id) || ''}
                        onChange={(e) => handleSkillProficiencyChange(skill.id, e.target.value)}
                        className="proficiency-select"
                      >
                        <option value="">Not rated</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {error && <div className="error-message">{error}</div>}

          <div className="action-buttons">
            <Button
              onClick={handleAnalyze}
              variant="primary"
              size="lg"
              disabled={loading || !selectedRole}
            >
              {loading ? 'Analyzing...' : 'Analyze Skill Gap'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="skill-gap-analysis-page">
      <div className="analysis-container">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          <ArrowLeft className="icon" />
          Back to Dashboard
        </button>

        <div className="step-header">
          <h1>Skill Gap Analysis</h1>
          <p>Select a career role to analyze your skill readiness</p>
        </div>

        {loading && <div className="loading">Loading roles...</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="roles-grid">
          {roles.map((role) => (
            <div
              key={role.id}
              className="role-card"
              onClick={() => handleRoleSelect(role)}
            >
              <Target className="icon" />
              <h3>{role.name}</h3>
              <p className="industry">{role.industry.name}</p>
              <p className="description">{role.description}</p>
              <Button variant="primary" size="md" className="select-button">
                Select Role
              </Button>
            </div>
          ))}
        </div>

        {roles.length === 0 && !loading && (
          <div className="empty-state">
            <Target className="icon-large" />
            <p>No roles available. Please configure roles in the admin panel.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapAnalysis;

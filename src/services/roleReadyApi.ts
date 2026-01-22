import api from './api';

export interface Industry {
  id: number;
  name: string;
  description: string;
}

export interface CareerRole {
  id: number;
  name: string;
  description: string;
  industry: Industry;
  is_active: boolean;
}

export interface SkillCategory {
  id: number;
  name: string;
  description: string;
  order: number;
}

export interface Skill {
  id: number;
  name: string;
  description: string;
  category: SkillCategory;
  is_active: boolean;
}

export interface UserSkillProfile {
  id: number;
  skill: Skill;
  skill_id: number;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  experience_notes: string;
  created_at: string;
  updated_at: string;
}

export interface SkillGapBreakdown {
  id: number;
  skill: Skill;
  user_proficiency: string;
  required_weight: string;
  gap_level: 'critical' | 'medium' | 'growth' | 'exceeded';
  gap_score: string;
  recommendations: string;
}

export interface SkillGapResult {
  id: number;
  user: number;
  target_role: CareerRole;
  readiness_score: string;
  calculated_at: string;
  notes: string;
  breakdowns: SkillGapBreakdown[];
}

export interface Assignment {
  title: string;
  description: string;
  deliverables?: string[];
}

export interface RoadmapStep {
  id: number;
  skill: Skill;
  step_order: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  resources: any[];
  assignments: Assignment[];
  estimated_hours: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningRoadmap {
  id: number;
  user: number;
  target_role: CareerRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  steps: RoadmapStep[];
}

export interface GapAnalysisResponse {
  gap_analysis: {
    readiness_score: number;
    target_role: {
      id: number;
      name: string;
      industry: string;
    };
    calculated_at: string;
    gap_summary: {
      critical: number;
      medium: number;
      growth: number;
      exceeded: number;
    };
    critical_gaps: Array<{
      skill: string;
      category: string;
      gap_score: number;
      recommendations: string;
    }>;
    total_skills_analyzed: number;
  };
  roadmap: {
    roadmap_id: number;
    target_role: {
      id: number;
      name: string;
      industry: string;
    };
    progress: {
      total_steps: number;
      completed: number;
      in_progress: number;
      pending: number;
      completion_percentage: number;
    };
    time_estimate: {
      total_hours: number;
      completed_hours: number;
      remaining_hours: number;
    };
    skills_roadmap: Array<{
      skill: string;
      category: string;
      steps: Array<{
        order: number;
        title: string;
        status: string;
        estimated_hours: number;
      }>;
    }>;
  };
  feedback: {
    overview: string;
    strengths: string;
    focus_areas: string;
    encouragement: string;
    next_steps: string;
    full_message: string;
  };
  gap_result_id: number;
  roadmap_id: number;
}

export const roleReadyApi = {
  // Industries
  getIndustries: async (): Promise<Industry[]> => {
    const response = await api.get('/role-ready/industries/');
    return response.data;
  },

  // Career Roles
  getCareerRoles: async (industryId?: number): Promise<CareerRole[]> => {
    const url = industryId 
      ? `/role-ready/roles/?industry_id=${industryId}`
      : '/role-ready/roles/';
    const response = await api.get(url);
    return response.data;
  },

  // Skills
  getSkills: async (categoryId?: number): Promise<Skill[]> => {
    const url = categoryId
      ? `/role-ready/skills/?category_id=${categoryId}`
      : '/role-ready/skills/';
    const response = await api.get(url);
    return response.data;
  },

  getSkillCategories: async (): Promise<SkillCategory[]> => {
    const response = await api.get('/role-ready/skill-categories/');
    return response.data;
  },

  // User Skills
  getUserSkills: async (): Promise<UserSkillProfile[]> => {
    const response = await api.get('/role-ready/user-skills/');
    return response.data;
  },

  updateUserSkills: async (skills: Array<{
    skill_id: number;
    proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    experience_notes?: string;
  }>): Promise<UserSkillProfile[]> => {
    const response = await api.post('/role-ready/user-skills/', { skills });
    return response.data;
  },

  // Skill Gap Analysis
  analyzeSkillGap: async (
    roleId: number,
    rebuildRoadmap: boolean = false
  ): Promise<GapAnalysisResponse> => {
    const response = await api.post('/role-ready/analyze/', {
      role_id: roleId,
      rebuild_roadmap: rebuildRoadmap,
    });
    return response.data;
  },

  getSkillGapResult: async (resultId: number): Promise<SkillGapResult> => {
    const response = await api.get(`/role-ready/gap-results/${resultId}/`);
    return response.data;
  },

  // Roadmaps
  getUserRoadmaps: async (): Promise<LearningRoadmap[]> => {
    const response = await api.get('/role-ready/roadmaps/');
    return response.data;
  },

  getUserRoadmap: async (roleId: number): Promise<LearningRoadmap> => {
    const response = await api.get(`/role-ready/roadmaps/${roleId}/`);
    return response.data;
  },

  updateRoadmapStepStatus: async (
    stepId: number,
    status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  ): Promise<RoadmapStep> => {
    const response = await api.patch('/role-ready/roadmap-steps/update-status/', {
      step_id: stepId,
      status,
    });
    return response.data;
  },
};

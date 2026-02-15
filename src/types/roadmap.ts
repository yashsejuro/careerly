
// 1. Career Roadmap Types
export interface LearningStep {
    step: number;
    title: string;
    description: string;
}

export interface CareerPath {
    title: string;
    description: string;
    why_fit: string;
    skills: {
        must_have: string[];
        good_to_have: string[];
    };
    learning_roadmap: LearningStep[];
    entry_roles: string[];
    timeline_months: number;
}

export interface CareerRoadmapResponse {
    career_paths: CareerPath[];
    next_30_days_focus: string;
}

// 2. Skill Gap Analysis Types
export interface MissingSkill {
    skill: string;
    priority: 'High' | 'Medium' | 'Low';
    why_important: string;
    how_to_learn: string;
    mini_task: string;
}

export interface SkillGapAnalysisResponse {
    missing_skills: MissingSkill[];
    overall_gap_summary: string;
}

// 3. Project Recommendations Types
export interface ProjectRecommendation {
    title: string;
    problem_statement: string;
    target_users: string[];
    tech_stack: string[];
    core_features: string[];
    advanced_features: string[];
    resume_value: string;
}

export interface ProjectRecommendationsResponse {
    projects: ProjectRecommendation[];
}

export type UserProjectStatus = 'To Do' | 'In Progress' | 'Review' | 'Done';

export interface UserProject extends ProjectRecommendation {
    id: string;
    userId: string;
    status: UserProjectStatus;
    notes?: string;
    createdAt: string;
}

// 4. Profile Overview Types
export interface ProfileOverviewResponse {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommended_focus: string;
}

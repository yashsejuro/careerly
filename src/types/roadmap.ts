// Skill Gap Analysis Types
export interface GapSkill {
    skill: string;
    importance: 'high' | 'medium' | 'low';
    reason: string;
    resources: string[];
}

export interface SkillAnalysis {
    matchingSkills: string[];
    gapSkills: GapSkill[];
}

// Career Roadmap Types
export interface RoadmapPhase {
    name: string;
    description: string;
    steps: string[];
}

export interface CareerRoadmap {
    title: string;
    description: string;
    phases: RoadmapPhase[];
}

// Project Suggestion Types
export interface ProjectSuggestion {
    name: string;
    description: string;
    techStack: string[];
    features: string[];
    impact: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ProjectSuggestions {
    projects: ProjectSuggestion[];
}

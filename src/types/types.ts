export interface TrainingPlan {
  id: number;
  title: string;
  duration: string;
  intensity: 'low' | 'medium' | 'high';
  completed: boolean;
  exercises: string[];
}

export interface ProgressStats {
  id: number;
  skill: string;
  current: number;
  previous: number;
  icon: string;
}

export interface NextTraining {
  date: string;
  time: string;
  type: string;
  focus: string;
}

export interface Achievement {
  id: number;
  icon: string;
  title: string;
  value: string;
  color: string;
}

export interface DashboardData {
  trainingPlans: TrainingPlan[];
  progressStats: ProgressStats[];
  nextTraining: NextTraining;
  coachNotes: string[];
  achievements: Achievement[];
}
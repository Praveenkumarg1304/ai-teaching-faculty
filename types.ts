
export enum TeacherRole {
  DIAGNOSTICIAN = 'DIAGNOSTICIAN',
  ARCHITECT = 'ARCHITECT',
  EXPLAINER = 'EXPLAINER',
  CRITIC = 'CRITIC'
}

export interface Teacher {
  id: TeacherRole;
  name: string;
  avatar: string;
  description: string;
  color: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  teacherRole?: TeacherRole;
  timestamp: number;
}

export interface LessonPlan {
  topic: string;
  objectives: string[];
  steps: {
    title: string;
    content: string;
  }[];
}

export interface TutorState {
  currentPhase: 'IDLE' | 'DIAGNOSING' | 'PLANNING' | 'TEACHING' | 'REFINING';
  activeTeacher: TeacherRole | null;
  history: Message[];
  lessonPlan: LessonPlan | null;
}

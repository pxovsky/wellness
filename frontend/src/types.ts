export interface Training {
  id: number;
  date: string;
  duration_min: number;
  calories: number;
  avg_hr: number;
  max_hr: number;
  training_effect: number;
  notes: string;
}

export interface DailyLog {
  date: string;
  reading_minutes?: number;
  water_glasses?: number;
  kefir_glasses?: number;
  no_phone_after_21?: number; // 1 = yes, 0 = no
  discipline_score?: number;
  mood_score?: number;
  vibe_coding_minutes?: number;
  household_chores?: number;
  // 👇 Nowe pole
  vitamins?: number; // 1 = yes, 0 = no
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 1 | 2 | 3; // 1: Low, 2: Medium, 3: High
  due_date?: string;
  reminder_date?: string;
  is_completed: number; // 1 = yes, 0 = no
  position: number;
  tags?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
}

export interface ChoresLogResponse {
  household_chores: number;
}

export interface VitaminLogResponse {
  vitamins: 0 | 1;
}

export type View = 'Dashboard' | 'AddTraining' | 'History' | 'Charts' | 'Calendar' | 'Tasks';

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
}

export type View = 'Dashboard' | 'AddTraining' | 'History' | 'Charts' | 'Calendar';

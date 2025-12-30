export interface Training {
  id: string;
  date: string;
  duration: number;
  calories: number;
  avgHr: number;
  maxHr: number;
  effect: number;
  notes: string;
}

export interface DailyLog {
  date: string;
  reading_minutes?: number;
  water_glasses?: number;
  kefir_glasses?: number;
  no_phone_after_21?: boolean;
  discipline_score?: number;
  calories?: number;
  mood_score?: number;
}

export type View = 'Dashboard' | 'AddTraining' | 'History' | 'Charts' | 'Calendar';

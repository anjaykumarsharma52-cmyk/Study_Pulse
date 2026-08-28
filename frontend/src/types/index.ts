export interface StudySession {
  id: string;
  user_id: string;
  subject: string;
  topic: string;
  duration: number;
  notes: string;
  xp_earned: number;
  created_at: string;
}

export interface StudyStats {
  total_sessions: number;
  total_duration: number;
  today_duration: number;
  total_xp: number;
  current_level: number;
  xp_for_next_level: number;
  current_level_xp: number;
}

export interface QuestProgress {
  level: number;
  title: string;
  xp: number;
  next_level_xp: number;
  progress: number;
}

export interface AIAnalysis {
  summary: string;
  strength: string;
  weakness: string;
  recommendation: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}
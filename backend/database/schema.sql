-- StudyPulse Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Study sessions table
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0 AND duration <= 1440),
  notes TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_created_at ON study_sessions(created_at DESC);
CREATE INDEX idx_study_sessions_user_created ON study_sessions(user_id, created_at DESC);

-- Row Level Security
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own sessions
CREATE POLICY "Users can view own sessions"
  ON study_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only insert their own sessions
CREATE POLICY "Users can insert own sessions"
  ON study_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own sessions
CREATE POLICY "Users can update own sessions"
  ON study_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can only delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON study_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to get user stats (optional, for complex queries)
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_sessions BIGINT,
  total_duration BIGINT,
  today_duration BIGINT,
  total_xp BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_sessions,
    COALESCE(SUM(duration), 0)::BIGINT as total_duration,
    COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE THEN duration ELSE 0 END), 0)::BIGINT as today_duration,
    COALESCE(SUM(xp_earned), 0)::BIGINT as total_xp
  FROM study_sessions
  WHERE user_id = p_user_id;
END;
$$;
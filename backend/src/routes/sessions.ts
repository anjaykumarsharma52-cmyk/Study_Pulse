import { Router, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { CreateSessionInput, StudySession } from '../types';

const router = Router();

router.use(authMiddleware);

function calculateXP(duration: number): number {
  return duration;
}

function calculateLevel(xp: number): number {
  const thresholds = [0, 100, 250, 500, 1000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) return i + 1;
  }
  return 1;
}

function getLevelInfo(level: number) {
  const thresholds = [0, 100, 250, 500, 1000];
  const titles = ['Knowledge Seeker', 'Study Apprentice', 'Study Warrior', 'Knowledge Master', 'Grand Scholar'];
  const currentXP = thresholds[level - 1] || 0;
  const nextLevelXP = thresholds[level] || currentXP;
  return {
    title: titles[level - 1] || 'Grand Scholar',
    currentLevelXP: currentXP,
    nextLevelXP,
  };
}

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.sub;

    const { data, error } = await supabaseAdmin
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: data as StudySession[] });
  } catch (err) {
    console.error('Get sessions error:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve sessions' },
    });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.sub;
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('study_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: { message: 'Session not found' },
        });
      }
      throw error;
    }

    return res.json({ success: true, data: data as StudySession });
  } catch (err) {
    console.error('Get session error:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve session' },
    });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.sub;
    const { subject, topic, duration, notes }: CreateSessionInput = req.body;

    if (!subject || !topic || !duration) {
      return res.status(400).json({
        success: false,
        error: { message: 'Subject, topic, and duration are required' },
      });
    }

    if (typeof duration !== 'number' || duration <= 0 || duration > 1440) {
      return res.status(400).json({
        success: false,
        error: { message: 'Duration must be a positive number (max 1440 minutes)' },
      });
    }

    if (subject.trim().length === 0 || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Subject and topic cannot be empty' },
      });
    }

    if (notes && notes.length > 2000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Notes must not exceed 2000 characters' },
      });
    }

    const xpEarned = calculateXP(duration);

    const { data, error } = await supabaseAdmin
      .from('study_sessions')
      .insert({
        user_id: userId,
        subject: subject.trim(),
        topic: topic.trim(),
        duration,
        notes: notes?.trim() || null,
        xp_earned: xpEarned,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data: data as StudySession });
  } catch (err) {
    console.error('Create session error:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to create session' },
    });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.sub;
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('study_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return res.json({ success: true, data: null });
  } catch (err) {
    console.error('Delete session error:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to delete session' },
    });
  }
});

export default router;
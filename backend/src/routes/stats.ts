import { Router, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { StudyStats } from '../types';

const router = Router();

router.use(authMiddleware);

function calculateLevel(xp: number): number {
  const thresholds = [0, 100, 250, 500, 1000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) return i + 1;
  }
  return 1;
}

function getLevelInfo(level: number) {
  const thresholds = [0, 100, 250, 500, 1000];
  const currentLevelXP = thresholds[level - 1] || 0;
  const nextLevelXP = thresholds[level] || currentLevelXP;
  return { currentLevelXP, nextLevelXP };
}

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.sub;

    const { data: sessions, error } = await supabaseAdmin
      .from('study_sessions')
      .select('duration, xp_earned, created_at')
      .eq('user_id', userId);

    if (error) throw error;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalDuration = 0;
    let todayDuration = 0;
    let totalXP = 0;

    for (const session of sessions || []) {
      totalDuration += session.duration;
      totalXP += session.xp_earned;
      if (new Date(session.created_at) >= today) {
        todayDuration += session.duration;
      }
    }

    const currentLevel = calculateLevel(totalXP);
    const { currentLevelXP, nextLevelXP } = getLevelInfo(currentLevel);

    const stats: StudyStats = {
      total_sessions: sessions?.length || 0,
      total_duration: totalDuration,
      today_duration: todayDuration,
      total_xp: totalXP,
      current_level: currentLevel,
      xp_for_next_level: nextLevelXP,
      current_level_xp: currentLevelXP,
    };

    return res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Get stats error:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve statistics' },
    });
  }
});

export default router;
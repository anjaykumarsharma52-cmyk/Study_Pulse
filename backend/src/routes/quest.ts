import { Router, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { QuestProgress } from '../types';

const router = Router();

router.use(authMiddleware);

const LEVELS = [
  { level: 1, title: 'Knowledge Seeker', xp: 0 },
  { level: 2, title: 'Study Apprentice', xp: 100 },
  { level: 3, title: 'Study Warrior', xp: 250 },
  { level: 4, title: 'Knowledge Master', xp: 500 },
  { level: 5, title: 'Grand Scholar', xp: 1000 },
];

function calculateLevel(xp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) return LEVELS[i].level;
  }
  return 1;
}

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.sub;

    const { data: sessions, error } = await supabaseAdmin
      .from('study_sessions')
      .select('xp_earned')
      .eq('user_id', userId);

    if (error) throw error;

    const totalXP = sessions?.reduce((sum: number, s) => sum + s.xp_earned, 0) || 0;
    const level = calculateLevel(totalXP);
    const currentLevel = LEVELS.find(l => l.level === level) || LEVELS[0];
    const nextLevel = LEVELS.find(l => l.level === level + 1);

    const progress = nextLevel
      ? Math.round(((totalXP - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100)
      : 100;

    const quest: QuestProgress = {
      level,
      title: currentLevel.title,
      xp: totalXP,
      next_level_xp: nextLevel?.xp || currentLevel.xp,
      progress: Math.min(Math.max(progress, 0), 100),
    };

    return res.json({ success: true, data: quest });
  } catch (err) {
    console.error('Get quest error:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve quest progress' },
    });
  }
});

export default router;
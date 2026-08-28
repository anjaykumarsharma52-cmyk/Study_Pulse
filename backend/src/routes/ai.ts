import { Router, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { AIAnalysis } from '../types';

const router = Router();

router.use(authMiddleware);

const AI_API_KEY = process.env.AI_API_KEY;
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

async function callAI(prompt: string): Promise<string> {
  if (!AI_API_KEY) {
    throw new Error('AI_API_KEY not configured');
  }

  if (AI_PROVIDER === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful study coach. Analyze the user's study data and provide a JSON response with exactly these fields: summary, strength, weakness, recommendation. Keep each field concise (1-2 sentences). Be encouraging but honest.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(`AI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content || '{}';
  }

  throw new Error(`Unsupported AI provider: ${AI_PROVIDER}`);
}

router.post('/analyze', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.sub;

    const { data: sessions, error } = await supabaseAdmin
      .from('study_sessions')
      .select('subject, topic, duration, notes, created_at, xp_earned')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    if (!sessions || sessions.length === 0) {
      return res.json({
        success: true,
        data: {
          summary: 'No study sessions recorded yet.',
          strength: 'N/A',
          weakness: 'N/A',
          recommendation: 'Start your first study session to begin tracking progress!',
        } as AIAnalysis,
      });
    }

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum: number, s) => sum + s.duration, 0);
    const totalXP = sessions.reduce((sum: number, s) => sum + s.xp_earned, 0);

    const subjectCounts: Record<string, number> = {};
    for (const s of sessions) {
      subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
    }

    const topSubject = Object.entries(subjectCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    const recentSessions = sessions.slice(0, 5).map(s =>
      `- ${s.subject}: ${s.topic} (${s.duration} min)${s.notes ? ` - ${s.notes}` : ''}`
    ).join('\n');

    const prompt = `Analyze this student's recent study activity:

Total Sessions: ${totalSessions}
Total Study Time: ${totalDuration} minutes
Total XP Earned: ${totalXP}
Most Studied Subject: ${topSubject}

Recent Sessions:
${recentSessions}

Provide a JSON response with:
- summary: Overall assessment of their study habits
- strength: What they're doing well
- weakness: Area needing improvement
- recommendation: Specific actionable advice`;

    const aiResponse = await callAI(prompt);
    let analysis: AIAnalysis;

    try {
      analysis = JSON.parse(aiResponse);
    } catch {
      analysis = {
        summary: 'Analysis completed.',
        strength: 'Consistent effort detected.',
        weakness: 'Could benefit from more variety.',
        recommendation: 'Try scheduling regular study sessions.',
      };
    }

    return res.json({ success: true, data: analysis });
  } catch (err) {
    console.error('AI analyze error:', err);
    return res.status(500).json({
      success: false,
      error: { message: err instanceof Error ? err.message : 'AI analysis failed' },
    });
  }
});

export default router;
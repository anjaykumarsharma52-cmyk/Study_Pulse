import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { StudyStats, StudySession, QuestProgress, AIAnalysis } from '../types';

export function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [quest, setQuest] = useState<QuestProgress | null>(null);
  const [aiInsight, setAiInsight] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, sessionsData, questData] = await Promise.all([
        api.stats.get(),
        api.sessions.list(),
        api.quest.get(),
      ]);
      setStats(statsData);
      setRecentSessions(sessionsData.slice(0, 5));
      setQuest(questData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      const insight = await api.ai.analyze();
      setAiInsight(insight);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI analysis failed');
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your study overview.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Study" value={`${stats?.today_duration || 0} min`} icon="🕐" />
        <StatCard title="Total Sessions" value={stats?.total_sessions || 0} icon="📚" />
        <StatCard title="Total Time" value={`${stats?.total_duration || 0} min`} icon="⏱️" />
        <StatCard title="Total XP" value={stats?.total_xp || 0} icon="⭐" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Sessions</h2>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : recentSessions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No study sessions yet.</p>
              <p className="mt-2 text-sm">Start your first session and begin your Study Quest!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{session.subject}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{session.topic} • {session.duration} min</p>
                  </div>
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">+{session.xp_earned} XP</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Study Quest</h2>
          {quest ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{quest.title}</span>
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Level {quest.level}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${quest.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {quest.xp} / {quest.next_level_xp} XP
                </p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  Next: <span className="font-medium">{quest.title}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Study Coach</h2>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Analyze My Progress
          </button>
        </div>
        {aiInsight ? (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Summary</p>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{aiInsight.summary}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Strength</p>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{aiInsight.strength}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Area to Improve</p>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{aiInsight.weakness}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Recommendation</p>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{aiInsight.recommendation}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Click "Analyze My Progress" to get AI-powered insights.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center">
        <span className="text-2xl mr-3">{icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
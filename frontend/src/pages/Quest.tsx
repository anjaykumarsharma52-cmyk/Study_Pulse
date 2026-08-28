import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { QuestProgress } from '../types';

const LEVELS = [
  { level: 1, title: 'Knowledge Seeker', xp: 0, icon: '🌱' },
  { level: 2, title: 'Study Apprentice', xp: 100, icon: '📖' },
  { level: 3, title: 'Study Warrior', xp: 250, icon: '⚔️' },
  { level: 4, title: 'Knowledge Master', xp: 500, icon: '🏆' },
  { level: 5, title: 'Grand Scholar', xp: 1000, icon: '👑' },
];

export function Quest() {
  const [quest, setQuest] = useState<QuestProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuest();
  }, []);

  const loadQuest = async () => {
    try {
      setLoading(true);
      const data = await api.quest.get();
      setQuest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quest progress');
    } finally {
      setLoading(false);
    }
  };

  const currentLevel = quest ? LEVELS.find((l) => l.level === quest.level) || LEVELS[0] : LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Loading your quest...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Quest</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Track your progression and unlock new titles!</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-6xl mb-4">{currentLevel.icon}</div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{currentLevel.title}</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 mt-1">Level {currentLevel.level}</p>

        {quest && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">{quest.xp} XP</span>
              <span className="text-gray-600 dark:text-gray-400">
                {nextLevel ? `${nextLevel.xp} XP` : 'MAX'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${quest.progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {quest.progress}% to next level
            </p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
          Your Journey
        </h3>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {LEVELS.map((level) => {
            const isCurrent = quest && level.level === quest.level;
            const isCompleted = quest && level.level < quest.level;
            const isLocked = quest && level.level > quest.level;

            return (
              <div
                key={level.level}
                className={`p-4 flex items-center gap-4 transition-colors ${
                  isCurrent ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                } ${isCompleted ? 'bg-green-50 dark:bg-green-900/10' : ''} ${isLocked ? 'opacity-50' : ''}`}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gray-100 dark:bg-gray-700">
                  {level.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{level.title}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Level {level.level}</span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                        Current
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Requires {level.xp} XP
                  </p>
                </div>
                {isCompleted && (
                  <span className="text-green-500 text-2xl">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">XP System</h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>• Base XP = Duration in minutes (e.g., 30 min session = 30 XP)</p>
          <p>• XP determines your Study Quest level</p>
          <p>• Complete sessions to level up and unlock new titles</p>
          <p>• Higher levels require more XP to progress</p>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { StudySession } from '../types';

export function History() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await api.sessions.list();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    setDeletingId(id);
    try {
      await api.sessions.delete(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study History</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage your past study sessions.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No study sessions yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Start your first session and begin your Study Quest!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{session.subject}</h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                      {session.topic}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                      {session.duration} min
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
                      +{session.xp_earned} XP
                    </span>
                  </div>
                  {session.notes && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{session.notes}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{formatDate(session.created_at)}</p>
                </div>
                <button
                  onClick={() => handleDelete(session.id)}
                  disabled={deletingId === session.id}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50"
                >
                  {deletingId === session.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
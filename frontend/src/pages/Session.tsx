import { useState } from 'react';
import { api } from '../services/api';

export function Session() {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!subject.trim() || !topic.trim() || !duration.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    const durationNum = parseInt(duration, 10);
    if (isNaN(durationNum) || durationNum <= 0 || durationNum > 1440) {
      setError('Duration must be a positive number (max 1440 minutes)');
      return;
    }

    setLoading(true);
    try {
      await api.sessions.create({ subject, topic, duration: durationNum, notes });
      setSuccess(true);
      setSubject('');
      setTopic('');
      setDuration('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Study Session</h1>
        <p className="text-gray-600 dark:text-gray-400">Record your study session and earn XP!</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg" role="status">
          Session recorded successfully! XP earned.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Data Structures & Algorithms"
          />
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Topic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="topic"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Binary Trees"
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duration (minutes) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="duration"
            required
            min="1"
            max="1440"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., 45"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="What did you study? Any key insights or problems solved?"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : 'Save Session'}
          </button>
        </div>
      </form>
    </div>
  );
}
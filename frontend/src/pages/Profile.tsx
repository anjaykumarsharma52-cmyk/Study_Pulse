import { useAuth } from '../hooks/useAuth';

export function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.email || 'User'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">StudyPulse Member</p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Information</h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">{user?.email || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400">User ID</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white font-mono">{user?.id || 'N/A'}</dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <button
            onClick={logout}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About StudyPulse</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          StudyPulse is an AI-powered study-session tracker that helps students record study sessions,
          monitor progress, earn XP through Study Quest, and receive AI-generated study insights.
        </p>
      </div>
    </div>
  );
}
import Dashboard from '../components/Dashboard/Dashboard';
import { ChartBarIcon } from '@heroicons/react/24/outline';

function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
          <ChartBarIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your skills and progress</p>
        </div>
      </div>

      {/* Dashboard Content */}
      <Dashboard />
    </div>
  );
}

export default DashboardPage;
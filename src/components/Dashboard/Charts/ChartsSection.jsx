import PieChart from './PieChart';
import BarChart from './BarChart';

function ChartsSection({ levelData, categoryData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pie Chart - Skill Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          📊 Skill Distribution
        </h3>
        <PieChart data={levelData} />
      </div>

      {/* Bar Chart - Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          📈 Category Breakdown
        </h3>
        <BarChart data={categoryData} />
      </div>
    </div>
  );
}

export default ChartsSection;
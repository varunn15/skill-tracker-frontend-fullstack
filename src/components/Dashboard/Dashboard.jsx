import { useState, useEffect } from 'react';
import StatsRow from './Stats/StatsRow';
import ChartsSection from './Charts/ChartsSection';
import InsightsPanel from './Insights/InsightsPanel';
import { getSkills } from '../../services/api';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  });
  const [levelData, setLevelData] = useState({
    labels: ['Beginner', 'Intermediate', 'Advanced'],
    values: [0, 0, 0],
  });
  const [categoryData, setCategoryData] = useState({
    labels: ['Frontend', 'Backend', 'DevOps', 'Database', 'Other'],
    values: [0, 0, 0, 0, 0],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const skillsRes = await getSkills();
      const skills = skillsRes.data || [];

      const total = skills.length;
      const beginner = skills.filter(s => s.level <= 3).length;
      const intermediate = skills.filter(s => s.level >= 4 && s.level <= 7).length;
      const advanced = skills.filter(s => s.level >= 8).length;

      setStats({ total, beginner, intermediate, advanced });

      setLevelData({
        labels: ['Beginner', 'Intermediate', 'Advanced'],
        values: [beginner, intermediate, advanced],
      });

      const categoryMap = {};
      skills.forEach(skill => {
        const cat = skill.category || 'Other';
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });

      const categories = ['Frontend', 'Backend', 'DevOps', 'Database', 'Other'];
      const categoryValues = categories.map(cat => categoryMap[cat] || 0);

      setCategoryData({
        labels: categories,
        values: categoryValues,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Failed to Load Dashboard</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsRow stats={stats} />
      <ChartsSection levelData={levelData} categoryData={categoryData} />
      <InsightsPanel /> {/* ✅ No props needed - navigation handled internally */}
    </div>
  );
}

export default Dashboard;
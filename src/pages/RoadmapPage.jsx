import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateRoadmap } from '../services/api';
import { 
  RocketLaunchIcon, 
  ClockIcon, 
  AcademicCapIcon,
  CheckBadgeIcon,
  BookOpenIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

function RoadmapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState(null);

  // Get data from location state (passed from Career Readiness)
  const { role, missingSkills, suggestedSkills } = location.state || {};

  useEffect(() => {
    if (!role || !missingSkills) {
      setError('No skills data found. Please go back to Career Readiness.');
      setLoading(false);
      return;
    }
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const response = await generateRoadmap({
        role,
        missingSkills,
        suggestedSkills: suggestedSkills || []
      });
      setRoadmap(response.data.roadmap);
    } catch (error) {
      console.error('Roadmap error:', error);
      setError('Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Generating your learning roadmap...</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-100 dark:border-red-800">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Error</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
          <button
            onClick={() => navigate('/career')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Career Readiness
          </button>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl">
            <RocketLaunchIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🚀 Your Learning Roadmap
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {roadmap.role} • {roadmap.total_weeks} weeks • {roadmap.estimated_hours} hours
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/career')}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{roadmap.total_weeks}w</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Time</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{roadmap.phases.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Learning Phases</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{roadmap.estimated_hours}h</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Effort</p>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-6">
        {roadmap.phases.map((phase, index) => (
          <div
            key={phase.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Phase Header */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                      Phase {phase.id}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Week {phase.weeks}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {phase.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{phase.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {phase.difficulty}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {phase.estimated_hours}h
                  </p>
                </div>
              </div>
            </div>

            {/* Phase Content */}
            <div className="p-6 space-y-4">
              {/* Goal */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-yellow-500" />
                  Goal
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">{phase.goal}</p>
              </div>

              {/* Skills */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <AcademicCapIcon className="w-4 h-4 text-blue-500" />
                  Skills to Learn
                </p>
                <div className="flex flex-wrap gap-2 ml-6 mt-1">
                  {phase.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full border border-blue-100 dark:border-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <CheckBadgeIcon className="w-4 h-4 text-green-500" />
                  Tasks
                </p>
                <ul className="ml-6 mt-1 space-y-1">
                  {phase.tasks.slice(0, 5).map((task, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-green-500">✔</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Projects */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <BookOpenIcon className="w-4 h-4 text-purple-500" />
                  Projects
                </p>
                <ul className="ml-6 mt-1 space-y-1">
                  {phase.projects.slice(0, 2).map((project, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-purple-500">📘</span>
                      {project}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoadmapPage;
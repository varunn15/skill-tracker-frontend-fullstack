import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateRoadmap, saveRoadmap, getRoadmap, toggleTask } from '../services/api';
import { 
  RocketLaunchIcon, 
  ClockIcon, 
  AcademicCapIcon,
  CheckBadgeIcon,
  BookOpenIcon,
  ArrowLeftIcon,
  SparklesIcon,
  DocumentIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

function RoadmapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapId, setRoadmapId] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const { role, missingSkills, suggestedSkills } = location.state || {};

  // ============================================================
  // LOAD EXISTING ROADMAP OR GENERATE NEW
  // ============================================================
  useEffect(() => {
    const loadOrGenerate = async () => {
      setLoading(true);
      try {
        // ✅ Check if there's an existing roadmap
        const existing = await getRoadmap();
        
        if (existing.data && existing.data.roadmap) {
          const r = existing.data.roadmap;
          setRoadmap(r);
          setRoadmapId(r._id);
          setProgress(r.progress || 0);
          setLoading(false);
          return;
        }

        // ✅ If no existing roadmap and we have data from career page
        if (role && missingSkills) {
          const response = await generateRoadmap({
            role,
            missingSkills,
            suggestedSkills: suggestedSkills || []
          });
          
          const roadmapData = response.data.roadmap || response.data;
          setRoadmap(roadmapData);
          setLoading(false);
          return;
        }

        // ✅ If no data at all
        setError('No skills data found. Please go back to Career Readiness.');
        setLoading(false);
        
      } catch (error) {
        console.error('Roadmap error:', error);
        setError('Failed to load roadmap. Please try again.');
        setLoading(false);
      }
    };

    loadOrGenerate();
  }, []);

  // ============================================================
  // SAVE ROADMAP
  // ============================================================
  const handleSaveRoadmap = async () => {
    if (!roadmap) return;
    
    setSaving(true);
    try {
      const response = await saveRoadmap({
        role: roadmap.role,
        levels: roadmap.levels
      });
      
      if (response.data.success) {
        setRoadmapId(response.data.roadmap._id);
        setProgress(response.data.roadmap.progress || 0);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // TOGGLE TASK
  // ============================================================
  const handleToggleTask = async (phaseIndex, taskIndex) => {
    if (!roadmapId) {
      // If not saved, save first
      await handleSaveRoadmap();
      // Then toggle
      setTimeout(() => handleToggleTask(phaseIndex, taskIndex), 500);
      return;
    }

    try {
      const response = await toggleTask({
        roadmapId,
        phaseIndex,
        taskIndex
      });

      if (response.data.success) {
        // ✅ Update local state
        const updatedRoadmap = { ...roadmap };
        updatedRoadmap.levels[phaseIndex].tasks[taskIndex].completed = 
          !updatedRoadmap.levels[phaseIndex].tasks[taskIndex].completed;
        
        setRoadmap(updatedRoadmap);
        setProgress(response.data.progress || 0);
      }
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-100 dark:border-red-800">
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Error</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
          <button
            onClick={() => navigate('/career')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Back to Career Readiness
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // NO ROADMAP STATE
  // ============================================================
  if (!roadmap || !roadmap.levels) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">No roadmap available.</p>
        <button
          onClick={() => navigate('/career')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← Back to Career Readiness
        </button>
      </div>
    );
  }

  // ============================================================
  // CALCULATE STATS
  // ============================================================
  const totalTasks = roadmap.levels.reduce((sum, l) => sum + (l.tasks?.length || 0), 0);
  const completedTasks = roadmap.levels.reduce((sum, l) => {
    return sum + (l.tasks?.filter(t => t.completed).length || 0);
  }, 0);
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalWeeks = roadmap.levels.reduce((sum, level) => {
    const match = level.duration?.match(/\d+/);
    return sum + (match ? parseInt(match[0]) : 2);
  }, 0);

  // ============================================================
  // RENDER
  // ============================================================
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
              🚀 Learning Roadmap
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {roadmap.role || role} • {totalWeeks} weeks • {roadmap.levels.length} phases
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress Display */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {progressPercent}%
            </span>
          </div>
          
          {/* Save Button */}
          {!roadmapId && (
            <button
              onClick={handleSaveRoadmap}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? 'Saving...' : '💾 Save Roadmap'}
            </button>
          )}
          
          <button
            onClick={() => navigate('/career')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalWeeks}w</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Time</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{roadmap.levels.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Learning Phases</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {completedTasks}/{totalTasks}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Tasks Completed</p>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-6">
        {roadmap.levels.map((level, phaseIndex) => (
          <div
            key={phaseIndex}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Phase Header */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                      {level.phase || `Phase ${phaseIndex + 1}`}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {level.duration || '1-2 weeks'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {level.title || `Phase ${phaseIndex + 1}`}
                  </h3>
                </div>
                {/* Phase Progress */}
                {level.tasks && level.tasks.length > 0 && (
                  <div className="text-right">
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                        style={{ 
                          width: `${(level.tasks.filter(t => t.completed).length / level.tasks.length) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {level.tasks.filter(t => t.completed).length}/{level.tasks.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Phase Content */}
            <div className="p-6 space-y-5">
              {/* Skills */}
              {level.skills && level.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                    <AcademicCapIcon className="w-4 h-4 text-blue-500" />
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {level.skills.slice(0, 6).map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full border border-blue-100 dark:border-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks with Checkboxes */}
              {level.tasks && level.tasks.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                    <CheckBadgeIcon className="w-4 h-4 text-green-500" />
                    Tasks
                  </p>
                  <ul className="space-y-2">
                    {level.tasks.map((task, taskIndex) => (
                      <li 
                        key={taskIndex} 
                        className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30 p-2 rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleToggleTask(phaseIndex, taskIndex)}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed || false}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className={task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}>
                          {task.title || task}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Projects */}
              {level.projects && level.projects.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                    <DocumentIcon className="w-4 h-4 text-purple-500" />
                    Projects
                  </p>
                  <ul className="space-y-1.5">
                    {level.projects.slice(0, 3).map((project, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-purple-500 mt-0.5">📘</span>
                        {project}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoadmapPage;
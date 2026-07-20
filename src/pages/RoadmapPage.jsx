import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateRoadmap, saveRoadmap, getRoadmap, toggleTask, getSkills } from '../services/api';
import { toast } from 'react-toastify';
import { 
  RocketLaunchIcon, 
  AcademicCapIcon,
  CheckBadgeIcon,
  DocumentIcon,
  ArrowLeftIcon,
  ArrowRightIcon
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
  const [skillsUpdated, setSkillsUpdated] = useState(false);
  const [updatedSkillsList, setUpdatedSkillsList] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // ✅ Get role from location state
  const { role, missingSkills, suggestedSkills } = location.state || {};

  // ============================================================
  // LOAD OR GENERATE ROADMAP - UPDATED
  // ============================================================
  useEffect(() => {
    const loadOrGenerate = async () => {
      setLoading(true);
      try {
        // ✅ FIX: Pass role when fetching roadmap
        const existing = await getRoadmap(role);
        
        if (existing.data && existing.data.roadmap) {
          const r = existing.data.roadmap;
          setRoadmap(r);
          setRoadmapId(r._id);
          setProgress(r.progress || 0);
          setLoading(false);
          return;
        }

        if (role && missingSkills) {
          const response = await generateRoadmap({
            role,
            missingSkills,
            suggestedSkills: suggestedSkills || []
          });
          
          if (response.data.error) {
            setError(response.data.message || response.data.error);
            setLoading(false);
            return;
          }
          
          const roadmapData = response.data.roadmap || response.data;
          setRoadmap(roadmapData);
          setLoading(false);
          return;
        }

        setError('No roadmap found. Go to Career Readiness to generate one.');
        setLoading(false);
        
      } catch (error) {
        console.error('❌ Roadmap error:', error);
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else if (error.response?.data?.error) {
          setError(error.response.data.error);
        } else {
          setError('Failed to load roadmap. Please try again.');
        }
        setLoading(false);
      }
    };

    if (role) {
      loadOrGenerate();
    } else {
      setError('No role specified. Please go back and select a career path.');
      setLoading(false);
    }
  }, [role]); // ✅ Add role as dependency

  // ============================================================
  // AUTO-SAVE ON GENERATE
  // ============================================================
  useEffect(() => {
    if (roadmap && !roadmapId && !saving && !error) {
      handleSaveRoadmap();
    }
  }, [roadmap]);

  // ============================================================
  // SAVE ROADMAP TO DATABASE
  // ============================================================
  const handleSaveRoadmap = async () => {
    if (!roadmap || roadmapId) return;
    
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
  // REFRESH SKILLS AND NAVIGATE
  // ============================================================
  const refreshSkills = async () => {
    setIsUpdating(true);
    try {
      await getSkills();
      toast.success('✅ Skills updated! Check your Skills tab.');
    } catch (error) {
      console.error('Refresh skills error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const goToSkillsTab = () => {
    navigate('/skills');
  };

  // ============================================================
  // TOGGLE TASK
  // ============================================================
  const handleToggleTask = async (phaseIndex, taskIndex) => {
    if (!roadmapId) {
      await handleSaveRoadmap();
      setTimeout(() => handleToggleTask(phaseIndex, taskIndex), 300);
      return;
    }

    try {
      const response = await toggleTask({
        roadmapId,
        phaseIndex,
        taskIndex
      });

      if (response.data.success) {
        const updatedRoadmap = { ...roadmap };
        const task = updatedRoadmap.levels[phaseIndex].tasks[taskIndex];
        task.completed = !task.completed;
        
        setRoadmap(updatedRoadmap);
        setProgress(response.data.progress || 0);

        if (task.completed && response.data.updatedSkills?.length > 0) {
          const skillNames = response.data.updatedSkills.map(s => 
            `${s.name} (${s.level}/10)`
          );
          setUpdatedSkillsList(skillNames);
          setSkillsUpdated(true);
          
          await refreshSkills();
          
          toast.success(`✅ Skills updated: ${skillNames.join(', ')}`);
          
          setTimeout(() => setSkillsUpdated(false), 8000);
        }
      }
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Failed to update task. Please try again.');
    }
  };

  // ============================================================
  // CALCULATE STATS
  // ============================================================
  const totalTasks = roadmap?.levels?.reduce((sum, l) => sum + (l.tasks?.length || 0), 0) || 0;
  const completedTasks = roadmap?.levels?.reduce((sum, l) => {
    return sum + (l.tasks?.filter(t => t.completed).length || 0);
  }, 0) || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalWeeks = roadmap?.levels?.reduce((sum, level) => {
    const match = level.duration?.match(/\d+/);
    return sum + (match ? parseInt(match[0]) : 2);
  }, 0) || 0;

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
        <p className="text-gray-500 dark:text-gray-400">No roadmap available for {role}.</p>
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
  // RENDER
  // ============================================================
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Skills Updated Notification */}
      {skillsUpdated && (
        <div className="fixed bottom-4 right-4 bg-green-100 dark:bg-green-900/30 
          border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 
          shadow-lg max-w-sm z-50 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-start gap-3">
            <span className="text-xl">⭐</span>
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Skills Updated!
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {updatedSkillsList.join(', ')}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={goToSkillsTab}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  View Skills <ArrowRightIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setSkillsUpdated(false)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
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
        
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5
            ${roadmapId 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse
              ${roadmapId ? 'bg-green-500' : 'bg-yellow-500'}`}
            />
            {roadmapId ? '✅ Saved' : saving ? '💾 Saving...' : '⚠️ Not Saved'}
          </span>
          
          <button
            onClick={handleSaveRoadmap}
            disabled={saving || !!roadmapId}
            className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2
              ${roadmapId 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-default' 
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
              }`}
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </>
            ) : roadmapId ? (
              '✅ Saved'
            ) : (
              '💾 Save Roadmap'
            )}
          </button>
          
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
                        className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30 p-2 rounded-lg transition-colors cursor-pointer group"
                        onClick={() => handleToggleTask(phaseIndex, taskIndex)}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed || false}
                          onChange={() => {}}
                          className="appearance-none w-5 h-5 rounded-md border-2 
                            border-gray-300 dark:border-gray-600 
                            bg-white dark:bg-gray-700
                            checked:bg-blue-600 checked:border-blue-600
                            dark:checked:bg-blue-500 dark:checked:border-blue-500
                            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                            hover:border-blue-400 dark:hover:border-blue-400
                            cursor-pointer transition-all duration-200
                            relative
                            checked:after:content-['✓'] checked:after:text-white 
                            checked:after:flex checked:after:items-center checked:after:justify-center 
                            checked:after:text-sm checked:after:font-bold
                            checked:after:absolute checked:after:inset-0
                            disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={saving || isUpdating}
                        />
                        <span className={task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}>
                          {task.title || task}
                        </span>
                        {isUpdating && (
                          <span className="text-xs text-gray-400 animate-pulse ml-auto">Updating...</span>
                        )}
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
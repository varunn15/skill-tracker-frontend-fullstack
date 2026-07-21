import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateRoadmap, saveRoadmap, getRoadmap, toggleTask, getSkills } from '../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  GraduationCap, 
  BadgeCheck, 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Star 
} from 'lucide-react';

function RoadmapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapId, setRoadmapId] = useState(null);
  const [error, setError] = useState(null);
  const [skillsUpdated, setSkillsUpdated] = useState(false);
  const [updatedSkillsList, setUpdatedSkillsList] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // ✅ Get role from location state
  const { role, missingSkills, suggestedSkills } = location.state || {};

  // ============================================================
  // SAVE ROADMAP TO DATABASE
  // ============================================================
  const handleSaveRoadmap = useCallback(async () => {
    if (!roadmap || roadmapId) return;
    
    setSaving(true);
    try {
      const response = await saveRoadmap({
        role: roadmap.role,
        levels: roadmap.levels
      });
      
      if (response.data.success) {
        setRoadmapId(response.data.roadmap._id);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  }, [roadmap, roadmapId]);

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
      setTimeout(() => {
        setError('No role specified. Please go back and select a career path.');
        setLoading(false);
      }, 0);
    }
  }, [role, missingSkills, suggestedSkills]); // ✅ Add dependencies

  // ============================================================
  // AUTO-SAVE ON GENERATE
  // ============================================================
  useEffect(() => {
    if (roadmap && !roadmapId && !saving && !error) {
      setTimeout(() => {
        handleSaveRoadmap();
      }, 0);
    }
  }, [roadmap, roadmapId, saving, error, handleSaveRoadmap]);

  // ============================================================
  // REFRESH SKILLS AND NAVIGATE
  // ============================================================
  const refreshSkills = async () => {
    setIsUpdating(true);
    try {
      await getSkills();
      toast.success('Skills updated! Check your Skills tab.');
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

        if (task.completed && response.data.updatedSkills?.length > 0) {
          const skillNames = response.data.updatedSkills.map(s => 
            `${s.name} (${s.level}/10)`
          );
          setUpdatedSkillsList(skillNames);
          setSkillsUpdated(true);
          
          await refreshSkills();
          
          toast.success(`Skills updated: ${skillNames.join(', ')}`);
          
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
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Career Readiness
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
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Career Readiness
        </button>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Skills Updated Notification */}
      <AnimatePresence>
        {skillsUpdated && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900/50 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)] max-w-sm z-50 flex items-start gap-3.5"
          >
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Skills Upgraded!
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                {updatedSkillsList.join(', ')}
              </p>
              <div className="flex gap-2.5 mt-3.5">
                <button
                  onClick={goToSkillsTab}
                  className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-3 py-1.5 rounded-lg hover:brightness-105 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
                >
                  View Skills <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setSkillsUpdated(false)}
                  className="text-xs text-gray-500 dark:text-gray-400 font-bold hover:text-gray-700 dark:hover:text-gray-200 transition-colors px-2 py-1.5"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-5">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-md shadow-blue-500/10">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Learning Roadmap
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {roadmap.role || role} • <span className="text-blue-500 dark:text-blue-400 font-bold">{totalWeeks} weeks</span> • {roadmap.levels.length} phases
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border
            ${roadmapId 
              ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-100/40 dark:border-green-900/10' 
              : 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 border-yellow-100/40 dark:border-yellow-900/10'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse
              ${roadmapId ? 'bg-green-500' : 'bg-yellow-500'}`}
            />
            {roadmapId ? 'Saved' : saving ? 'Saving...' : 'Draft'}
          </span>
          
          <button
            onClick={handleSaveRoadmap}
            disabled={saving || !!roadmapId}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5
              ${roadmapId 
                ? 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100/30 dark:border-green-900/20 cursor-default' 
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98]'
              }`}
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </>
            ) : roadmapId ? (
              'Saved'
            ) : (
              'Save Roadmap'
            )}
          </button>
          
          <button
            onClick={() => navigate('/career')}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Estimated Time', val: `${totalWeeks} Weeks`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/50 dark:bg-blue-950/10' },
          { label: 'Learning Phases', val: `${roadmap.levels.length} Phases`, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50/50 dark:bg-green-950/10' },
          { label: 'Tasks Completed', val: `${completedTasks} / ${totalTasks}`, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50/50 dark:bg-purple-950/10' },
        ].map((item, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 text-center shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.02)] transition-all duration-300"
          >
            <p className={`text-xl font-extrabold tracking-tight ${item.color}`}>{item.val}</p>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-1.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Overall Completion Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-8">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overall Completion</p>
          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700/50 h-2.5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-6">
        {roadmap.levels.map((level, phaseIndex) => {
          const completedCount = level.tasks?.filter(t => t.completed).length || 0;
          const totalCount = level.tasks?.length || 0;
          const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: phaseIndex * 0.1, duration: 0.4 }}
              key={phaseIndex}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300"
            >
              {/* Phase Header */}
              <div className="p-6 bg-gradient-to-r from-gray-50/80 to-blue-50/20 dark:from-gray-900/20 dark:to-blue-950/5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100/30 dark:border-blue-900/20">
                      {level.phase || `Phase ${phaseIndex + 1}`}
                    </span>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" /> {level.duration || '1-2 weeks'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2 tracking-tight">
                    {level.title || `Phase ${phaseIndex + 1}`}
                  </h3>
                </div>
                {totalCount > 0 && (
                  <div className="sm:text-right min-w-[120px]">
                    <div className="flex items-center gap-2 mb-1.5 sm:justify-end">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {completedCount} of {totalCount} completed
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-md">
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full sm:w-32 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden ml-auto">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Phase Content */}
              <div className="p-6 space-y-6">
                {/* Skills */}
                {level.skills && level.skills.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <GraduationCap className="w-4 h-4 text-blue-500" />
                      Core Competencies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {level.skills.slice(0, 8).map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl border border-blue-100/30 dark:border-blue-900/10 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-all cursor-default"
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
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <BadgeCheck className="w-4 h-4 text-green-500" />
                      Required Action Steps
                    </p>
                    <ul className="space-y-2">
                      {level.tasks.map((task, taskIndex) => {
                        const isCompleted = task.completed || false;
                        return (
                          <motion.li 
                            whileHover={{ x: 4 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            key={taskIndex} 
                            className={`flex items-center gap-3.5 text-xs font-semibold p-3 rounded-xl transition-all duration-200 cursor-pointer border group
                              ${isCompleted 
                                ? 'bg-gray-50/50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-800/50 text-gray-400 dark:text-gray-500' 
                                : 'bg-white dark:bg-gray-800/40 border-gray-100 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-blue-50/20 dark:hover:bg-blue-950/5 hover:border-blue-100/30'
                              }`}
                            onClick={() => handleToggleTask(phaseIndex, taskIndex)}
                          >
                            <div className="relative flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={isCompleted}
                                onChange={() => {}}
                                className="sr-only"
                                disabled={saving || isUpdating}
                              />
                              <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                                ${isCompleted 
                                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-transparent text-white shadow-sm' 
                                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-400'
                                }
                                ${saving || isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                {isCompleted && (
                                  <svg className="w-3.5 h-3.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className={`leading-relaxed flex-1 ${isCompleted ? 'line-through opacity-75' : ''}`}>
                              {task.title || task}
                            </span>
                            {isUpdating && (
                              <span className="text-[10px] font-bold text-gray-400 animate-pulse ml-auto">Syncing...</span>
                            )}
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Projects */}
                {level.projects && level.projects.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <FileText className="w-4 h-4 text-purple-500" />
                      Milestone Projects
                    </p>
                    <ul className="space-y-2.5">
                      {level.projects.slice(0, 3).map((project, i) => (
                        <li 
                          key={i} 
                          className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-start gap-3 bg-purple-50/20 dark:bg-purple-950/10 p-3.5 rounded-xl border border-purple-100/30 dark:border-purple-900/10"
                        >
                          <BookOpen className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{project}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default RoadmapPage;
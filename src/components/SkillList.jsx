import { useState } from "react";
import { toast } from "react-toastify";
import { deleteSkill } from "../services/api";
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

function SkillList({ skills, loading, error, onEdit, onDelete, onRetry }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;

    setDeletingId(id);
    try {
      await deleteSkill(id);
      toast.success("✅ Skill deleted!");
      onDelete();
    } catch (err) {
      // Error handled by interceptor
    } finally {
      setDeletingId(null);
    }
  };

  const getLevelInfo = (level) => {
    const levels = {
      1: { emoji: '😴', label: 'Beginner', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
      2: { emoji: '🌱', label: 'Beginner', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
      3: { emoji: '🌿', label: 'Beginner', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
      4: { emoji: '🌳', label: 'Intermediate', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
      5: { emoji: '🚀', label: 'Intermediate', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
      6: { emoji: '💪', label: 'Intermediate', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
      7: { emoji: '🏆', label: 'Advanced', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
      8: { emoji: '👑', label: 'Advanced', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
      9: { emoji: '⭐', label: 'Expert', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
      10: { emoji: '🌟', label: 'Expert', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' }
    };
    return levels[level] || levels[1];
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading your skills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🔌</div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Connection Error</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200" onClick={onRetry}>
          🔄 Try Again
        </button>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎯</div>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No skills yet</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">Add your first skill above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {skills.map((skill) => {
        const levelInfo = getLevelInfo(skill.level);
        return (
          <div
            key={skill._id}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 group"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Left - Skill Info */}
              <div className="flex-1 min-w-[140px]">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                  {skill.skillName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${levelInfo.color}`}>
                    {levelInfo.emoji} {levelInfo.label}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full">
                    {skill.experience === 'learned' && '📖 Learned'}
                    {skill.experience === 'practiced' && '🔧 Practiced'}
                    {skill.experience === 'project' && '🚀 Project'}
                  </span>
                  {skill.category && (
                    <span className="text-xs px-2.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                      📁 {skill.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Right - Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(skill)}
                  className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  disabled={deletingId === skill._id}
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(skill._id)}
                  className="px-4 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  disabled={deletingId === skill._id}
                >
                  {deletingId === skill._id ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-3.5 h-3.5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SkillList;
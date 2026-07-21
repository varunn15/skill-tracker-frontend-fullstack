import { useState } from "react";
import { toast } from "react-toastify";
import { deleteSkill } from "../services/api";
import { 
  Pencil, 
  Trash2, 
  WifiOff, 
  RefreshCw, 
  Target, 
  BookOpen, 
  Wrench, 
  Briefcase, 
  Folder,
  Compass,
  TrendingUp,
  Trophy,
  Crown
} from 'lucide-react';
import { motion } from "framer-motion";

function SkillList({ skills, loading, error, onEdit, onDelete, onRetry }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;

    setDeletingId(id);
    try {
      await deleteSkill(id);
      toast.success("Skill deleted!");
      onDelete();
    } catch (err) {
      console.error("Delete skill failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const getLevelInfo = (level) => {
    const levels = {
      1: { icon: Compass, label: 'Beginner', color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100/30' },
      2: { icon: Compass, label: 'Beginner', color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100/30' },
      3: { icon: Compass, label: 'Beginner', color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100/30' },
      4: { icon: TrendingUp, label: 'Intermediate', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100/30' },
      5: { icon: TrendingUp, label: 'Intermediate', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100/30' },
      6: { icon: TrendingUp, label: 'Intermediate', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100/30' },
      7: { icon: Trophy, label: 'Advanced', color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-100/30' },
      8: { icon: Trophy, label: 'Advanced', color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-100/30' },
      9: { icon: Crown, label: 'Expert', color: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-100/30' },
      10: { icon: Crown, label: 'Expert', color: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-100/30' }
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
        <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Connection Error</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
        <button 
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 mx-auto" 
          onClick={onRetry}
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No skills yet</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">Add your first skill above!</p>
      </div>
    );
  }

  return (
    <motion.div layout className="space-y-3">
      {skills.map((skill) => {
        const levelInfo = getLevelInfo(skill.level);
        return (
          <motion.div
            layout
            key={skill._id}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="bg-gray-50/60 dark:bg-gray-700/30 rounded-2xl p-4.5 hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-blue-200/50 dark:hover:border-blue-900/50 group"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Left - Skill Info */}
              <div className="flex-1 min-w-[140px]">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base tracking-tight">
                  {skill.skillName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${levelInfo.color}`}>
                    <levelInfo.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{levelInfo.label}</span>
                  </span>
                  <span className="text-xs px-2.5 py-0.5 bg-gray-200/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 font-semibold rounded-full flex items-center gap-1">
                    {skill.experience === 'learned' && (
                      <>
                        <BookOpen className="w-3 h-3 text-blue-500" />
                        <span>Learned</span>
                      </>
                    )}
                    {skill.experience === 'practiced' && (
                      <>
                        <Wrench className="w-3 h-3 text-orange-500" />
                        <span>Practiced</span>
                      </>
                    )}
                    {skill.experience === 'project' && (
                      <>
                        <Briefcase className="w-3 h-3 text-green-500" />
                        <span>Project</span>
                      </>
                    )}
                  </span>
                  {skill.category && (
                    <span className="text-xs px-2.5 py-0.5 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 font-semibold rounded-full border border-purple-100/40 dark:border-purple-900/20 flex items-center gap-1">
                      <Folder className="w-3 h-3 text-purple-500" />
                      <span>{skill.category}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Right - Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(skill)}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-xs transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5 border border-blue-100/30 dark:border-blue-900/20"
                  disabled={deletingId === skill._id}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(skill._id)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold rounded-xl text-xs transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5 border border-red-100/30 dark:border-red-900/20"
                  disabled={deletingId === skill._id}
                >
                  {deletingId === skill._id ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export default SkillList;
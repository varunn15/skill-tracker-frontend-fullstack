import { useState } from "react";
import { toast } from "react-toastify";
import { deleteSkill } from "../services/api";
import "./SkillList.css";

function SkillList({ skills, loading, onEdit, onDelete }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    // Confirmation before deleting
    if (!window.confirm("Are you sure you want to delete this skill?")) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteSkill(id);
      toast.success("✅ Skill deleted successfully!");
      onDelete();
    } catch (err) {
      console.error("Error deleting skill:", err);
      toast.error("❌ Error deleting skill. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      'Beginner': 'level-beginner',
      'Intermediate': 'level-intermediate',
      'Advanced': 'level-advanced',
      'Expert': 'level-expert'
    };
    return colors[level] || 'level-beginner';
  };

  const getLevelEmoji = (level) => {
    const emojis = {
      'Beginner': '🌱',
      'Intermediate': '🚀',
      'Advanced': '💪',
      'Expert': '🏆'
    };
    return emojis[level] || '📚';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your skills...</p>
        <p className="loading-subtext">Please wait a moment</p>
      </div>
    );
  }

  return (
    <div className="skill-list-container">
      <div className="list-header">
        <h2 className="list-title">📚 Your Skills</h2>
        <span className="skill-count">{skills.length} skills</span>
      </div>

      {skills.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <p className="empty-text">No skills added yet</p>
          <p className="empty-subtext">Start adding your skills above!</p>
        </div>
      ) : (
        <ul className="skill-grid">
          {skills.map((skill) => (
            <li key={skill._id} className="skill-card">
              <div className="skill-content">
                <div className="skill-info">
                  <h3 className="skill-name">{skill.name}</h3>
                  <span className={`skill-level ${getLevelColor(skill.level)}`}>
                    {getLevelEmoji(skill.level)} {skill.level}
                  </span>
                </div>
                <div className="skill-actions">
                  <button 
                    onClick={() => onEdit(skill)} 
                    className="btn-action btn-edit"
                    title="Edit skill"
                    disabled={deletingId === skill._id}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(skill._id)} 
                    className="btn-action btn-delete"
                    title="Delete skill"
                    disabled={deletingId === skill._id}
                  >
                    {deletingId === skill._id ? (
                      <>
                        <span className="spinner-small"></span>
                        Deleting...
                      </>
                    ) : (
                      '🗑️ Delete'
                    )}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SkillList;
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createSkill, updateSkill } from "../services/api";
import "./SkillForm.css";

function SkillForm({ onSkillAdded, editingSkill, onUpdateDone, isSubmitting, setIsSubmitting }) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    if (editingSkill) {
      setName(editingSkill.name);
      setLevel(editingSkill.level);
    }
  }, [editingSkill]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !level) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingSkill) {
        await updateSkill(editingSkill._id, { name, level });
        toast.success("✅ Skill updated successfully!");
        if (onUpdateDone) onUpdateDone();
      } else {
        await createSkill({ name, level });
        toast.success("✅ Skill added successfully!");
      }

      setName("");
      setLevel("");

      if (onSkillAdded) onSkillAdded();
    } catch (err) {
      console.error("Error saving skill:", err);
      toast.error("❌ Error saving skill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setLevel("");
    if (editingSkill && onUpdateDone) {
      onUpdateDone();
    }
  };

  return (
    <form className="skill-form" onSubmit={handleSubmit}>
      <h2 className="form-title">
        {editingSkill ? "✏️ Edit Skill" : "➕ Add New Skill"}
      </h2>

      <div className="form-group">
        <label htmlFor="skillName">Skill Name</label>
        <input
          id="skillName"
          type="text"
          placeholder="e.g., React, Python, Design..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="skillLevel">Skill Level</label>
        <select
          id="skillLevel"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="form-select"
          disabled={isSubmitting}
        >
          <option value="">Select level</option>
          <option value="Beginner">🌱 Beginner</option>
          <option value="Intermediate">🚀 Intermediate</option>
          <option value="Advanced">💪 Advanced</option>
          <option value="Expert">🏆 Expert</option>
        </select>
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              {editingSkill ? "Updating..." : "Adding..."}
            </>
          ) : (
            editingSkill ? "Update Skill" : "Add Skill"
          )}
        </button>
        {editingSkill && (
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default SkillForm;
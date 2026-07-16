import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createSkill, updateSkill } from "../services/api";
import "./SkillForm.css";

function SkillForm({ onSkillAdded, editingSkill, onUpdateDone, isSubmitting, setIsSubmitting }) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (editingSkill) {
      setName(editingSkill.name);
      setLevel(editingSkill.level);
      setErrors({});
    }
  }, [editingSkill]);

  const validate = () => {
    let newErrors = {};
    if (!name || name.trim() === "") {
      newErrors.name = "Skill name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Skill name must be at least 2 characters";
    } else if (name.trim().length > 100) {
      newErrors.name = "Skill name must be less than 100 characters";
    }
    if (!level) {
      newErrors.level = "Please select a skill level";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (errors.name && value.trim() !== "") {
      setErrors({ ...errors, name: "" });
    }
  };

  const handleLevelChange = (e) => {
    const value = e.target.value;
    setLevel(value);
    if (errors.level && value) {
      setErrors({ ...errors, level: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, level: true });

    if (!validate()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    // ✅ OPTIMISTIC UI: Create temporary skill
    const skillData = { name: name.trim(), level };
    const tempId = `temp-${Date.now()}`;
    const tempSkill = { ...skillData, _id: tempId };

    // ✅ Update parent immediately (if parent supports it)
    // For now, we'll just show loading state

    try {
      if (editingSkill) {
        await updateSkill(editingSkill._id, skillData);
        toast.success("✅ Skill updated successfully!");
        if (onUpdateDone) onUpdateDone();
      } else {
        const response = await createSkill(skillData);
        toast.success("✅ Skill added successfully!");
        if (onSkillAdded) onSkillAdded();
      }

      setName("");
      setLevel("");
      setErrors({});
      setTouched({});

    } catch (err) {
      // Error is handled by interceptor
      // ✅ Rollback optimistic update would go here
      console.error("Error saving skill:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setLevel("");
    setErrors({});
    setTouched({});
    if (editingSkill && onUpdateDone) {
      onUpdateDone();
    }
  };

  return (
    <form className="skill-form" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">
        {editingSkill ? "✏️ Edit Skill" : "➕ Add New Skill"}
      </h2>

      <div className="form-group">
        <label htmlFor="skillName">
          Skill Name <span className="required-star">*</span>
        </label>
        <input
          id="skillName"
          type="text"
          placeholder="e.g., React, Python, Design..."
          value={name}
          onChange={handleNameChange}
          onBlur={() => handleBlur('name')}
          className={`form-input ${errors.name && touched.name ? 'input-error' : ''}`}
          disabled={isSubmitting}
          maxLength={100}
        />
        {errors.name && touched.name && (
          <p className="error-message">{errors.name}</p>
        )}
        <small className="input-hint">
          {name.length}/100 characters
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="skillLevel">
          Skill Level <span className="required-star">*</span>
        </label>
        <select
          id="skillLevel"
          value={level}
          onChange={handleLevelChange}
          onBlur={() => handleBlur('level')}
          className={`form-select ${errors.level && touched.level ? 'input-error' : ''}`}
          disabled={isSubmitting}
        >
          <option value="">Select level</option>
          <option value="Beginner">🌱 Beginner</option>
          <option value="Intermediate">🚀 Intermediate</option>
          <option value="Advanced">💪 Advanced</option>
          <option value="Expert">🏆 Expert</option>
        </select>
        {errors.level && touched.level && (
          <p className="error-message">{errors.level}</p>
        )}
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
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
      // Clear errors when editing
      setErrors({});
    }
  }, [editingSkill]);

  // ✅ Validation function
  const validate = () => {
    let newErrors = {};
    
    // Name validation
    if (!name || name.trim() === "") {
      newErrors.name = "Skill name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Skill name must be at least 2 characters";
    } else if (name.trim().length > 100) {
      newErrors.name = "Skill name must be less than 100 characters";
    }

    // Level validation
    if (!level) {
      newErrors.level = "Please select a skill level";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle field blur for validation
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  // ✅ Handle field change with real-time validation
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    
    // Clear error while typing
    if (errors.name && value.trim() !== "") {
      setErrors({ ...errors, name: "" });
    }
  };

  const handleLevelChange = (e) => {
    const value = e.target.value;
    setLevel(value);
    
    // Clear error while selecting
    if (errors.level && value) {
      setErrors({ ...errors, level: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ name: true, level: true });

    // ✅ Validate before submitting
    if (!validate()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const skillData = { 
        name: name.trim(), 
        level 
      };

      if (editingSkill) {
        await updateSkill(editingSkill._id, skillData);
        toast.success("✅ Skill updated successfully!");
        if (onUpdateDone) onUpdateDone();
      } else {
        await createSkill(skillData);
        toast.success("✅ Skill added successfully!");
      }

      // Reset form
      setName("");
      setLevel("");
      setErrors({});
      setTouched({});

      if (onSkillAdded) onSkillAdded();
    } catch (err) {
      console.error("Error saving skill:", err);
      
      // Handle backend validation errors
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(`❌ ${err.response.data.error}`);
      } else {
        toast.error("❌ Error saving skill. Please try again.");
      }
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
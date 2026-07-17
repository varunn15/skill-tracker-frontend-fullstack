import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { searchSkills, createSkill, updateSkill, createSkillInRegistry } from "../services/api";
import useDebounce from "../hooks/useDebounce";
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

function SkillForm({ onSkillAdded, editingSkill, onUpdateDone, isSubmitting, setIsSubmitting }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [level, setLevel] = useState(5);
  const [category, setCategory] = useState("Other");
  const [experience, setExperience] = useState("learned");
  
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [errors, setErrors] = useState({});
  
  const debouncedSearch = useDebounce(searchTerm, 300);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (editingSkill) {
      setSelectedSkill({
        skillId: editingSkill.skillId,
        name: editingSkill.skillName
      });
      setSearchTerm(editingSkill.skillName);
      setLevel(editingSkill.level || 5);
      setCategory(editingSkill.category || "Other");
      setExperience(editingSkill.experience || "learned");
    }
  }, [editingSkill]);

  // Search with 1 character minimum
  useEffect(() => {
    if (debouncedSearch.length >= 1) {
      fetchSuggestions(debouncedSearch);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearch]);

  const fetchSuggestions = async (query) => {
    setSearching(true);
    try {
      const response = await searchSkills(query);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setSuggestions(response.data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(true); // ✅ Keep dropdown open for "Add new"
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(true); // ✅ Keep dropdown open for "Add new"
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSkill = (skill) => {
    setSelectedSkill(skill);
    setSearchTerm(skill.name);
    setCategory(skill.category || "Other");
    setShowSuggestions(false);
    setErrors({ ...errors, skill: "" });
  };

  const handleCreateNewSkill = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a skill name");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createSkillInRegistry({
        name: searchTerm.trim(),
        category: category
      });
      const newSkill = response.data.skill;
      
      // Auto-select the new skill
      setSelectedSkill(newSkill);
      setSearchTerm(newSkill.name);
      setCategory(newSkill.category || "Other");
      setShowSuggestions(false);
      setErrors({ ...errors, skill: "" });
      
      toast.success(`✅ "${newSkill.name}" added to registry!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedSkill) {
      newErrors.skill = "Please select a skill from suggestions";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please select a skill from the list");
      return;
    }

    setIsSubmitting(true);

    try {
      const skillData = {
        skillId: selectedSkill.skillId,
        level: level,
        category: category,
        experience: experience
      };

      if (editingSkill) {
        await updateSkill(editingSkill._id, skillData);
        toast.success("✅ Skill updated!");
        if (onUpdateDone) onUpdateDone();
      } else {
        await createSkill(skillData);
        toast.success("✅ Skill added!");
        resetForm();
      }

      if (onSkillAdded) onSkillAdded();

    } catch (error) {
      toast.error(error.response?.data?.error || "Error saving skill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSearchTerm("");
    setSelectedSkill(null);
    setLevel(5);
    setCategory("Other");
    setExperience("learned");
    setErrors({});
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleCancel = () => {
    resetForm();
    if (editingSkill && onUpdateDone) onUpdateDone();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const levelEmojis = ['😴', '🌱', '🌿', '🌳', '🚀', '💪', '🏆', '👑', '⭐', '🌟'];
  const levelLabels = ['', '', '', '', 'Intermediate', '', '', 'Advanced', '', 'Expert'];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Skill Input */}
      <div className="space-y-1.5" ref={suggestionsRef}>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Skill Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Start typing to search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.length >= 1) setShowSuggestions(true);
              }}
              onFocus={() => {
                if (searchTerm.length >= 1) {
                  setShowSuggestions(true);
                }
              }}
              className={`w-full px-4 py-2.5 pl-10 bg-white dark:bg-gray-900 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all duration-200 text-gray-900 dark:text-gray-100 ${
                errors.skill ? 'border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
              }`}
              disabled={isSubmitting}
              autoComplete="off"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* ✅ FIXED: Suggestions Dropdown - ALWAYS SHOWS WHEN TYPING */}
          {showSuggestions && searchTerm.length >= 1 && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto animate-[slideDown_0.2s_ease-out]">
              {/* Show existing suggestions if they exist */}
              {suggestions.length > 0 && (
                <>
                  {suggestions.map((skill) => (
                    <button
                      key={skill.skillId}
                      type="button"
                      onClick={() => handleSelectSkill(skill)}
                      className="w-full px-4 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <span className="font-medium text-gray-800 dark:text-gray-200">{skill.name}</span>
                      {skill.category && (
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                          {skill.category}
                        </span>
                      )}
                    </button>
                  ))}
                  {/* Separator */}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                </>
              )}
              
              {/* ✅ ALWAYS SHOW "Add new" when typing */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCreateNewSkill();
                }}
                className="w-full px-4 py-3 text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2 bg-blue-50/50 dark:bg-blue-900/20 font-medium"
                style={{ cursor: 'pointer' }}
              >
                <PlusIcon className="w-5 h-5 flex-shrink-0" />
                <span>
                  {suggestions.length > 0 
                    ? `➕ Add "${searchTerm}" as new skill` 
                    : `➕ Create "${searchTerm}" (not found, add to registry)`}
                </span>
              </button>
            </div>
          )}
        </div>
        {errors.skill && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <span>⚠️</span> {errors.skill}
          </p>
        )}
        {selectedSkill && (
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <span>✅</span> Selected: {selectedSkill.name}
          </p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all duration-200 text-gray-900 dark:text-gray-100"
          disabled={isSubmitting}
        >
          <option value="Frontend">🎨 Frontend</option>
          <option value="Backend">⚙️ Backend</option>
          <option value="DevOps">☁️ DevOps</option>
          <option value="Database">🗄️ Database</option>
          <option value="Other">📦 Other</option>
        </select>
      </div>

      {/* Level Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Level</label>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {level}/10 <span className="text-gray-400 dark:text-gray-500 font-normal">{levelLabels[level - 1]}</span>
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          disabled={isSubmitting}
        />
        <div className="flex justify-between text-xs">
          {levelEmojis.map((emoji, index) => (
            <span key={index} className={index < level ? 'opacity-100' : 'opacity-20'}>
              {emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'learned', label: '📖 Learned', desc: 'Theory' },
            { value: 'practiced', label: '🔧 Practiced', desc: 'Projects' },
            { value: 'project', label: '🚀 Project', desc: 'Real work' },
          ].map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer text-center p-2.5 rounded-lg border-2 transition-all duration-200 ${
                experience === option.value 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <input
                type="radio"
                name="experience"
                value={option.value}
                checked={experience === option.value}
                onChange={(e) => setExperience(e.target.value)}
                className="hidden"
                disabled={isSubmitting}
              />
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{option.label}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">{option.desc}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className="flex-1 min-w-[120px] px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 hover:shadow-lg focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              {editingSkill ? "Updating..." : "Adding..."}
            </>
          ) : (
            editingSkill ? "Update Skill" : "Add Skill"
          )}
        </button>
        {editingSkill && (
          <button type="button" className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleCancel}>
            Cancel
          </button>
        )}
        {!editingSkill && (
          <button type="button" className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" onClick={resetForm}>
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

export default SkillForm;
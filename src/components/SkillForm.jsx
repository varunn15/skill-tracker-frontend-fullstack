import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { searchSkills, createSkill, updateSkill, createSkillInRegistry } from "../services/api";
import useDebounce from "../hooks/useDebounce";
import { 
  Search, 
  Plus, 
  BookOpen, 
  Wrench, 
  Briefcase, 
  AlertCircle, 
  Check 
} from 'lucide-react';

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

  useEffect(() => {
    if (editingSkill) {
      setTimeout(() => {
        setSelectedSkill({
          skillId: editingSkill.skillId,
          name: editingSkill.skillName
        });
        setSearchTerm(editingSkill.skillName);
        setLevel(editingSkill.level || 5);
        setCategory(editingSkill.category || "Other");
        setExperience(editingSkill.experience || "learned");
      }, 0);
    }
  }, [editingSkill]);

  // Search with 1 character minimum
  useEffect(() => {
    setTimeout(() => {
      if (debouncedSearch.length >= 1) {
        fetchSuggestions(debouncedSearch);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 0);
  }, [debouncedSearch]);

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
      
      toast.success(`"${newSkill.name}" added to registry!`);
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
        toast.success("Skill updated!");
        if (onUpdateDone) onUpdateDone();
      } else {
        await createSkill(skillData);
        toast.success("Skill added!");
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

  const levelLabels = ['Beginner', 'Beginner', 'Beginner', 'Intermediate', 'Intermediate', 'Intermediate', 'Advanced', 'Advanced', 'Expert', 'Expert'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Skill Input */}
      <div className="space-y-2" ref={suggestionsRef}>
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
              className={`w-full px-4 py-2.5 pl-10 bg-white dark:bg-gray-900 border rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all duration-200 text-gray-900 dark:text-gray-100 ${
                errors.skill ? 'border-red-500 focus:border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
              }`}
              disabled={isSubmitting}
              autoComplete="off"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          {searching && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && searchTerm.length >= 1 && (
            <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto animate-[slideDown_0.2s_ease-out]">
              {suggestions.length > 0 && (
                <>
                  {suggestions.map((skill) => (
                    <button
                      key={skill.skillId}
                      type="button"
                      onClick={() => handleSelectSkill(skill)}
                      className="w-full px-4 py-2.5 text-left hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{skill.name}</span>
                      {skill.category && (
                        <span className="text-xs px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                          {skill.category}
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                </>
              )}
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCreateNewSkill();
                }}
                className="w-full px-4 py-3 text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2 bg-blue-50/30 dark:bg-blue-900/10 font-semibold text-sm"
                style={{ cursor: 'pointer' }}
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                <span>
                  {suggestions.length > 0 
                    ? `Add "${searchTerm}" as new skill` 
                    : `Create "${searchTerm}" in registry`}
                </span>
              </button>
            </div>
          )}
        </div>
        {errors.skill && (
          <p className="text-sm text-red-500 flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errors.skill}</span>
          </p>
        )}
        {selectedSkill && (
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5 font-medium">
            <Check className="w-4 h-4 text-green-500 shrink-0" />
            <span>Selected: {selectedSkill.name}</span>
          </p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-400/10 transition-all duration-200 text-gray-900 dark:text-gray-100 text-sm font-medium"
          disabled={isSubmitting}
        >
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="DevOps">DevOps</option>
          <option value="Database">Database</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Level Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</label>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {level}/10 <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">({levelLabels[level - 1]})</span>
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all focus:outline-none"
          disabled={isSubmitting}
        />
        <div className="flex justify-between px-1.5 select-none pt-1">
          {Array.from({ length: 10 }).map((_, index) => (
            <span 
              key={index} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index < level 
                  ? 'bg-blue-600 dark:bg-blue-400 scale-125 shadow-sm shadow-blue-500/20' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Experience</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'learned', label: 'Learned', icon: BookOpen, desc: 'Theory', iconColor: 'text-blue-500' },
            { value: 'practiced', label: 'Practiced', icon: Wrench, desc: 'Projects', iconColor: 'text-orange-500' },
            { value: 'project', label: 'Project', icon: Briefcase, desc: 'Real work', iconColor: 'text-green-500' },
          ].map((option) => {
            const IconComponent = option.icon;
            return (
              <label
                key={option.value}
                className={`cursor-pointer text-center p-3 rounded-xl border transition-all duration-200 select-none flex flex-col justify-center items-center gap-1.5 ${
                  experience === option.value 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm ring-2 ring-blue-500/10' 
                    : 'border-gray-200 dark:border-gray-700/80 hover:border-blue-200 dark:hover:border-blue-800/80 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
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
                <IconComponent className={`w-5 h-5 ${option.iconColor}`} />
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{option.label}</div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500 mt-0.5">{option.desc}</div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-3">
        <button 
          type="submit" 
          className="flex-1 min-w-[120px] px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:brightness-105 active:scale-[0.99] hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              {editingSkill ? "Updating..." : "Adding..."}
            </span>
          ) : (
            editingSkill ? "Update Skill" : "Add Skill"
          )}
        </button>
        {editingSkill && (
          <button 
            type="button" 
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200/50 dark:border-gray-700/50" 
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}
        {!editingSkill && (
          <button 
            type="button" 
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200/50 dark:border-gray-700/50" 
            onClick={resetForm}
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

export default SkillForm;
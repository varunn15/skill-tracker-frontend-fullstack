import SkillForm from '../components/SkillForm';
import SkillList from '../components/SkillList';
import ResumeUpload from '../components/ResumeUpload';
import { PlusCircle, BarChart3 } from 'lucide-react';
import { toast } from 'react-toastify';

function SkillsPage({
  skills,
  loading,
  error,
  editingSkill,
  onEdit,
  onDelete,
  onRetry,
  onSkillAdded,
  onUpdateDone,
  isSubmitting,
  setIsSubmitting
}) {
  const handleSkillsExtracted = (extractedSkills) => {
    // Refresh skills list after extraction
    if (onSkillAdded) {
      onSkillAdded();
    }
    toast.success(`${extractedSkills.length} skills added from resume!`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Left Column - Form & Resume Upload */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {editingSkill ? "Edit Skill" : "Add New Skill"}
            </h2>
          </div>
          <SkillForm
            onSkillAdded={onSkillAdded}
            editingSkill={editingSkill}
            onUpdateDone={onUpdateDone}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </div>

        {/* Resume Upload */}
        <ResumeUpload onSkillsExtracted={handleSkillsExtracted} />
      </div>

      {/* Right Column - Skills List */}
      <div className="lg:col-span-3">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Your Skills</h2>
            </div>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
              {skills.length} skills
            </span>
          </div>
          <SkillList
            skills={skills}
            loading={loading}
            error={error}
            onEdit={onEdit}
            onDelete={onDelete}
            onRetry={onRetry}
          />
        </div>
      </div>
    </div>
  );
}

export default SkillsPage;
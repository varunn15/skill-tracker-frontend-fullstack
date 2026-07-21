import { CheckCircle2, AlertCircle } from 'lucide-react';

function MissingSkills({ skills = [], role = '' }) {
  if (!skills || skills.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {role ? `Great job! No missing skills for ${role}.` : 'No missing skills identified!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {skills.map((skill, index) => (
        <div
          key={index}
          className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100/50 dark:border-red-900/30"
        >
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {typeof skill === 'string' ? skill : skill.name || skill}
          </span>
          {typeof skill === 'object' && skill.reason && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              {skill.reason}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default MissingSkills;
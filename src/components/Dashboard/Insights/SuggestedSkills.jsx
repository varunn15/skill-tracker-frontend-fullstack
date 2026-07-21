import { Lightbulb } from 'lucide-react';

function SuggestedSkills({ skills = [] }) {
  if (skills.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No suggestions yet. Add more skills!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {skills.map((skill, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {skill.name || skill}
          </span>
          {skill.category && (
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
              {skill.category}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default SuggestedSkills;
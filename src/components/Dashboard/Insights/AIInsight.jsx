import { Bot, Sparkles } from 'lucide-react';

function AIInsight({ insight }) {
  // ✅ Handle both string and object insight
  let displayInsight = insight;
  
  if (typeof insight === 'object' && insight !== null) {
    // If insight is an object, extract the message
    displayInsight = insight.message || insight.insight || JSON.stringify(insight);
  }

  if (!displayInsight || displayInsight === 'null' || displayInsight === 'undefined') {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg flex items-center gap-3">
        <Bot className="w-5 h-5 text-gray-400 shrink-0 animate-pulse" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No insight available yet. Click "Get Insights" to analyze your skills!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg border border-blue-100/50 dark:border-blue-900/30">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-blue-100 dark:bg-blue-950/40 rounded-lg shrink-0">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Career Insight</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{displayInsight}</p>
        </div>
      </div>
    </div>
  );
}

export default AIInsight;
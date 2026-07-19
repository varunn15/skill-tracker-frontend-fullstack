function AIInsight({ insight }) {
  if (!insight) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          🤖 No insight available yet. Click "Get Insights" to analyze your skills!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <span className="text-xl">🧠</span>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Insight</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight}</p>
        </div>
      </div>
    </div>
  );
}

export default AIInsight;
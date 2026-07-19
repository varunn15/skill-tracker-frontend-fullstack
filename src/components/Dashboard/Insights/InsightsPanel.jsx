import { useState } from 'react';
import AIInsight from './AIInsight';
import SuggestedSkills from './SuggestedSkills';
import MissingSkills from './MissingSkills';
import { getAIInsights } from '../../../services/api';

function InsightsPanel({ onViewCareer }) {
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('');

  const handleGetAIInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAIInsights({ role: role || undefined });
      setAiData(response.data);
    } catch (error) {
      console.error('AI Insights error:', error);
      setError('Failed to get AI insights. Please try again.');
      setAiData(null);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">🤖 AI is analyzing your skills...</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This may take a few moments</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="text-center py-4">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={handleGetAIInsights}
            className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // Show initial state - no AI data yet
  if (!aiData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            🧠 AI Insights
          </h3>
          <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
            Powered by OpenRouter
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter target role (e.g., Frontend Developer)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleGetAIInsights}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              🤖 Get Insights
            </button>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Enter a role and click "Get Insights" for AI-powered recommendations!
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Powered by OpenRouter AI • Multi-model fallback
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show AI data
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          🧠 AI Insights
        </h3>
        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
          Powered by OpenRouter
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter target role (e.g., Frontend Developer)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGetAIInsights}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? '⏳ Analyzing...' : '🔄 Refresh'}
          </button>
        </div>

        <AIInsight insight={aiData.insight} />

        {aiData.suggestedSkills && aiData.suggestedSkills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              💡 Suggested Skills
            </h4>
            <SuggestedSkills skills={aiData.suggestedSkills} />
          </div>
        )}

        {aiData.missingSkills && aiData.missingSkills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              🎯 Missing Skills {role && `for ${role}`}
            </h4>
            <MissingSkills skills={aiData.missingSkills} role={role} />
          </div>
        )}

        {aiData.careerReadiness && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  🚀 Career Readiness
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {aiData.careerReadiness.score}% match for {role || 'your role'}
                </p>
                {aiData.careerReadiness.strengths && (
                  <div className="mt-1">
                    <span className="text-xs text-green-600 dark:text-green-400">✅ {aiData.careerReadiness.strengths.join(', ')}</span>
                  </div>
                )}
                {aiData.careerReadiness.weaknesses && (
                  <div className="mt-0.5">
                    <span className="text-xs text-red-500 dark:text-red-400">⚠️ {aiData.careerReadiness.weaknesses.join(', ')}</span>
                  </div>
                )}
              </div>
              <button
                onClick={onViewCareer}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
              >
                View Details →
              </button>
            </div>
          </div>
        )}

        {!aiData.careerReadiness && (
          <button
            onClick={onViewCareer}
            className="w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
          >
            🚀 View Career Readiness →
          </button>
        )}
      </div>
    </div>
  );
}

export default InsightsPanel;
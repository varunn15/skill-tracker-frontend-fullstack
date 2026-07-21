import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AIInsight from './AIInsight';
import SuggestedSkills from './SuggestedSkills';
import MissingSkills from './MissingSkills';
import { getAIInsights } from '../../../services/api';
import { Brain, Lightbulb, Target, Rocket, Sparkles, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';

function InsightsPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('');

  const handleGetAIInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAIInsights({ role: role || undefined });
      console.log('📥 AI Insights Response:', response.data);
      
      if (response.data.error) {
        setError(response.data.message || response.data.error);
        setAiData(null);
        setLoading(false);
        return;
      }
      
      const data = response.data;
      setAiData({
        insight: data.insight || 'Keep building your skills and tracking your progress!',
        suggestedSkills: data.suggestedSkills || [],
        missingSkills: data.missingSkills || [],
        careerReadiness: data.careerReadiness || null
      });
    } catch (error) {
      console.error('AI Insights error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to get AI insights. Please try again.');
      }
      setAiData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCareer = () => {
    navigate('/career');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI is analyzing your skills...</p>
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
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={handleGetAIInsights}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 mx-auto font-semibold"
          >
            <RefreshCw className="w-4 h-4 animate-spin-hover" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Show initial state - no AI data yet
  if (!aiData) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-[0_2px_12px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] transition-shadow duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-purple-500" /> AI Insights
          </h3>
          <span className="text-xs px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-medium">
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
              onKeyDown={(e) => e.key === 'Enter' && handleGetAIInsights()}
              className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
            />
            <button
              onClick={handleGetAIInsights}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:brightness-105 active:scale-95 transition-all duration-200 whitespace-nowrap flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Get Insights
            </button>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-center border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
              Enter a role and click "Get Insights" for AI-powered recommendations!
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Powered by OpenRouter AI • Multi-model fallback
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show AI data
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-[0_2px_12px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] transition-shadow duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-purple-500" /> AI Insights
        </h3>
        <span className="text-xs px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-medium">
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
            onKeyDown={(e) => e.key === 'Enter' && handleGetAIInsights()}
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
          />
          <button
            onClick={handleGetAIInsights}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:brightness-105 active:scale-95 transition-all duration-200 disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Refresh
              </>
            )}
          </button>
        </div>

        <AIInsight insight={aiData.insight} />

        {aiData.suggestedSkills && aiData.suggestedSkills.length > 0 && (
          <div className="animate-[fadeIn_0.4s_ease-out]">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Suggested Skills
            </h4>
            <SuggestedSkills skills={aiData.suggestedSkills} />
          </div>
        )}

        {aiData.missingSkills && aiData.missingSkills.length > 0 && (
          <div className="animate-[fadeIn_0.4s_ease-out]">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-red-500" /> Missing Skills {role && `for ${role}`}
            </h4>
            <MissingSkills skills={aiData.missingSkills} role={role} />
          </div>
        )}

        {aiData.careerReadiness && (
          <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100/60 dark:border-blue-900/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Rocket className="w-4 h-4" /> Career Readiness
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                  {aiData.careerReadiness.score}% match for {role || 'your role'}
                </p>
                {aiData.careerReadiness.strengths && (
                  <div className="mt-1.5">
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-500/10 dark:bg-green-400/10 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {aiData.careerReadiness.strengths.slice(0, 2).join(', ')}
                      {aiData.careerReadiness.strengths.length > 2 && '...'}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleViewCareer}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-105 hover:shadow-md text-white text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {!aiData.careerReadiness && (
          <button
            onClick={handleViewCareer}
            className="w-full mt-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-105 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-950/20 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Rocket className="w-5 h-5" /> View Career Readiness <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default InsightsPanel;
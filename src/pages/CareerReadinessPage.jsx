import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCareerReadiness, getSkills } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BadgeCheck, 
  X, 
  Lightbulb, 
  Rocket, 
  Sparkles, 
  Brain, 
  AlertTriangle, 
  Check, 
  Target,
  TrendingUp
} from 'lucide-react';

function CareerReadinessPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  async function fetchUserSkills() {
    try {
      const response = await getSkills();
      setSkills(response.data || []);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoadingSkills(false);
    }
  }

  // Fetch user's skills on mount
  useEffect(() => {
    setTimeout(() => {
      fetchUserSkills();
    }, 0);
  }, []);

  const handleAnalyze = async () => {
    if (!role.trim()) {
      setError('Please enter a role to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    try {
      const response = await getCareerReadiness({ role: role.trim() });
      console.log('📥 Career Readiness Response:', response.data);
      
      if (response.data.error) {
        setError(response.data.message || response.data.error);
        setLoading(false);
        return;
      }
      
      if (!response.data.score && response.data.score !== 0) {
        setError('No data received from AI service');
        setLoading(false);
        return;
      }
      
      const mappedData = {
        score: response.data.score || 0,
        weaknesses: response.data.weaknesses || [],
        strengths: response.data.strengths || [],
        recommendations: response.data.recommendations || [],
        summary: response.data.summary || 'Analysis complete'
      };
      
      console.log('📊 Mapped data:', mappedData);
      setData(mappedData);
    } catch (error) {
      console.error('Career readiness error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to connect to server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle generate roadmap - pass role
  const handleGenerateRoadmap = () => {
    if (data) {
      navigate('/roadmap', {
        state: {
          role: role, // ✅ This is the role passed to roadmap
          missingSkills: data.weaknesses || [],
          suggestedSkills: data.recommendations || []
        }
      });
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return Sparkles;
    if (score >= 60) return Target;
    if (score >= 40) return TrendingUp;
    return Rocket;
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Ready!';
    if (score >= 60) return 'On Track';
    if (score >= 40) return 'Developing';
    return 'Starting Out';
  };

  const getScoreDescription = (score) => {
    if (score >= 80) return 'You are well prepared for this role!';
    if (score >= 60) return 'You are on the right track!';
    if (score >= 40) return 'You have a good foundation to build on.';
    return 'Start building skills for this role.';
  };

  if (loadingSkills) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading your skills...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-md shadow-blue-500/10">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Career Readiness</h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">AI-powered analysis against any target role</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 rounded-full border border-purple-100/30 dark:border-purple-900/20">
          Powered by OpenRouter AI
        </span>
      </div>

      {/* Role Input */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 mb-8 shadow-[0_2px_12_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-2 opacity-80">
              Target Role
            </label>
            <input
              type="text"
              placeholder="e.g., Frontend Developer, Full Stack Engineer, Data Scientist"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all text-sm font-medium placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAnalyze}
              disabled={loading || !role.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/10 hover:brightness-105 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Readiness
                </>
              )}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-red-500 text-xs font-semibold mt-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500" /> {error}
          </p>
        )}
        {skills.length === 0 && (
          <p className="text-yellow-600 dark:text-yellow-400 text-xs font-semibold mt-3 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-yellow-500" /> Add some skills first to get an accurate analysis!
          </p>
        )}
      </div>

      {/* Results - Show when data exists */}
      <AnimatePresence>
        {data && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* AI Summary */}
            {data.summary && (
              <div className="bg-gradient-to-r from-blue-50/60 to-purple-50/60 dark:from-blue-950/15 dark:to-purple-950/15 rounded-2xl p-6 border border-blue-100/80 dark:border-blue-900/30 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-xl shrink-0">
                    <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">AI Summary</p>
                    <p className="text-gray-700 dark:text-gray-300 mt-1.5 text-sm leading-relaxed font-medium">
                      {data.summary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Score Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
              <div className="flex items-center gap-8 flex-wrap">
                <div className="text-center min-w-[120px]">
                  <div className={`text-6xl font-extrabold tracking-tight ${getScoreColor(data.score)}`}>
                    {data.score}%
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-wider">
                    {(() => {
                      const ScoreIcon = getScoreIcon(data.score);
                      return <ScoreIcon className={`w-4 h-4 ${getScoreColor(data.score)}`} />;
                    })()}
                    <span>{getScoreLabel(data.score)}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-[240px]">
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(data.score, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-3 rounded-full ${getScoreBgColor(data.score)}`}
                    ></motion.div>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3">
                    {getScoreDescription(data.score)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
                    Based on AI analysis of your {skills.length} active skills
                  </p>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-[0_2px_12px_rgba(0,0,0,0.015)] flex flex-col">
                <div className="flex items-center gap-2.5 mb-5 border-b border-gray-50 dark:border-gray-700/50 pb-3">
                  <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-xl">
                    <BadgeCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Strengths</h3>
                  <span className="ml-auto text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 px-2.5 py-1 rounded-lg">
                    {data.strengths?.length || 0}
                  </span>
                </div>
                {data.strengths && data.strengths.length > 0 ? (
                  <ul className="space-y-2.5 flex-1">
                    {data.strengths.map((item, index) => (
                      <motion.li 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={index} 
                        className="flex items-start gap-3 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-green-50/40 dark:bg-green-950/10 p-3.5 rounded-xl border border-green-100/40 dark:border-green-900/20"
                      >
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 py-4 text-center">No strengths identified</p>
                )}
              </div>

              {/* Weaknesses */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-[0_2px_12px_rgba(0,0,0,0.015)] flex flex-col">
                <div className="flex items-center gap-2.5 mb-5 border-b border-gray-50 dark:border-gray-700/50 pb-3">
                  <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-xl">
                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Areas for Improvement</h3>
                  <span className="ml-auto text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 px-2.5 py-1 rounded-lg">
                    {data.weaknesses?.length || 0}
                  </span>
                </div>
                {data.weaknesses && data.weaknesses.length > 0 ? (
                  <ul className="space-y-2.5 flex-1">
                    {data.weaknesses.map((item, index) => (
                      <motion.li 
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={index} 
                        className="flex items-start gap-3 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-red-50/40 dark:bg-red-950/10 p-3.5 rounded-xl border border-red-100/40 dark:border-red-900/20"
                      >
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 py-4 text-center">No areas for improvement identified</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
              <div className="flex items-center gap-2.5 mb-5 border-b border-gray-50 dark:border-gray-700/50 pb-3">
                <div className="p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-xl">
                  <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">AI Recommendations</h3>
                <span className="ml-auto text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 px-2.5 py-1 rounded-lg">
                  {data.recommendations?.length || 0} suggestions
                </span>
              </div>
              {data.recommendations && data.recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {data.recommendations.map((item, index) => (
                    <motion.li 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={index} 
                      className="flex items-start gap-3.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-yellow-50/30 dark:bg-yellow-950/10 p-4 rounded-xl border border-yellow-100/40 dark:border-yellow-900/20"
                    >
                      <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 py-4 text-center">No recommendations yet</p>
              )}
            </div>

            {/* Generate Roadmap Button */}
            <button
              onClick={handleGenerateRoadmap}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/10 hover:brightness-105 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <Rocket className="w-5 h-5" />
              Generate Learning Roadmap
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results - Show Guide */}
      {!data && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 text-center py-16 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-5">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            Ready to analyze your career?
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Enter a role you're interested in and our AI will analyze your skills against it.
            You'll get a readiness score, strengths, weaknesses, and actionable recommendations.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {['Frontend Developer', 'Full Stack Engineer', 'Data Scientist', 'DevOps Engineer'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="px-4 py-2 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100/40 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all text-xs font-bold"
              >
                {r}
              </button>
            ))}
          </div>
          {skills.length === 0 && (
            <div className="mt-8 p-4 bg-yellow-50/40 dark:bg-yellow-950/10 rounded-2xl border border-yellow-100/40 dark:border-yellow-900/20 max-w-lg mx-auto">
              <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 flex items-center justify-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-yellow-500" /> You haven't added any skills yet. Add some skills in the Skills tab to get accurate analysis!
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default CareerReadinessPage;
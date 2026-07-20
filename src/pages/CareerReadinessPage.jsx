import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCareerReadiness, getSkills } from '../services/api';
import { 
  CheckBadgeIcon, 
  XMarkIcon,
  ArrowPathIcon,
  LightBulbIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

function CareerReadinessPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  // Fetch user's skills on mount
  useEffect(() => {
    fetchUserSkills();
  }, []);

  const fetchUserSkills = async () => {
    try {
      const response = await getSkills();
      setSkills(response.data || []);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoadingSkills(false);
    }
  };

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
      
      // ✅ Check if response has error
      if (response.data.error) {
        setError(response.data.error);
        return;
      }

      // ✅ Map response fields to what UI expects
      const mappedData = {
        score: response.data.score || 0,
        // ✅ Handle both "weaknesses" and "improvements"
        weaknesses: response.data.weaknesses || response.data.improvements || [],
        // ✅ Handle strengths
        strengths: response.data.strengths || [],
        // ✅ Handle recommendations
        recommendations: response.data.recommendations || [],
        // ✅ Summary
        summary: response.data.summary || 'Analysis complete'
      };

      console.log('📊 Mapped data:', mappedData);
      setData(mappedData);
    } catch (error) {
      console.error('Career readiness error:', error);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
        setError(error.response.data?.error || 'Server error. Please try again.');
      } else {
        setError('Failed to connect to server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add this function
const handleGenerateRoadmap = () => {
  if (data) {
    navigate('/roadmap', {
      state: {
        role: role,
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

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '💪';
    if (score >= 40) return '📈';
    return '🚀';
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
            <RocketLaunchIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Career Readiness</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered analysis against any role</p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
          Powered by OpenRouter AI
        </span>
      </div>

      {/* Role Input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
              Target Role
            </label>
            <input
              type="text"
              placeholder="e.g., Frontend Developer, Full Stack Engineer, Data Scientist"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAnalyze}
              disabled={loading || !role.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  Analyze Readiness
                </>
              )}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <span>⚠️</span> {error}
          </p>
        )}
        {skills.length === 0 && (
          <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-2 flex items-center gap-1">
            <span>💡</span> Add some skills first to get an accurate analysis!
          </p>
        )}
      </div>

      {/* Results - Show when data exists */}
      {data && (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
          {/* AI Summary */}
          {data.summary && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">AI Summary</p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1 text-base leading-relaxed">
                    {data.summary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Score Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(data.score)}`}>
                  {data.score}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  {getScoreLabel(data.score)} {getScoreEmoji(data.score)}
                </div>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-1000 ${getScoreBgColor(data.score)}`}
                    style={{ width: `${Math.min(data.score, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {getScoreDescription(data.score)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Based on AI analysis of your {skills.length} skills
                </p>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckBadgeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Strengths</h3>
                <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                  {data.strengths?.length || 0} identified
                </span>
              </div>
              {data.strengths && data.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {data.strengths.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                      <span className="text-green-500 mt-0.5 text-lg">✅</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">No strengths identified yet</p>
              )}
            </div>

            {/* Weaknesses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <XMarkIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Areas for Improvement</h3>
                <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                  {data.weaknesses?.length || 0} identified
                </span>
              </div>
              {data.weaknesses && data.weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {data.weaknesses.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
                      <span className="text-red-500 mt-0.5 text-lg">⚠️</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">No weaknesses identified yet</p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <LightBulbIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">AI Recommendations</h3>
              <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                {data.recommendations?.length || 0} suggestions
              </span>
            </div>
            {data.recommendations && data.recommendations.length > 0 ? (
              <ul className="space-y-3">
                {data.recommendations.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800">
                    <span className="text-yellow-500 mt-0.5 text-lg">💡</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">No recommendations yet</p>
            )}
          </div>

          
          <button
            onClick={handleGenerateRoadmap}
            className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <RocketLaunchIcon className="w-5 h-5" />
              Generate Learning Roadmap
          </button>

          {/* Your Skills */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <AcademicCapIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Your Skills</h3>
              <span className="ml-auto text-sm text-gray-400 dark:text-gray-500">
                {skills.length} skills
              </span>
            </div>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full border border-blue-100 dark:border-blue-800 flex items-center gap-1"
                  >
                    {skill.skillName}
                    <span className="text-xs text-blue-400 dark:text-blue-500 font-medium">({skill.level}/10)</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No skills added yet. Go to Skills tab to add some!
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => {
                setData(null);
                setRole('');
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              New Analysis
            </button>
          </div>
        </div>
      )}

      {/* No Results - Show Guide */}
      {!data && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-100 dark:border-gray-700 text-center py-16">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Ready to analyze your career?
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Enter a role you're interested in and our AI will analyze your skills against it.
            You'll get a readiness score, strengths, weaknesses, and actionable recommendations.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {['Frontend Developer', 'Full Stack Engineer', 'Data Scientist', 'DevOps Engineer'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all text-sm"
              >
                {r}
              </button>
            ))}
          </div>
          {skills.length === 0 && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                💡 You haven't added any skills yet. Add some skills in the Skills tab to get accurate analysis!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CareerReadinessPage;
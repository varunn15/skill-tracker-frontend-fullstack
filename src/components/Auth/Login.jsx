import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Login successful - AuthContext handles redirect
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-gray-700/80 p-8 sm:p-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome back</h2>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-2">Login to manage your technical skills</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 opacity-80">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 dark:bg-gray-900/30 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white text-sm font-medium transition-all duration-200 ${
                  errors.email 
                    ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
                disabled={loading}
              />
              <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors duration-200 ${
                isEmailFocused ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
              }`} />
            </div>
            {errors.email && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 opacity-80">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 dark:bg-gray-900/30 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white text-sm font-medium transition-all duration-200 ${
                  errors.password 
                    ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
                disabled={loading}
              />
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors duration-200 ${
                isPasswordFocused ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
              }`} />
            </div>
            {errors.password && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/10 hover:brightness-105 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Logging in...
              </>
            ) : (
              'Login to Dashboard'
            )}
          </button>
        </form>

        <p className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 mt-8">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
          >
            Create an Account
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
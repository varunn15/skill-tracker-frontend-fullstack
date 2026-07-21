import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getSkills } from "./services/api";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AuthGuard from "./components/Auth/AuthGuard";
import ThemeToggle from "./components/ThemeToggle";
import DashboardPage from "./pages/DashboardPage";
import SkillsPage from "./pages/SkillsPage";
import CareerReadinessPage from "./pages/CareerReadinessPage";
import RoadmapPage from "./pages/RoadmapPage";
import LoginPage from "./pages/LoginPage";
import { 
  SparklesIcon, 
  PlusCircleIcon, 
  Squares2X2Icon,
  RocketLaunchIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import "./App.css";

// ============================================================
// NAVIGATION COMPONENT
// ============================================================
function Navigation() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex items-center gap-2">
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <Link
          to="/dashboard"
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
            isActive('/dashboard')
              ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Squares2X2Icon className="w-4 h-4" />
          Dashboard
        </Link>
        <Link
          to="/skills"
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
            isActive('/skills')
              ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <PlusCircleIcon className="w-4 h-4" />
          Skills
        </Link>
        <Link
          to="/career"
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
            isActive('/career')
              ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <RocketLaunchIcon className="w-4 h-4" />
          Career
        </Link>
      </div>
      <button
        onClick={logout}
        className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center gap-1"
      >
        <ArrowRightOnRectangleIcon className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
}

// ============================================================
// USER INFO
// ============================================================
function UserInfo() {
  const { user } = useAuth();
  return (
    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
      <span className="hidden sm:inline">👋 {user?.username}</span>
    </div>
  );
}

// ============================================================
// MAIN APP CONTENT (Protected)
// ============================================================
function AppContent() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSkill, setEditingSkill] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getSkills();
      setSkills(res.data);
    } catch (err) {
      setError(err.userMessage || "Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleSkillAdded = () => fetchSkills();
  const handleEdit = (skill) => setEditingSkill(skill);
  const handleUpdateDone = () => {
    setEditingSkill(null);
    fetchSkills();
  };
  const handleDelete = () => fetchSkills();

  if (location.pathname === '/skills') {
    return (
      <SkillsPage
        skills={skills}
        loading={loading}
        error={error}
        editingSkill={editingSkill}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRetry={fetchSkills}
        onSkillAdded={handleSkillAdded}
        onUpdateDone={handleUpdateDone}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    );
  }

  if (location.pathname === '/career') {
    return <CareerReadinessPage />;
  }

  if (location.pathname === '/roadmap') {
    return <RoadmapPage />;
  }

  return <DashboardPage />;
}

// ============================================================
// APP WRAPPER
// ============================================================
function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                    Skill Tracker
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track your skills</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <UserInfo />
                <Navigation />
                <ThemeToggle />
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                  🟢 Live
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <AppContent />
                </AuthGuard>
              }
            />
            <Route
              path="/skills"
              element={
                <AuthGuard>
                  <AppContent />
                </AuthGuard>
              }
            />
            <Route
              path="/career"
              element={
                <AuthGuard>
                  <AppContent />
                </AuthGuard>
              }
            />
            <Route
              path="/roadmap"
              element={
                <AuthGuard>
                  <AppContent />
                </AuthGuard>
              }
            />
          </Routes>
        </main>

        {/* Toast Notifications */}
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </AuthProvider>
  );
}

export default App;
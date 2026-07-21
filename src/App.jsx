import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
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
  Sparkles, 
  PlusCircle, 
  LayoutGrid, 
  Rocket, 
  LogOut,
  User
} from "lucide-react";
import { motion } from "framer-motion";
import "./App.css";

// ============================================================
// NAVIGATION COMPONENT
// ============================================================
function Navigation() {
  const location = useLocation();
  const { logout } = useAuth();
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/skills", label: "Skills", icon: PlusCircle },
    { to: "/career", label: "Career", icon: Rocket },
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 relative border border-gray-200/40 dark:border-gray-700/40">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 relative`}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {active && (
                <motion.span
                  layoutId="bubble"
                  className="absolute inset-0 bg-white dark:bg-gray-900 rounded-lg shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 ${
                active 
                  ? "text-blue-600 dark:text-blue-400 font-bold" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}>
                <Icon className="w-4 h-4" />
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
      <button
        onClick={logout}
        className="px-3.5 py-1.5 text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-all duration-200 flex items-center gap-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
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
    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
      <User className="w-4 h-4 text-gray-400" />
      <span className="hidden sm:inline">{user?.username}</span>
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
    setTimeout(() => {
      fetchSkills();
    }, 0);
  }, []);

  const handleSkillAdded = () => fetchSkills();
  const handleEdit = (skill) => setEditingSkill(skill);
  const handleUpdateDone = () => {
    setEditingSkill(null);
    fetchSkills();
  };
  const handleDelete = () => fetchSkills();

  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  };

  if (location.pathname === '/skills') {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={pageVariants}
        transition={pageVariants.transition}
      >
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
      </motion.div>
    );
  }

  if (location.pathname === '/career') {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={pageVariants}
        transition={pageVariants.transition}
      >
        <CareerReadinessPage />
      </motion.div>
    );
  }

  if (location.pathname === '/roadmap') {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={pageVariants}
        transition={pageVariants.transition}
      >
        <RoadmapPage />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageVariants}
      transition={pageVariants.transition}
    >
      <DashboardPage />
    </motion.div>
  );
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
                  <Sparkles className="w-6 h-6 text-white" />
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
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-bold rounded-full border border-green-100 dark:border-green-900/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
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
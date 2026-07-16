import { useState, useEffect } from "react";
import SkillList from "./components/SkillList";
import SkillForm from "./components/SkillForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getSkills } from "./services/api";
import useNetworkStatus from "./hooks/useNetworkStatus"; // ✅ Import
import "./App.css";

function App() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSkill, setEditingSkill] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ✅ Network status
  const isOnline = useNetworkStatus();

  const fetchSkills = async () => {
    // ✅ Check network status
    if (!isOnline) {
      setError("You are offline. Please check your internet connection.");
      setLoading(false);
      return;
    }

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
  }, [isOnline]); // ✅ Refetch when network comes back

  const handleSkillAdded = () => fetchSkills();
  const handleEdit = (skill) => setEditingSkill(skill);
  const handleUpdateDone = () => {
    setEditingSkill(null);
    fetchSkills();
  };
  const handleDelete = () => fetchSkills();

  // ✅ Show offline banner
  if (!isOnline) {
    return (
      <div className="app">
        <div className="app-header">
          <h1>🎯 Skill Tracker</h1>
          <p className="subtitle">Manage your skills and track your progress</p>
        </div>
        <div className="offline-banner">
          <span className="offline-icon">📡</span>
          <span className="offline-text">You are offline. Please check your internet connection.</span>
          <button className="offline-retry-btn" onClick={fetchSkills}>
            🔄 Retry
          </button>
        </div>
        <div className="app-content">
          <div className="form-section">
            <SkillForm
              onSkillAdded={handleSkillAdded}
              editingSkill={editingSkill}
              onUpdateDone={handleUpdateDone}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>🎯 Skill Tracker</h1>
        <p className="subtitle">Manage your skills and track your progress</p>
      </div>

      <div className="app-content">
        <div className="form-section">
          <SkillForm
            onSkillAdded={handleSkillAdded}
            editingSkill={editingSkill}
            onUpdateDone={handleUpdateDone}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </div>

        <div className="list-section">
          <SkillList
            skills={skills}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRetry={fetchSkills}
          />
        </div>
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
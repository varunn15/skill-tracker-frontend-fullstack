import { useState, useEffect } from "react";
import SkillList from "./components/SkillList";
import SkillForm from "./components/SkillForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getSkills } from "./services/api";
import "./App.css";

function App() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await getSkills();
      setSkills(res.data);
    } catch (err) {
      console.error("Error fetching skills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleSkillAdded = () => {
    fetchSkills();
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
  };

  const handleUpdateDone = () => {
    setEditingSkill(null);
    fetchSkills();
  };

  const handleDelete = () => {
    fetchSkills();
  };

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
            onEdit={handleEdit}
            onDelete={handleDelete}
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
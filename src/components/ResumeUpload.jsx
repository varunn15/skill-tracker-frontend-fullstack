import { useState } from 'react';
import { toast } from 'react-toastify';
import { uploadResume } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  FileText,
  X,
  CheckCircle2
} from 'lucide-react';

function ResumeUpload({ onSkillsExtracted }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      validateAndSetFile(selected);
    }
  };

  const validateAndSetFile = (file) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(file.type) && !['pdf', 'docx'].includes(ext)) {
      toast.error('Please upload a PDF or DOCX file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setFile(file);
    setShowResults(false);
    setExtractedSkills([]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      validateAndSetFile(dropped);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await uploadResume(formData);
      console.log('📥 Upload response:', response.data);
      
      if (response.data.skills) {
        setExtractedSkills(response.data.skills || []);
        setShowResults(true);
        toast.success(response.data.message || 'Skills extracted successfully!');
        
        if (onSkillsExtracted) {
          onSkillsExtracted(response.data.skills);
        }
      } else {
        toast.error(response.data.message || 'Failed to extract skills');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setExtractedSkills([]);
    setShowResults(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-[0_2px_12px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)] transition-all duration-300">
      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
        <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Upload Resume
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 font-medium">
        Upload your resume (PDF or DOCX) to automatically extract your skills
      </p>

      {/* Drag & Drop Area */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className={`relative border border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
          ${dragOver 
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-inner' 
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50/30 dark:bg-gray-900/10'
          }
          ${file ? 'border-green-500 bg-green-50/40 dark:bg-green-950/10' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div 
              key="file-loaded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-4"
            >
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB • Ready to upload
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="drag-prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mx-auto w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-100/50 dark:border-blue-800/30">
                <UploadCloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Drag & drop your resume here, or{' '}
                <label className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  browse files
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">
                Supports PDF and DOCX • Max 5MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Upload Button */}
      {file && !showResults && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="mt-4 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-105 hover:shadow-md text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Extracting Skills...
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              Extract Skills
            </>
          )}
        </button>
      )}

      {/* Results */}
      {showResults && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 p-4 bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-100/80 dark:border-green-900/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="font-semibold text-green-700 dark:text-green-300 text-sm">
              {extractedSkills.length} Skills Extracted
            </span>
          </div>
          {extractedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              {extractedSkills.slice(0, 20).map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-green-100/60 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-lg border border-green-200/50 dark:border-green-800/30"
                >
                  {skill}
                </span>
              ))}
              {extractedSkills.length > 20 && (
                <span className="px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  +{extractedSkills.length - 20} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No skills found in your resume. Try adding skills manually.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default ResumeUpload;
import { useState } from 'react';
import { toast } from 'react-toastify';
import { uploadResume } from '../services/api';
import { 
  DocumentArrowUpIcon, 
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

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
        toast.success(`✅ ${response.data.message || 'Skills extracted successfully!'}`);
        
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
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <DocumentArrowUpIcon className="w-5 h-5 text-blue-500" />
        Upload Resume
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Upload your resume (PDF or DOCX) to automatically extract your skills
      </p>

      {/* Drag & Drop Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${dragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }
          ${file ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <DocumentIcon className="w-8 h-8 text-green-500" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(file.size / 1024).toFixed(1)} KB • Ready to upload
              </p>
            </div>
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <DocumentArrowUpIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300">
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
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Supports PDF and DOCX • Max 5MB
            </p>
          </>
        )}
      </div>

      {/* Upload Button */}
      {file && !showResults && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="mt-4 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Extracting Skills...
            </>
          ) : (
            <>
              <DocumentArrowUpIcon className="w-4 h-4" />
              Extract Skills
            </>
          )}
        </button>
      )}

      {/* Results */}
      {showResults && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="font-medium text-green-700 dark:text-green-300">
              {extractedSkills.length} Skills Extracted
            </span>
          </div>
          {extractedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {extractedSkills.slice(0, 20).map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full border border-green-200 dark:border-green-800"
                >
                  {skill}
                </span>
              ))}
              {extractedSkills.length > 20 && (
                <span className="px-2.5 py-1 text-sm text-gray-500 dark:text-gray-400">
                  +{extractedSkills.length - 20} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No skills found in your resume. Try adding skills manually.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
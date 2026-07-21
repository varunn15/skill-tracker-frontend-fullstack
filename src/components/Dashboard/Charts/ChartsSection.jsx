import { motion } from "framer-motion";
import { PieChart as LucidePieChart, BarChart3 as LucideBarChart } from "lucide-react";
import PieChart from './PieChart';
import BarChart from './BarChart';

function ChartsSection({ levelData, categoryData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pie Chart - Skill Distribution */}
      <motion.div 
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100/80 dark:border-gray-700/80 shadow-[0_2px_12px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] transition-shadow duration-300"
      >
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-4">
          <LucidePieChart className="w-4 h-4 text-blue-500" /> Skill Distribution
        </h3>
        <PieChart data={levelData} />
      </motion.div>

      {/* Bar Chart - Category Breakdown */}
      <motion.div 
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100/80 dark:border-gray-700/80 shadow-[0_2px_12px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] transition-shadow duration-300"
      >
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-4">
          <LucideBarChart className="w-4 h-4 text-purple-500" /> Category Breakdown
        </h3>
        <BarChart data={categoryData} />
      </motion.div>
    </div>
  );
}

export default ChartsSection;
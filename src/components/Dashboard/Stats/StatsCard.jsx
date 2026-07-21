import { motion } from "framer-motion";

function StatsCard({ icon: IconComponent, label, value, color }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-shadow duration-300 cursor-default"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1.5 tracking-tight">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color} flex items-center justify-center`}>
          <IconComponent className="w-5 h-5 shrink-0" />
        </div>
      </div>
    </motion.div>
  );
}

export default StatsCard;
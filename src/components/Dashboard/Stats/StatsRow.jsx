import StatsCard from './StatsCard';
import { Layers, Compass, TrendingUp, Trophy } from 'lucide-react';

function StatsRow({ stats }) {
  const { total, beginner, intermediate, advanced } = stats;

  const cards = [
    { icon: Layers, label: 'Total Skills', value: total, color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/30' },
    { icon: Compass, label: 'Beginner', value: beginner, color: 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-100/30' },
    { icon: TrendingUp, label: 'Intermediate', value: intermediate, color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100/30' },
    { icon: Trophy, label: 'Advanced', value: advanced, color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100/30' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  );
}

export default StatsRow;
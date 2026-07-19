import StatsCard from './StatsCard';

function StatsRow({ stats }) {
  const { total, beginner, intermediate, advanced } = stats;

  const cards = [
    { icon: '📊', label: 'Total Skills', value: total, color: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: '🌱', label: 'Beginner', value: beginner, color: 'bg-green-100 dark:bg-green-900/30' },
    { icon: '🚀', label: 'Intermediate', value: intermediate, color: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { icon: '🏆', label: 'Advanced', value: advanced, color: 'bg-purple-100 dark:bg-purple-900/30' },
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
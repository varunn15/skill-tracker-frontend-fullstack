import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart({ data }) {
  // ✅ Handle empty data
  const hasData = data.values && data.values.some(v => v > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[200px] text-gray-400 dark:text-gray-500">
        <p className="text-sm">No data to display</p>
      </div>
    );
  }

  const chartData = {
    labels: data.labels || ['Frontend', 'Backend', 'DevOps', 'Database', 'Other'],
    datasets: [
      {
        label: 'Skills',
        data: data.values || [0, 0, 0, 0, 0],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b'],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="w-full h-[250px]">
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default BarChart;
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ data }) {
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
    labels: data.labels || ['Beginner', 'Intermediate', 'Advanced'],
    datasets: [
      {
        data: data.values || [0, 0, 0],
        backgroundColor: ['#22c55e', '#eab308', '#8b5cf6'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
    },
  };

  return (
    <div className="w-full max-w-[300px] mx-auto">
      <Pie data={chartData} options={options} />
    </div>
  );
}

export default PieChart;
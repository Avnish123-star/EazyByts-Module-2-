import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // Added for Bar Chart
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // Added for Bar Chart
  Title,
  Tooltip,
  Legend
);

const StockChart = ({ chartData, stockSymbol, chartType }) => {
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: `${stockSymbol} Price History (USD)`,
        data: chartData.chartData,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Historical Price for ${stockSymbol}` },
    },
  };

  // Logic to switch between chart types
  if (chartType === 'bar') {
    return <Bar data={data} options={options} />;
  }
  
  return <Line data={data} options={options} />;
};

export default StockChart;
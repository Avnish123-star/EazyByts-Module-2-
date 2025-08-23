import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PortfolioPieChart = ({ portfolio, liveData }) => {
  // This function generates an array of distinct colors for the chart
  const generateColors = (numColors) => {
    const colors = [];
    const colorPalette = [
      'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)',
      'rgba(99, 255, 132, 0.8)', 'rgba(235, 54, 162, 0.8)'
    ];
    for (let i = 0; i < numColors; i++) {
      colors.push(colorPalette[i % colorPalette.length]);
    }
    return colors;
  };

  const chartData = {
    labels: portfolio.map(stock => stock.symbol),
    datasets: [{
      label: 'Portfolio Value ($)',
      data: portfolio.map(stock => {
        const currentPrice = liveData[stock.symbol] ? parseFloat(liveData[stock.symbol].price) : stock.purchasePrice;
        return (currentPrice * stock.quantity).toFixed(2);
      }),
      backgroundColor: generateColors(portfolio.length),
      borderColor: '#ffffff',
      borderWidth: 2,
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Your Portfolio Distribution by Value', font: { size: 16 } },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default PortfolioPieChart;
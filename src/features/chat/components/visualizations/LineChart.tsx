import { IQueryResult } from '@/services/api/chat';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: IQueryResult;
  xAxisKey?: string;
  yAxisKey?: string;
}

export function LineChart({ data, xAxisKey, yAxisKey }: LineChartProps) {
  if (!data.rows.length) {
    return <div className="text-center p-4">No data available</div>;
  }

  // Determine x and y axis keys if not provided
  const determineXAxisKey = (): string => {
    if (xAxisKey && data.columns.includes(xAxisKey)) {
      return xAxisKey;
    }
    // Default to first column that looks like a date or category
    const dateColumn = data.columns.find(col => {
      const firstValue = String(data.rows[0][col]);
      return firstValue.includes('-') || firstValue.includes('/');
    });
    return dateColumn || data.columns[0];
  };

  const determineYAxisKey = (): string => {
    if (yAxisKey && data.columns.includes(yAxisKey)) {
      return yAxisKey;
    }
    // Default to first numeric column
    const firstNumericColumn = data.columns.find(col => {
      const firstValue = data.rows[0][col];
      return typeof firstValue === 'number' || !isNaN(Number(firstValue));
    });
    return firstNumericColumn || data.columns[1] || data.columns[0];
  };

  const xAxis = determineXAxisKey();
  const yAxis = determineYAxisKey();

  // Format data for Recharts
  const chartData = data.rows.map(row => {
    const formattedRow: Record<string, unknown> = { ...row };
    // Ensure numeric values for the y-axis
    if (typeof formattedRow[yAxis] === 'string') {
      formattedRow[yAxis] = Number(formattedRow[yAxis]);
    }
    return formattedRow;
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xAxis} 
            angle={-45} 
            textAnchor="end" 
            height={60}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={yAxis} 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
            name={yAxis}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

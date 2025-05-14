import { IQueryResult } from '@/services/api/chat';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#000000', '#5d5d5d', '#272727', '#a4a4a4'];

interface BarChartProps {
  data: IQueryResult;
  xAxisKey?: string;
  yAxisKey?: string;
}

export function BarChart({ data, xAxisKey, yAxisKey }: BarChartProps) {
  if (!data.rows.length) {
    return <div className="text-center p-4">No data available</div>;
  }

  const determineXAxisKey = (): string => {
    if (xAxisKey && data.columns.includes(xAxisKey)) {
      return xAxisKey;
    }
    const firstNonNumericColumn = data.columns.find((col) => {
      const firstValue = data.rows[0][col];
      return typeof firstValue === 'string';
    });
    return firstNonNumericColumn || data.columns[0];
  };

  const determineYAxisKey = (): string => {
    if (yAxisKey && data.columns.includes(yAxisKey)) {
      return yAxisKey;
    }
    const firstNumericColumn = data.columns.find((col) => {
      const firstValue = data.rows[0][col];
      return typeof firstValue === 'number' || !isNaN(Number(firstValue));
    });
    return firstNumericColumn || data.columns[1] || data.columns[0];
  };

  const xAxis = determineXAxisKey();
  const yAxis = determineYAxisKey();

  const chartData = data.rows.map((row) => {
    const formattedRow: Record<string, unknown> = { ...row };
    if (typeof formattedRow[yAxis] === 'string') {
      formattedRow[yAxis] = Number(formattedRow[yAxis]);
    }
    return formattedRow;
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}>
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
          <Bar dataKey={yAxis} name={yAxis}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

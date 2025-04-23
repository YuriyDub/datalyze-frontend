import { IQueryResult } from '@/services/api/chat';
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ScatterChartProps {
  data: IQueryResult;
}

export function ScatterChart({ data }: ScatterChartProps) {
  if (!data.rows.length) {
    return <div className="text-center p-4">No data available</div>;
  }

  const xAxisKey = data.columns[0],
    yAxisKey = data.columns[1];

  const chartData = data.rows.map((row) => {
    const formattedRow: Record<string, unknown> = {
      ...row,
      [xAxisKey]: row[xAxisKey],
      [yAxisKey]: row[yAxisKey],
    };
    return formattedRow;
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsScatterChart
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type={typeof data.columns[0] === 'number' ? 'number' : 'category'}
            dataKey={xAxisKey}
            name={xAxisKey}
            label={{ value: xAxisKey, position: 'insideBottomRight', offset: -10 }}
          />
          <YAxis
            type={typeof data.columns[1] === 'number' ? 'number' : 'category'}
            dataKey={yAxisKey}
            name={yAxisKey}
            label={{ value: yAxisKey, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value) => [value, '']} />
          <Legend color="#000" />
          <Scatter name={`${xAxisKey} vs ${yAxisKey}`} data={chartData} fill="#black" />
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

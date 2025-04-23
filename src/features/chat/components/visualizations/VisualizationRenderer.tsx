import { IQueryResult, VisualizationType } from '@/services/api/chat';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { PieChart } from './PieChart';
import { ScatterChart } from './ScatterChart';
import { DataTable } from './DataTable';
import { StrokeData } from './StrokeData';

interface VisualizationRendererProps {
  title?: string;
  data: IQueryResult | null;
}

const identifyVisualizationType = (data: IQueryResult): VisualizationType => {
  if (data.rows.length === 0) {
    return 'none';
  }

  if (data.columns.length === 1) {
    if (data.rows.length === 1) {
      return 'stroke';
    }
    return 'table';
  }
  if (data.columns.length === 2) {
    if (
      typeof data.rows[0][data.columns[0]] === 'string' &&
      typeof data.rows[0][data.columns[1]] === 'number'
    ) {
      return 'pie';
    }
    if (
      typeof data.rows[0][data.columns[0]] === 'string' &&
      typeof data.rows[0][data.columns[1]] === 'string'
    ) {
      return 'table';
    }
  }
  if (data.columns.length === 3) {
    if (
      typeof data.rows[0][data.columns[0]] === 'string' &&
      typeof data.rows[0][data.columns[1]] === 'number' &&
      typeof data.rows[0][data.columns[2]] === 'number'
    ) {
      return 'scatter';
    }
    if (
      typeof data.rows[0][data.columns[0]] === 'string' &&
      typeof data.rows[0][data.columns[1]] === 'string' &&
      typeof data.rows[0][data.columns[2]] === 'number'
    ) {
      return 'scatter';
    }
    if (
      typeof data.rows[0][data.columns[0]] === 'number' &&
      typeof data.rows[0][data.columns[1]] === 'number' &&
      typeof data.rows[0][data.columns[2]] === 'number'
    ) {
      return 'scatter';
    }
  }
  return 'table';
};

export function VisualizationRenderer({ data, title }: VisualizationRendererProps) {
  if (!data || !data.rows || data.rows.length === 0) {
    return <div className="text-center p-4">No data available for visualization</div>;
  }
  const type = identifyVisualizationType(data);

  switch (type) {
    case 'bar':
      return (
        <>
          <BarChart data={data} />
        </>
      );
    case 'line':
      return <LineChart data={data} />;
    case 'pie':
      return (
        <>
          <PieChart data={data} />
          <BarChart data={data} />
        </>
      );
    case 'scatter':
      return <ScatterChart data={data} />;
    case 'table':
      return <DataTable data={data} />;
    case 'stroke':
      return <StrokeData data={data} title={title} />;
    case 'none':
    default:
      return null;
  }
}

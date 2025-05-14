import { CardContent } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { IQueryResult } from '@/services/api/chat';
import { PieChart as RechartsPieChart, Pie, Legend, Cell, Label } from 'recharts';

interface PieChartProps {
  data: IQueryResult;
  nameKey?: string;
  valueKey?: string;
}

const COLORS = ['#000000', '#5d5d5d', '#272727', '#a4a4a4'];

const chartConfig = {
  defaults: {
    color: '#3b82f6',
  },
} satisfies ChartConfig;

export function PieChart({ data, nameKey, valueKey }: PieChartProps) {
  if (!data.rows.length) {
    return <div className="text-center p-4">No data available</div>;
  }

  const determineNameKey = (): string => {
    if (nameKey && data.columns.includes(nameKey)) {
      return nameKey;
    }
    const firstNonNumericColumn = data.columns.find((col) => {
      const firstValue = data.rows[0][col];
      return typeof firstValue === 'string';
    });
    return firstNonNumericColumn || data.columns[0];
  };

  const determineValueKey = (): string => {
    if (valueKey && data.columns.includes(valueKey)) {
      return valueKey;
    }
    const firstNumericColumn = data.columns.find((col) => {
      const firstValue = data.rows[0][col];
      return typeof firstValue === 'number' || !isNaN(Number(firstValue));
    });
    return firstNumericColumn || data.columns[1] || data.columns[0];
  };

  const nameKeyFinal = determineNameKey().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  const valueKeyFinal = determineValueKey().replace(/_([a-z])/g, (_, letter) =>
    letter.toUpperCase(),
  );

  const chartData = data.rows.map((row) => ({
    name: String(row[nameKeyFinal]),
    value:
      typeof row[valueKeyFinal] === 'number' ? row[valueKeyFinal] : Number(row[valueKeyFinal]) || 0,
  }));

  return (
    <div className="w-full">
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto">
          <RechartsPieChart className="flex flex-col gap-2 min-w-56 md:min-w-80">
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              labelLine={false}
              data={chartData}
              dataKey={'value'}
              valueKey={valueKeyFinal}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              label>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold">
                          {chartData
                            .map((data) => data.value)
                            .reduce((value, acc) => value + acc)
                            .toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground">
                          In Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend wrapperStyle={{ position: 'relative' }} />
          </RechartsPieChart>
        </ChartContainer>
      </CardContent>
    </div>
  );
}

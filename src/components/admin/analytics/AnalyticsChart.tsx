
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  ResponsiveContainer,
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { DailyMetric } from '@/services/analyticsService';

type ChartType = 'area' | 'bar' | 'line';

interface DataKey {
  key: keyof DailyMetric;
  name: string;
  color: string;
}

interface AnalyticsChartProps {
  title: string;
  description?: string;
  data: DailyMetric[];
  type?: ChartType;
  dataKeys: DataKey[];
  loading?: boolean;
  height?: number;
  showGrid?: boolean;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  description,
  data,
  type = 'line',
  dataKeys,
  loading = false,
  height = 300,
  showGrid = true
}) => {
  const chartConfig = dataKeys.reduce((config, dataKey) => {
    return {
      ...config,
      [dataKey.key]: {
        label: dataKey.name,
        color: dataKey.color,
      },
    };
  }, {});

  const formatXAxis = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MM/dd');
    } catch {
      return dateStr;
    }
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="animate-pulse flex flex-col h-64 justify-center items-center">
          <div className="w-12 h-12 border-4 border-t-[#00C853] border-gray-200 rounded-full animate-spin mb-4"></div>
          <div className="text-gray-500">Loading chart data...</div>
        </div>
      );
    }

    const commonProps = {
      data,
      margin: { top: 5, right: 20, bottom: 20, left: 0 },
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {dataKeys.map((dataKey) => (
              <Area
                key={String(dataKey.key)}
                type="monotone"
                dataKey={String(dataKey.key)}
                name={dataKey.name}
                stroke={dataKey.color}
                fill={dataKey.color}
                fillOpacity={0.1}
              />
            ))}
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {dataKeys.map((dataKey) => (
              <Bar
                key={String(dataKey.key)}
                dataKey={String(dataKey.key)}
                name={dataKey.name}
                fill={dataKey.color}
              />
            ))}
          </BarChart>
        );
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
            <XAxis 
              dataKey="date" 
              tickFormatter={formatXAxis}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {dataKeys.map((dataKey) => (
              <Line
                key={String(dataKey.key)}
                type="monotone"
                dataKey={String(dataKey.key)}
                name={dataKey.name}
                stroke={dataKey.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="px-6 pt-6 pb-0">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </CardHeader>
      <CardContent className="p-6">
        <div style={{ width: '100%', height }}>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsChart;

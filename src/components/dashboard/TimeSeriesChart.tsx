'use client';

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card } from '../ui/card';
import { LoadingIndicator } from '../ui/LoadingIndicator';
import { DataProcessor } from '@/lib/time-series/integration';
import { TrendDataPoint } from '@/lib/time-series/types';

interface TimeSeriesChartProps {
  title?: string;
  description?: string;
  metricType: string;
  subMetric?: string;
  interval?: 'weekly' | 'monthly' | 'quarterly';
  yAxisLabel?: string;
  color?: string;
  data?: TrendDataPoint[];
}

export function TimeSeriesChart({
  title,
  description,
  metricType,
  subMetric,
  interval = 'weekly',
  yAxisLabel,
  color = '#2563eb',
  data = []
}: TimeSeriesChartProps) {
  const [hoveredData, setHoveredData] = useState<TrendDataPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (data.length > 0) {
        return;
      }

      try {
        setLoading(true);
        const processor = DataProcessor.getInstance();
        const { weeklyTrends } = await processor.analyzeTrends(metricType);
        data = weeklyTrends;
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [metricType, data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            {metricType}: <span className="font-medium text-gray-900">
              {payload[0].value}
            </span>
          </p>
          {subMetric && (
            <p className="text-xs text-gray-500 mt-1">
              {subMetric}: {payload[0].payload.subMetric || 'N/A'}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="w-full h-[300px] p-4">
        <div className="h-full flex items-center justify-center">
          <LoadingIndicator />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-[300px] p-4">
        <div className="h-full flex items-center justify-center">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[300px] p-4">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-gray-500">No data available</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={title ? 220 : 280}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onMouseMove={(e) => {
              if (e.activePayload) {
                setHoveredData(e.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setHoveredData(null)}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              label={yAxisLabel ? { 
                value: yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                dy: 50
              } : undefined}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

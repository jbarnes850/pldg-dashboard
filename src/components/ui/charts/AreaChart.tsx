'use client';

import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../card';
import { formatTooltipValue, defaultChartStyle, defaultTooltipStyle } from './utils';
import { cn } from '@/lib/utils';

export interface AreaChartProps {
  data: any[];
  title: string;
  description?: string;
  height?: number;
  areas: Array<{
    key: string;
    name: string;
    color: string;
    gradientId: string;
    stackId?: string;
  }>;
  xAxisKey?: string;
  yAxisLabel?: string;
  className?: string;
}

export function AreaChart({
  data,
  title,
  description,
  height = 400,
  areas,
  xAxisKey = 'name',
  yAxisLabel,
  className
}: AreaChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">
                {formatTooltipValue(entry.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <RechartsAreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              onMouseMove={(e) => {
                if (e.activeTooltipIndex !== undefined) {
                  setActiveIndex(e.activeTooltipIndex);
                }
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                {areas.map(({ gradientId, color }) => (
                  <linearGradient
                    key={gradientId}
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={color}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={color}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border/40"
              />
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                dx={-10}
                label={yAxisLabel ? {
                  value: yAxisLabel,
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                } : undefined}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
              {areas.map(({ key, name, color, gradientId, stackId }) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={name}
                  stroke={color}
                  fill={`url(#${gradientId})`}
                  strokeWidth={2}
                  stackId={stackId}
                  dot={false}
                  activeDot={{
                    r: 6,
                    strokeWidth: 2,
                    stroke: color,
                    fill: 'hsl(var(--background))'
                  }}
                />
              ))}
            </RechartsAreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

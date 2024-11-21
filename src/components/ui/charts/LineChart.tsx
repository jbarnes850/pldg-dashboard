'use client';

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../card';
import { defaultTooltipStyle, defaultChartStyle } from './utils';
import { cn } from '@/lib/utils';

export interface LineChartProps {
  data: any[];
  title: string;
  description?: string;
  height?: number;
  lines: Array<{
    key: string;
    name: string;
    color: string;
    gradientId?: string;
  }>;
  xAxisKey?: string;
  yAxisLabel?: string;
  className?: string;
}

export function LineChart({
  data,
  title,
  description,
  height = 400,
  lines,
  xAxisKey = 'name',
  yAxisLabel,
  className
}: LineChartProps) {
  if (!data?.length) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className={`h-[${height}px] pt-4 flex items-center justify-center`}>
          <div className="text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={`h-[${height}px] pt-4`}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart 
            data={data} 
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            style={{ fontFamily: defaultChartStyle.fontFamily }}
          >
            <defs>
              {lines.map(line => line.gradientId && (
                <linearGradient key={line.gradientId} id={line.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={line.color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={line.color} stopOpacity={0.2}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))"
              opacity={defaultChartStyle.gridOpacity} 
            />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: defaultChartStyle.fontSize }}
              tickMargin={10}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tick={{ fontSize: defaultChartStyle.fontSize }}
              tickMargin={10}
              stroke="hsl(var(--muted-foreground))"
              label={yAxisLabel ? {
                value: yAxisLabel,
                angle: -90,
                position: 'insideLeft',
                style: { 
                  textAnchor: 'middle',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: defaultChartStyle.fontSize
                }
              } : undefined}
            />
            <Tooltip
              contentStyle={defaultTooltipStyle}
              cursor={{ stroke: 'hsl(var(--muted))' }}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: defaultChartStyle.fontSize
              }}
            />
            {lines.map(line => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.gradientId ? `url(#${line.gradientId})` : line.color}
                fill={line.gradientId ? `url(#${line.gradientId})` : 'none'}
                strokeWidth={defaultChartStyle.strokeWidth}
                dot={{ r: defaultChartStyle.dotRadius, strokeWidth: 2 }}
                activeDot={{ r: defaultChartStyle.activeDotRadius, strokeWidth: 2 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

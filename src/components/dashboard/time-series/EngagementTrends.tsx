'use client';

import React from 'react';
import { AreaChart } from '../../ui/charts/AreaChart';
import { chartColors, generateGradientId } from '../../ui/charts/utils';

interface EngagementTrendsProps {
  data: Array<{
    week: string;
    'High Engagement': number;
    'Medium Engagement': number;
    'Low Engagement': number;
  }>;
  className?: string;
}

export function EngagementTrends({ data, className }: EngagementTrendsProps) {
  const chartData = React.useMemo(() => {
    return data.map(item => ({
      name: item.week,
      High: item['High Engagement'],
      Medium: item['Medium Engagement'],
      Low: item['Low Engagement'],
    }));
  }, [data]);

  const areas = React.useMemo(() => [
    {
      key: 'High',
      name: 'High Engagement',
      color: chartColors.success,
      gradientId: generateGradientId('high'),
      stackId: 'engagement',
    },
    {
      key: 'Medium',
      name: 'Medium Engagement',
      color: chartColors.warning,
      gradientId: generateGradientId('medium'),
      stackId: 'engagement',
    },
    {
      key: 'Low',
      name: 'Low Engagement',
      color: chartColors.error,
      gradientId: generateGradientId('low'),
      stackId: 'engagement',
    },
  ], []);

  return (
    <AreaChart
      data={chartData}
      areas={areas}
      title="Engagement Distribution"
      description="Weekly distribution of participant engagement levels"
      yAxisLabel="Participants"
      height={350}
      className={className}
    />
  );
}

'use client';

import React from 'react';
import { AreaChart } from '../../ui/charts/AreaChart';
import { chartColors, generateGradientId } from '../../ui/charts/utils';

interface TechPartnerTrendsProps {
  data: Array<{
    week: string;
    issues: number;
    contributions: number;
    collaborations: number;
  }>;
  className?: string;
}

export function TechPartnerTrends({ data, className }: TechPartnerTrendsProps) {
  const chartData = React.useMemo(() => {
    return data.map(item => ({
      name: item.week,
      Issues: item.issues,
      Contributions: item.contributions,
      Collaborations: item.collaborations,
    }));
  }, [data]);

  const areas = React.useMemo(() => [
    {
      key: 'Issues',
      name: 'Issues Created',
      color: chartColors.primary,
      gradientId: generateGradientId('issues'),
    },
    {
      key: 'Contributions',
      name: 'Total Contributions',
      color: chartColors.success,
      gradientId: generateGradientId('contributions'),
    },
    {
      key: 'Collaborations',
      name: 'Active Collaborations',
      color: chartColors.purple,
      gradientId: generateGradientId('collaborations'),
    },
  ], []);

  return (
    <AreaChart
      data={chartData}
      areas={areas}
      title="Tech Partner Activity"
      description="Weekly trends in tech partner engagement and contributions"
      yAxisLabel="Count"
      height={350}
      className={className}
    />
  );
}

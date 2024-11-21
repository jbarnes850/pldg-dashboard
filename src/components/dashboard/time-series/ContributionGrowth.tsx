'use client';

import React from 'react';
import { LineChart } from '../../ui/charts/LineChart';
import { chartColors } from '../../ui/charts/utils';

interface ContributionGrowthProps {
  data: Array<{
    week: string;
    totalContributions: number;
    activeContributors: number;
    contributionsPerDev: number;
  }>;
  className?: string;
}

export function ContributionGrowth({ data, className }: ContributionGrowthProps) {
  const chartData = React.useMemo(() => {
    return data.map(item => ({
      name: item.week,
      'Total Contributions': item.totalContributions,
      'Active Contributors': item.activeContributors,
      'Contributions/Dev': item.contributionsPerDev,
    }));
  }, [data]);

  const lines = React.useMemo(() => [
    {
      key: 'Total Contributions',
      name: 'Total Contributions',
      color: chartColors.primary,
    },
    {
      key: 'Active Contributors',
      name: 'Active Contributors',
      color: chartColors.success,
    },
    {
      key: 'Contributions/Dev',
      name: 'Contributions per Dev',
      color: chartColors.purple,
    },
  ], []);

  return (
    <LineChart
      data={chartData}
      lines={lines}
      title="Contribution Growth"
      description="Weekly trends in contribution metrics"
      yAxisLabel="Count"
      height={350}
      className={className}
    />
  );
}

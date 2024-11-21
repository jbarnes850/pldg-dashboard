'use client';

import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { TimeSeriesChart as BaseTimeSeriesChart } from './TimeSeriesChart';

const METRICS = [
  {
    title: 'Active Contributors',
    description: 'Number of developers actively contributing each week',
    metricPath: 'contributors.active',
    metricType: 'contributors',
    yAxisLabel: 'Contributors',
    color: '#2563eb'  // blue-600
  },
  {
    title: 'Technical Progress',
    description: 'Total number of issues and PRs completed',
    metricPath: 'technical.progress',
    metricType: 'technical',
    yAxisLabel: 'Issues',
    color: '#059669'  // emerald-600
  },
  {
    title: 'Engagement Rate',
    description: 'Weekly program participation rate',
    metricPath: 'engagement.rate',
    metricType: 'engagement',
    yAxisLabel: 'Rate (%)',
    color: '#c026d3'  // fuchsia-600
  }
];

export function TimeSeriesGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {React.Children.map(children, (child) => (
        <ErrorBoundary>
          <div className="w-full min-h-[300px] transition-all duration-200 hover:shadow-lg">
            {child}
          </div>
        </ErrorBoundary>
      ))}
    </div>
  );
}

export function TimeSeriesContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b p-4">
        <h2 className="text-2xl font-semibold">Time Series Analysis</h2>
        <p className="text-sm text-gray-500">Track metrics and trends over time</p>
      </div>
      <TimeSeriesGrid>{children}</TimeSeriesGrid>
    </div>
  );
}

interface TimeSeriesChartProps {
  title: string;
  description: string;
  metricPath: string;
  metricType: string;
  yAxisLabel: string;
  color: string;
}

export function TimeSeriesChart(props: TimeSeriesChartProps) {
  return <BaseTimeSeriesChart {...props} />;
}

export function App() {
  return (
    <TimeSeriesContainer>
      {METRICS.map((metric) => (
        <TimeSeriesChart
          key={metric.metricPath}
          {...metric}
        />
      ))}
    </TimeSeriesContainer>
  );
}

'use client';

import * as React from 'react';
import { useDashboardSystemContext } from '@/context/DashboardSystemContext';
import ExecutiveSummary from './ExecutiveSummary';
import { ActionableInsights } from './ActionableInsights';
import TechPartnerChart from './TechPartnerChart';
import TopPerformersTable from './TopPerformersTable';
import { LoadingSpinner } from '../ui/loading';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import { TimeSeriesSection } from './time-series/TimeSeriesSection';
import { TechPartnerTrends } from './time-series/TechPartnerTrends';
import { EngagementTrends } from './time-series/EngagementTrends';
import { ContributionGrowth } from './time-series/ContributionGrowth';
import { useMemo } from 'react';

export default function DeveloperEngagementDashboard() {
  const { data, isLoading, isError, refresh, lastUpdated, isFetching } = useDashboardSystemContext();

  const techPartnerData = useMemo(() => {
    if (!data) return [];
    return data.techPartnerPerformance.map(partner => ({
      ...partner,
      completionRate: Math.round(partner.completionRate * 100)
    }));
  }, [data]);

  React.useEffect(() => {
    console.log('Dashboard State:', {
      hasData: !!data,
      metrics: data ? {
        contributors: data.activeContributors,
        techPartners: data.programHealth.activeTechPartners,
        engagementTrends: data.engagementTrends.length,
        technicalProgress: data.technicalProgress.length
      } : null,
      isLoading,
      isError,
      isFetching,
      lastUpdated: new Date(lastUpdated).toISOString()
    });
  }, [data, isLoading, isError, isFetching, lastUpdated]);

  if (isLoading || (!data && !isError)) {
    return (
      <div className="container mx-auto p-4">
        <div className="h-[calc(100vh-200px)] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto p-4">
        <div className="p-4 text-center text-red-600">
          Unable to load dashboard data. Please try refreshing.
          <Button 
            variant="outline"
            size="sm"
            onClick={refresh}
            className="mt-4 mx-auto"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <header className="mb-8 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">PLDG Developer Engagement</h1>
            <p className="mt-2 text-indigo-100">Real-time insights and engagement metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-indigo-200">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refresh}
              disabled={isFetching}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>
      </header>

      {/* Top Section - Executive Summary */}
      <div className="mb-6 bg-white rounded-lg shadow-md">
        <ExecutiveSummary data={data} />
      </div>

      {/* Action Items Section */}
      <div className="mb-8">
        <ActionableInsights data={data} />
      </div>

      {/* Time Series Analytics */}
      <div className="mb-8">
        <div className="grid gap-4 md:grid-cols-2">
          <TechPartnerTrends 
            data={data.techPartnerActivity || []} 
            className="col-span-1"
          />
          <EngagementTrends 
            data={data.engagementTrends || []} 
            className="col-span-1"
          />
          <ContributionGrowth 
            data={data.contributorGrowth || []} 
            className="col-span-1"
          />
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <TechPartnerChart data={techPartnerData} />
        <TopPerformersTable data={data.topPerformers} />
      </div>

      {/* Full Width Sections */}
      <div className="space-y-8">
        {/* Top Contributors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <TopPerformersTable data={data.topPerformers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
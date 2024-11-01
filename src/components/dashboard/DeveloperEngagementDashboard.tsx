'use client';

import * as React from 'react';
import { useDashboardSystem } from '@/lib/system';
import { LoadingCard } from '@/components/ui/loading-card';
import { Card } from '@/components/ui/card';
import ExecutiveSummary from './ExecutiveSummary';
import EngagementChart from './EngagementChart';
import TechnicalProgressChart from './TechnicalProgressChart';
import TopPerformersTable from './TopPerformersTable';
import TechPartnerChart from './TechPartnerChart';
import { ActionableInsights } from './ActionableInsights';
import { EnhancedProcessedData } from '@/types/dashboard';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function DeveloperEngagementDashboard() {
  const { data, isLoading, isError, error } = useDashboardSystem();

  React.useEffect(() => {
    console.log('Dashboard Data:', {
      hasData: !!data,
      isLoading,
      isError,
      error,
      dataStructure: data ? {
        hasEngagementTrends: !!data.engagementTrends?.length,
        hasTechnicalProgress: !!data.technicalProgress?.length,
        hasTechPartners: !!data.techPartnerPerformance?.length,
        hasTopPerformers: !!data.topPerformers?.length
      } : null
    });
  }, [data, isLoading, isError, error]);

  const handleExport = React.useCallback(() => {
    // Implement export functionality
  }, []);

  const safeData = React.useMemo(() => {
    console.log('Creating safeData with:', data);
    const defaultData = {
      engagementTrends: [],
      technicalProgress: [],
      techPartnerPerformance: [],
      topPerformers: [],
      programHealth: {
        npsScore: 0,
        engagementRate: 0,
        activeTechPartners: 0
      },
      githubMetrics: {
        inProgress: 0,
        done: 0,
        totalIssues: 0,
        openIssues: 0,
        recentActivity: 0,
        avgTimeToClose: 0,
        contributorCount: 0
      },
      insights: {
        keyTrends: [],
        areasOfConcern: [],
        recommendations: [],
        achievements: [],
        metrics: {
          engagementScore: 0,
          technicalProgress: 0,
          collaborationIndex: 0
        }
      },
      keyHighlights: {
        activeContributorsAcrossTechPartners: '0 across 0',
        totalContributions: '0 total',
        positiveFeedback: '0 positive',
        weeklyContributions: '0% change'
      },
      actionItems: [],
      feedbackSentiment: {
        positive: 0,
        negative: 0,
        neutral: 0
      },
      activeContributors: 0,
      totalContributions: 0,
      weeklyChange: 0,
      contributorGrowth: [],
      issueMetrics: [],
      techPartnerMetrics: []
    };

    return data ? {
      ...defaultData,
      ...data
    } : defaultData;
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <LoadingCard />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">Error Loading Dashboard</h2>
          <p className="text-sm text-gray-600">{error || 'Failed to load dashboard data'}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <ErrorBoundary>
        <ExecutiveSummary data={safeData} onExport={handleExport} />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <ActionableInsights data={safeData} />
      </ErrorBoundary>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary>
          <EngagementChart data={safeData.engagementTrends} />
        </ErrorBoundary>
        <ErrorBoundary>
          <TechnicalProgressChart 
            data={safeData.technicalProgress} 
            githubData={safeData.githubMetrics} 
          />
        </ErrorBoundary>
      </div>
      
      <ErrorBoundary>
        <TechPartnerChart data={safeData.techPartnerPerformance} />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <TopPerformersTable data={safeData.topPerformers} />
      </ErrorBoundary>
    </div>
  );
}
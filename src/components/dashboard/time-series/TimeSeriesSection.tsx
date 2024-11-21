'use client';

import React from 'react';
import { TechPartnerTrends } from './TechPartnerTrends';
import { EngagementTrends } from './EngagementTrends';
import { ContributionGrowth } from './ContributionGrowth';

interface TimeSeriesSectionProps {
  data: {
    techPartnerTrends: Array<{
      week: string;
      issues: number;
      contributions: number;
      collaborations: number;
    }>;
    engagementTrends: Array<{
      week: string;
      'High Engagement': number;
      'Medium Engagement': number;
      'Low Engagement': number;
    }>;
    contributionGrowth: Array<{
      week: string;
      totalContributions: number;
      activeContributors: number;
      contributionsPerDev: number;
    }>;
  };
}

export function TimeSeriesSection({ data }: TimeSeriesSectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-6">Time Series Analytics</h2>
        <p className="text-muted-foreground mb-6">
          Track engagement patterns and contribution trends over time
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContributionGrowth data={data.contributionGrowth} />
        <EngagementTrends data={data.engagementTrends} />
      </div>
      
      <div className="grid grid-cols-1">
        <TechPartnerTrends data={data.techPartnerTrends} />
      </div>
    </div>
  );
}

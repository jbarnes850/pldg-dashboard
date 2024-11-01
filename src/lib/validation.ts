import { z } from 'zod';
import { ProcessedData, GitHubData } from '@/types/dashboard';

export const processedDataSchema = z.object({
  weeklyChange: z.number(),
  activeContributors: z.number(),
  totalContributions: z.number(),
  programHealth: z.object({
    npsScore: z.number(),
    engagementRate: z.number(),
    activeTechPartners: z.number()
  }),
  keyHighlights: z.object({
    activeContributorsAcrossTechPartners: z.string(),
    totalContributions: z.string(),
    positiveFeedback: z.string(),
    weeklyContributions: z.string()
  }),
  topPerformers: z.array(z.object({
    name: z.string(),
    totalIssues: z.number(),
    avgEngagement: z.number(),
    engagementScore: z.number(),
    issuesCompleted: z.number(),
    techPartner: z.string()
  })),
  actionItems: z.array(z.object({
    type: z.string(),
    title: z.string(),
    description: z.string(),
    action: z.string()
  })),
  engagementTrends: z.array(z.object({
    week: z.string(),
    'High Engagement': z.number(),
    'Medium Engagement': z.number(),
    'Low Engagement': z.number(),
    total: z.number()
  })),
  technicalProgress: z.array(z.object({
    week: z.string(),
    newIssues: z.number(),
    inProgress: z.number(),
    completed: z.number(),
    total: z.number()
  })),
  issueMetrics: z.array(z.object({
    week: z.string(),
    open: z.number(),
    closed: z.number(),
    total: z.number()
  })),
  feedbackSentiment: z.object({
    positive: z.number(),
    neutral: z.number(),
    negative: z.number()
  }),
  techPartnerMetrics: z.array(z.object({
    partner: z.string(),
    totalIssues: z.number(),
    activeContributors: z.number(),
    avgIssuesPerContributor: z.number(),
    collaborationScore: z.number(),
    avgEngagement: z.number()
  })),
  techPartnerPerformance: z.array(z.object({
    partner: z.string(),
    issues: z.number()
  })),
  contributorGrowth: z.array(z.object({
    week: z.string(),
    newContributors: z.number(),
    returningContributors: z.number(),
    totalActive: z.number()
  })),
  githubMetrics: z.object({
    inProgress: z.number(),
    done: z.number(),
    totalIssues: z.number(),
    openIssues: z.number(),
    recentActivity: z.number(),
    avgTimeToClose: z.number(),
    contributorCount: z.number()
  })
});

export function validateGitHubData(data: any): GitHubData | null {
  try {
    return {
      project: data.project,
      issues: data.issues,
      statusGroups: {
        todo: data.statusGroups?.todo || 0,
        inProgress: data.statusGroups?.inProgress || 0,
        done: data.statusGroups?.done || 0
      },
      metrics: {
        totalIssues: data.metrics?.totalIssues || 0,
        openIssues: data.metrics?.openIssues || 0,
        recentActivity: data.metrics?.recentActivity || 0,
        avgTimeToClose: data.metrics?.avgTimeToClose || 0,
        contributorCount: data.metrics?.contributorCount || 0
      }
    };
  } catch (error) {
    console.error('GitHub data validation failed:', error);
    return null;
  }
}

export function isValidProcessedData(data: any): data is ProcessedData {
  try {
    processedDataSchema.parse(data);
    return true;
  } catch (error) {
    return false;
  }
}

export function isValidEnhancedData(data: any): data is ProcessedData {
  try {
    processedDataSchema.parse(data);
    return true;
  } catch (error) {
    return false;
  }
}

const insightsDataSchema = z.object({
  engagementMetrics: z.object({
    trends: z.array(z.object({
      week: z.string(),
      'High Engagement': z.number(),
      'Medium Engagement': z.number(),
      'Low Engagement': z.number(),
      total: z.number()
    })).optional(),
  }),
  techPartnerMetrics: z.array(z.object({
    partner: z.string(),
    totalIssues: z.number(),
    activeContributors: z.number(),
    avgEngagement: z.number()
  })),
  contributorMetrics: z.object({
    activeContributors: z.number(),
    totalContributions: z.number(),
    weeklyChange: z.number()
  }),
  githubMetrics: z.object({
    totalIssues: z.number(),
    openIssues: z.number(),
    recentActivity: z.number(),
    avgTimeToClose: z.number(),
    contributorCount: z.number()
  })
});

export function validateInsightsData(data: unknown) {
  try {
    const validatedData = insightsDataSchema.parse(data);
    return validatedData;
  } catch (error) {
    console.error('Insights data validation failed:', error);
    return null;
  }
}
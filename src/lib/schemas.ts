import * as z from 'zod';

export const topPerformerSchema = z.object({
  name: z.string(),
  totalIssues: z.number(),
  avgEngagement: z.number(),
  issuesCompleted: z.number().optional(),
  engagementScore: z.number(),
  techPartner: z.string().optional()
});

export const techPartnerSchema = z.object({
  partner: z.string(),
  issues: z.number(),
  contributors: z.array(z.string()).optional()
});

export const githubDataSchema = z.object({
  statusGroups: z.object({
    inProgress: z.number(),
    done: z.number()
  }),
  metrics: z.object({
    totalIssues: z.number(),
    openIssues: z.number(),
    recentActivity: z.number(),
    avgTimeToClose: z.number(),
    contributorCount: z.number()
  })
});

export const insightsDataSchema = z.object({
  keyTrends: z.array(z.string()),
  areasOfConcern: z.array(z.string()),
  recommendations: z.array(z.string()),
  achievements: z.array(z.string()),
  metrics: z.object({
    engagementScore: z.number(),
    technicalProgress: z.number(),
    collaborationIndex: z.number()
  })
});

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
  topPerformers: z.array(topPerformerSchema),
  actionItems: z.array(z.object({
    type: z.enum(['warning', 'opportunity', 'success']),
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
  issueMetrics: z.array(z.any()),
  feedbackSentiment: z.any(),
  techPartnerMetrics: z.array(z.object({
    partner: z.string(),
    totalIssues: z.number(),
    activeContributors: z.number(),
    avgIssuesPerContributor: z.number(),
    collaborationScore: z.number(),
    avgEngagement: z.number()
  })),
  techPartnerPerformance: z.array(techPartnerSchema),
  contributorGrowth: z.array(z.object({
    week: z.string(),
    newContributors: z.number(),
    returningContributors: z.number(),
    totalActive: z.number()
  })),
  githubMetrics: githubDataSchema
}); 
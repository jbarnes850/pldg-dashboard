export type ActionItemType = 'warning' | 'opportunity' | 'success';

export interface ActionItem {
  type: ActionItemType;
  title: string;
  description: string;
  action: string;
}

export interface EngagementData {
  'Tech Partner': string;
  'Contributor Name': string;
  'Which Tech Partner': string | string[];
  'Program Week': string;
  'Engagement Participation '?: string;
  'How many issues, PRs, or projects this week?'?: string;
  'How likely are you to recommend the PLDG to others?'?: string;
  'PLDG Feedback'?: string;
  'Issue Title 1'?: string;
  'Issue Link 1'?: string;
  Name: string;
}

export interface IssueMetrics {
  week: string;
  open: number;
  closed: number;
  total: number;
}

export interface RawIssueMetric {
  category: string;
  count: number;
  percentComplete: number;
}

export interface FeedbackSentiment {
  positive: number;
  neutral: number;
  negative: number;
}

export interface TopPerformer {
  name: string;
  totalIssues: number;
  avgEngagement: number;
  engagementScore: number;
  issuesCompleted: number;
  techPartner: string;
}

export interface TechPartnerMetrics {
  partner: string;
  totalIssues: number;
  activeContributors: number;
  avgIssuesPerContributor: number;
  collaborationScore: number;
  avgEngagement: number;
}

export interface TechPartnerPerformance {
  partner: string;
  issues: number;
}

export interface EngagementTrend {
  week: string;
  'High Engagement': number;
  'Medium Engagement': number;
  'Low Engagement': number;
  total: number;
}

export interface TechnicalProgress {
  week: string;
  newIssues: number;
  inProgress: number;
  completed: number;
  total: number;
}

export interface ContributorGrowth {
  week: string;
  contributors: number;
  newContributors: number;
  churnedContributors: number;
}

export interface GitHubMetrics {
  inProgress: number;
  done: number;
  totalIssues: number;
  openIssues: number;
  recentActivity: number;
  avgTimeToClose: number;
  contributorCount: number;
}

export interface ProcessedData {
  weeklyChange: number;
  activeContributors: number;
  totalContributions: number;
  programHealth: {
    npsScore: number;
    engagementRate: number;
    activeTechPartners: number;
  };
  keyHighlights: {
    activeContributorsAcrossTechPartners: string;
    totalContributions: string;
    positiveFeedback: string;
    weeklyContributions: string;
  };
  topPerformers: TopPerformer[];
  actionItems: ActionItem[];
  engagementTrends: EngagementTrend[];
  technicalProgress: TechnicalProgress[];
  techPartnerPerformance: TechPartnerPerformance[];
  githubMetrics: GitHubMetrics;
  techPartnerMetrics: TechPartnerMetrics[];
  contributorGrowth: ContributorGrowth[];
  issueMetrics: IssueMetrics[];
  feedbackSentiment: FeedbackSentiment;
}

export interface EnhancedProcessedData extends ProcessedData {
  insights: {
    keyTrends: string[];
    areasOfConcern: string[];
    recommendations: string[];
    achievements: string[];
    metrics: {
      engagementScore: number;
      technicalProgress: number;
      collaborationIndex: number;
    };
  };
}

export interface GitHubData {
  project: {
    user: {
      projectV2: {
        items: {
          nodes: Array<{
            id: string;
            fieldValues: {
              nodes: Array<{
                field: { name: string };
                name?: string;
                value?: string;
                date?: string;
                text?: string;
              }>;
            };
            content: {
              title: string;
              state: string;
              createdAt: string;
              closedAt: string | null;
              number: number;
              url: string;
              labels?: {
                nodes: Array<{
                  name: string;
                  color: string;
                }>;
              };
              assignees?: {
                nodes: Array<{
                  login: string;
                  avatarUrl: string;
                }>;
              };
              milestone?: {
                title: string;
                dueOn: string;
              };
            } | null;
          }>;
        };
      };
    };
  };
  issues: Array<{
    id: string;
    title: string;
    state: string;
    status: string;
    number: number;
    url: string;
    created_at: string;
    closed_at: string | null;
    labels: Array<{
      name: string;
      color: string;
    }>;
    assignees: Array<{
      login: string;
      avatarUrl: string;
    }>;
    milestone?: {
      title: string;
      dueOn: string;
    };
  }>;
  statusGroups: {
    todo: number;
    inProgress: number;
    done: number;
  };
  metrics: {
    totalIssues: number;
    openIssues: number;
    recentActivity: number;
    avgTimeToClose: number;
    contributorCount: number;
  };
} 
import { DateRange } from 'react-day-picker';

export type ActionItemType = 'warning' | 'opportunity' | 'success';

export interface ActionItem {
  type: ActionItemType;
  title: string;
  description: string;
  action: string;
}

export interface EngagementData {
  Name: string;
  'Program Week': string;
  'Engagement Participation ': string;
  'Tech Partner Collaboration?': string;
  'Which Tech Partner': string;
  'How likely are you to recommend the PLDG to others?': string;
  'How many issues, PRs, or projects this week?': string;
  'Issue Title 1'?: string;
  'Issue Link 1'?: string;
  'Issue Description 1'?: string;
  [key: string]: string | undefined;
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
}

export interface TechPartnerMetrics {
  partner: string;
  totalIssues: number;
  activeContributors: number;
  avgIssuesPerContributor: number;
  collaborationScore: number;
}

export interface TechPartnerActivity {
  week: string;
  partner: string;
  issues: number;
  contributions: number;
  collaborations: number;
}

export interface TechPartnerPerformance {
  partner: string;
  issues: number;
  activeContributors: number;
  completionRate: number;
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
  'Total Issues': number;
}

export interface ContributorGrowth {
  week: string;
  totalContributions: number;
  activeContributors: number;
  contributionsPerDev: number;
  newContributors?: number;
}

export interface WeeklyMetrics {
  sessionAttendance: { [key: string]: number };
  participationLevels: {
    high: number;
    medium: number;
    low: number;
  };
  issues: {
    total: number;
    details: Array<{
      title: string;
      link: string;
      description: string;
    }>;
  };
  cumulative: {
    totalContributions: number;
    byTechPartner: { [key: string]: number };
  };
}

export interface ProcessedData {
  weeklyChange: number;
  participationRate: number;
  activeContributors: number;
  totalContributions: number;
  programHealth: {
    npsScore: number;
    engagementRate: number;
    satisfactionScore: number;
    activeTechPartners: number;
  };
  npsScore: number;
  engagementRate: number;
  satisfactionScore: number;
  activeTechPartners: number;
  engagementTrends: EngagementTrend[];
  technicalProgress: TechnicalProgress[];
  techPartnerMetrics: TechPartnerMetrics[];
  techPartnerActivity: TechPartnerActivity[];
  techPartnerPerformance: TechPartnerPerformance[];
  contributorGrowth: ContributorGrowth[];
  feedbackSentiment: FeedbackSentiment;
  actionItems: ActionItem[];
  topPerformers: TopPerformer[];
}

export interface AIMetrics {
  engagementScore: number;
  technicalProgress: number;
  collaborationIndex: number;
}

export interface AIInsights {
  keyTrends: string[];
  areasOfConcern: string[];
  recommendations: string[];
  achievements: string[];
  metrics: AIMetrics;
}

export interface EnhancedProcessedData extends ProcessedData {
  insights: AIInsights;
}

export interface GitHubData {
  project: {
    user: {
      projectV2: {
        items: {
          nodes: any[];
        };
      };
    };
  };
  issues: Array<{
    id: string;
    title: string;
    state: string;
    created_at: string;
    closed_at: string | null;
    status: string;
    assignee?: {
      login: string;
    };
  }>;
  timestamp: number;
  statusGroups: {
    todo: number;
    inProgress: number;
    done: number;
  };
}

export interface GitHubUserContribution {
  username: string;
  issues: {
    created: number;
    commented: number;
    closed: number;
  };
  pullRequests: {
    created: number;
    reviewed: number;
    merged: number;
  };
  repositories: string[];
  lastActive: string;
}

export interface EnhancedGitHubData extends GitHubData {
  userContributions: Record<string, GitHubUserContribution>;
  contributionDiscrepancies: Array<{ 
    username: string; 
    discrepancy: string 
  }>;
}

export interface ConsolidatedData {
  projectBoard: GitHubData;
  userContributions: Record<string, GitHubUserContribution>;
  validatedContributions: Record<string, ValidatedContribution>;
  metrics: DashboardMetrics;
  lastUpdated: number;
  airtableData?: EngagementData[];
  githubData?: GitHubData;
}

export interface ValidatedContribution {
  reported: number;
  projectBoard: number;
  github: number;
  isValid: boolean;
  contributorValid?: boolean;
}

export interface DashboardMetrics {
  totalContributions: number;
  activeContributors: number;
  averageEngagement: number;
  completionRate: number;
  previousTotal: number;
  npsScore?: number;
  trends: {
    engagement: EngagementTrend[];
    technical: TechnicalProgress[];
    techPartner: TechPartnerPerformance[];
    techPartnerPerformance: TechPartnerPerformance[];
    contributorGrowth: ContributorGrowth[];
  };
}

export interface RestEndpointMethodTypes {
  search: {
    issuesAndPullRequests: {
      parameters: {
        q: string;
        sort?: string;
        order?: string;
        per_page?: number;
      };
      response: {
        data: {
          total_count: number;
          items: Array<GitHubIssue>;
        };
      };
    };
  };
}

export interface GitHubIssue {
  title: string;
  state: string;
  created_at: string;
  closed_at: string | null;
  status?: string;
  assignee?: { login: string };
  comments: number;
  pull_request?: {
    merged: boolean;
    merged_at: string | null;
  };
  requested_reviewers?: Array<{ login: string }>;
}
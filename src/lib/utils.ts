import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import _ from 'lodash'
import { 
  IssueMetrics, 
  RawIssueMetric, 
  ProcessedData, 
  EnhancedProcessedData,
  EngagementData,
  EngagementTrend,
  TopPerformer,
  GitHubMetrics,
  TechPartnerPerformance
} from '../types/dashboard'
import { processDataWithAI } from './ai';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add this function at the top with other helper functions
function processEngagementTrends(data: EngagementData[]): EngagementTrend[] {
  const weeklyData = data.reduce((acc, record) => {
    const week = record['Program Week'];
    if (!week) return acc;

    if (!acc[week]) {
      acc[week] = {
        'High Engagement': 0,
        'Medium Engagement': 0,
        'Low Engagement': 0,
        total: 0
      };
    }

    const engagement = parseInt(record['How likely are you to recommend the PLDG to others?'] || '0');
    if (engagement >= 7) acc[week]['High Engagement']++;
    else if (engagement >= 5) acc[week]['Medium Engagement']++;
    else if (engagement > 0) acc[week]['Low Engagement']++;
    acc[week].total++;

    return acc;
  }, {} as Record<string, Omit<EngagementTrend, 'week'>>);

  return Object.entries(weeklyData).map(([week, data]) => ({
    week,
    ...data
  }));
}

export async function processEngagementData(airtableData: EngagementData[], githubMetrics: GitHubMetrics): Promise<ProcessedData> {
  try {
    console.log('Processing engagement data:', {
      airtableRecords: airtableData.length,
      githubMetrics,
      sampleAirtableRecord: airtableData[0] ? {
        ...airtableData[0],
        'Name': '[redacted]',
        'Contributor Name': '[redacted]'
      } : null
    });

    // Process engagement trends
    const engagementTrends = processEngagementTrends(airtableData);
    console.log('Processed engagement trends:', {
      trendsCount: engagementTrends.length,
      sampleTrend: engagementTrends[0]
    });

    // Process technical progress with default values
    const technicalProgress = engagementTrends.map(weekData => ({
      week: weekData.week,
      newIssues: githubMetrics.recentActivity || 0,
      inProgress: githubMetrics.inProgress || 0,
      completed: githubMetrics.done || 0,
      total: githubMetrics.totalIssues || 0
    }));

    // Group data by tech partner
    const techPartnerData = airtableData.reduce((acc, record) => {
      const partner = record['Tech Partner'];
      if (!partner) return acc;

      if (!acc[partner]) {
        acc[partner] = {
          issues: 0,
          contributors: new Set<string>(),
          engagement: [] as number[]
        };
      }

      // Count issues
      const issueCount = parseInt(record['How many issues, PRs, or projects this week?'] || '0');
      acc[partner].issues += issueCount;

      // Track contributors
      if (record['Contributor Name']) {
        acc[partner].contributors.add(record['Contributor Name']);
      }

      // Track engagement
      const engagement = parseInt(record['How likely are you to recommend the PLDG to others?'] || '0');
      if (engagement) {
        acc[partner].engagement.push(engagement);
      }

      return acc;
    }, {} as Record<string, { issues: number; contributors: Set<string>; engagement: number[] }>);

    // Process tech partner performance
    const techPartnerPerformance = Object.entries(techPartnerData).map(([partner, data]) => ({
      partner,
      issues: data.issues
    }));
    console.log('Processed tech partner performance:', techPartnerPerformance);

    // Process top performers
    const topPerformers = processTopPerformers(airtableData);
    console.log('Processed top performers:', topPerformers);

    // Calculate key metrics
    const activeContributors = new Set(airtableData.map(r => r.Name)).size;
    const totalContributions = airtableData.length;
    const positiveFeedback = airtableData.filter(r => 
      r['PLDG Feedback']?.toLowerCase().includes('great') || 
      r['PLDG Feedback']?.toLowerCase().includes('good') ||
      r['PLDG Feedback']?.toLowerCase().includes('excellent')
    ).length;
    const weeklyChange = calculateWeeklyChange(airtableData);

    // Ensure all required fields are present with proper types
    const processedData: ProcessedData = {
      weeklyChange,
      activeContributors,
      totalContributions,
      programHealth: {
        npsScore: calculateNPSScore(airtableData),
        engagementRate: calculateEngagementRate(airtableData),
        activeTechPartners: Object.keys(techPartnerData).length
      },
      keyHighlights: {
        activeContributorsAcrossTechPartners: `${activeContributors} across ${techPartnerPerformance.length}`,
        totalContributions: `${totalContributions} total`,
        positiveFeedback: `${positiveFeedback} positive`,
        weeklyContributions: `${weeklyChange}% change`
      },
      topPerformers,
      actionItems: [],
      engagementTrends,
      technicalProgress,
      issueMetrics: processRawIssueMetrics(airtableData),
      feedbackSentiment: calculateSentiment(airtableData),
      techPartnerMetrics: Object.entries(techPartnerData).map(([partner, data]) => ({
        partner,
        totalIssues: data.issues,
        activeContributors: data.contributors.size,
        avgIssuesPerContributor: Math.round(data.issues / data.contributors.size),
        collaborationScore: calculateCollaborationScore(data.contributors.size, data.issues),
        avgEngagement: calculateAvgEngagement(data.engagement)
      })),
      techPartnerPerformance,
      contributorGrowth: [],
      githubMetrics
    };

    console.log('Final processed data:', {
      hasEngagementTrends: !!processedData.engagementTrends?.length,
      hasTechnicalProgress: !!processedData.technicalProgress?.length,
      hasPartnerPerformance: !!processedData.techPartnerPerformance?.length,
      hasTopPerformers: !!processedData.topPerformers?.length,
      metrics: {
        weeklyChange: processedData.weeklyChange,
        activeContributors: processedData.activeContributors,
        totalContributions: processedData.totalContributions
      }
    });

    return processedData;
  } catch (error) {
    console.error('Error in processEngagementData:', error);
    throw error;
  }
}

function calculateNPS(data: any[]): number {
  const total = data.length;
  if (!total) return 0;
  const promoters = data.filter(r => r.NPS >= 9).length;
  const detractors = data.filter(r => r.NPS <= 6).length;
  return Math.round(((promoters - detractors) / total) * 100);
}

function calculateEngagementRate(data: EngagementData[]): number {
  const totalEntries = data.length;
  if (totalEntries === 0) return 0;

  const activeEntries = data.filter(entry => 
    entry['Engagement Participation ']?.includes('3 -') || 
    entry['Engagement Participation ']?.includes('2 -')
  ).length;

  return Math.round((activeEntries / totalEntries) * 100);
}

function calculateWeeklyChange(data: EngagementData[]): number {
  const weeks = _(data)
    .groupBy('Program Week')
    .mapValues(entries => 
      entries.reduce((sum, entry) => 
        sum + (parseInt(entry['How many issues, PRs, or projects this week?'] || '0')), 0
      )
    )
    .value();

  const weeksList = Object.entries(weeks)
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

  if (weeksList.length < 2) return 0;

  const [currentWeek, previousWeek] = weeksList;
  const currentValue = currentWeek[1] as number;
  const previousValue = previousWeek[1] as number;

  return previousValue ? Math.round(((currentValue - previousValue) / previousValue) * 100) : 0;
}

function calculateSentiment(data: EngagementData[]) {
  return {
    positive: data.filter(r => 
      r['PLDG Feedback']?.toLowerCase().includes('great') || 
      r['PLDG Feedback']?.toLowerCase().includes('good') ||
      r['PLDG Feedback']?.toLowerCase().includes('excellent')
    ).length,
    negative: data.filter(r => 
      r['PLDG Feedback']?.toLowerCase().includes('bad') ||
      r['PLDG Feedback']?.toLowerCase().includes('poor') ||
      r['PLDG Feedback']?.toLowerCase().includes('issue')
    ).length,
    neutral: data.filter(r => {
      const feedback = r['PLDG Feedback']?.toLowerCase();
      return feedback && 
        !feedback.includes('great') && 
        !feedback.includes('good') && 
        !feedback.includes('excellent') &&
        !feedback.includes('bad') &&
        !feedback.includes('poor') &&
        !feedback.includes('issue');
    }).length
  };
}

export function calculateTechnicalProgress(data: ProcessedData): number {
  if (!data.issueMetrics.length) return 0;
  
  const latestMetrics = data.issueMetrics[data.issueMetrics.length - 1];
  return latestMetrics.total > 0 
    ? Math.round((latestMetrics.closed / latestMetrics.total) * 100) 
    : 0;
}

// Convert raw metrics to IssueMetrics format
function processIssueMetrics(rawMetrics: RawIssueMetric[]): IssueMetrics[] {
  const currentDate = new Date();
  const weekStr = currentDate.toISOString().split('T')[0];
  
  return rawMetrics.map(metric => ({
    week: weekStr,
    open: Math.round(metric.count * (1 - metric.percentComplete / 100)),
    closed: Math.round(metric.count * (metric.percentComplete / 100)),
    total: metric.count
  }));
}

// Update the processData function to use the correct issue metrics processing
export function processData(rawData: any): ProcessedData {
  const processedIssueMetrics = processIssueMetrics(rawData.issueMetrics || []);
  
  return {
    weeklyChange: rawData.weeklyChange || 0,
    activeContributors: rawData.activeContributors || 0,
    totalContributions: rawData.totalContributions || 0,
    keyHighlights: rawData.keyHighlights || {
      activeContributorsAcrossTechPartners: '0 across 0',
      totalContributions: '0 total',
      positiveFeedback: '0 positive',
      weeklyContributions: '0% change'
    },
    actionItems: rawData.actionItems || [],
    engagementTrends: rawData.engagementTrends || [],
    techPartnerPerformance: rawData.techPartnerPerformance || [],
    techPartnerMetrics: rawData.techPartnerMetrics || [],
    topPerformers: rawData.topPerformers || [],
    technicalProgress: rawData.technicalProgress || [],
    issueMetrics: processedIssueMetrics,
    feedbackSentiment: rawData.feedbackSentiment || { positive: 0, neutral: 0, negative: 0 },
    contributorGrowth: rawData.contributorGrowth || [],
    programHealth: {
      npsScore: rawData.programHealth?.npsScore || 0,
      engagementRate: rawData.programHealth?.engagementRate || 0,
      activeTechPartners: rawData.programHealth?.activeTechPartners || 0
    },
    githubMetrics: {
      inProgress: rawData.githubMetrics?.inProgress || 0,
      done: rawData.githubMetrics?.done || 0,
      totalIssues: rawData.githubMetrics?.totalIssues || 0,
      openIssues: rawData.githubMetrics?.openIssues || 0,
      recentActivity: rawData.githubMetrics?.recentActivity || 0,
      avgTimeToClose: rawData.githubMetrics?.avgTimeToClose || 0,
      contributorCount: rawData.githubMetrics?.contributorCount || 0
    }
  };
}

// Helper function to combine and prioritize insights
export function combineAndPrioritize(insights1: string[] = [], insights2: string[] = []): string[] {
  const combined = [...new Set([...insights1, ...insights2])];
  return combined.slice(0, 5); // Return top 5 insights
}

// Calculate engagement score based on engagement trends and NPS
export function calculateEngagementScore(data: ProcessedData): number {
  const recentEngagement = data.engagementTrends[data.engagementTrends.length - 1];
  const engagementRate = (recentEngagement['High Engagement'] / recentEngagement.total) * 100;
  return Math.round((engagementRate + data.programHealth.npsScore) / 2);
}

// Calculate collaboration index based on tech partner interactions
export function calculateCollaborationIndex(data: ProcessedData): number {
  const activePartners = new Set(data.techPartnerMetrics.map(m => m.partner)).size;
  const totalContributors = data.topPerformers.length;
  return Math.round((activePartners / totalContributors) * 100);
}

// Helper function to fetch and process insights
export async function generateEnhancedInsights(data: ProcessedData): Promise<EnhancedProcessedData> {
  try {
    const metricsResponse = await fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engagementMetrics: {
          trends: data.engagementTrends,
          npsScore: data.programHealth.npsScore,
          feedbackSentiment: data.feedbackSentiment
        },
        techPartnerMetrics: data.techPartnerPerformance,
        contributorMetrics: {
          topPerformers: data.topPerformers,
          growth: data.contributorGrowth
        },
        githubMetrics: data.issueMetrics
      })
    });

    const [metricsResult, programResult] = await Promise.all([
      metricsResponse.json(),
      fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json())
    ]);

    const enhancedData: EnhancedProcessedData = {
      ...data,
      insights: {
        keyTrends: metricsResult.insights?.keyTrends || [],
        areasOfConcern: combineAndPrioritize(
          metricsResult.insights?.areasOfConcern || [],
          programResult.insights?.riskFactors || []
        ),
        recommendations: combineAndPrioritize(
          metricsResult.insights?.recommendations || [],
          programResult.insights?.strategicRecommendations || []
        ),
        achievements: combineAndPrioritize(
          metricsResult.insights?.achievements || [],
          programResult.insights?.successStories || []
        ),
        metrics: {
          engagementScore: calculateEngagementScore(data),
          technicalProgress: calculateTechnicalProgress(data),
          collaborationIndex: calculateCollaborationIndex(data)
        }
      }
    };

    return enhancedData;
  } catch (error) {
    console.error('Error generating enhanced insights:', error);
    // Return with default insights structure
    return {
      ...data,
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
      }
    };
  }
}

// Type guard for insights
export function isValidInsights(insights: any): insights is {
  keyTrends: string[];
  areasOfConcern: string[];
  recommendations: string[];
  achievements: string[];
} {
  return (
    Array.isArray(insights?.keyTrends) &&
    Array.isArray(insights?.areasOfConcern) &&
    Array.isArray(insights?.recommendations) &&
    Array.isArray(insights?.achievements)
  );
}

// Fix the issue metrics processing
function processRawIssueMetrics(entries: EngagementData[]): IssueMetrics[] {
  const currentDate = new Date();
  const weekStr = currentDate.toISOString().split('T')[0];
  
  const metrics = _(entries)
    .flatMap(entry => {
      if (!entry['Issue Title 1']) return [];
      return [{
        week: weekStr,
        open: entry['Issue Link 1']?.includes('closed') ? 0 : 1,
        closed: entry['Issue Link 1']?.includes('closed') ? 1 : 0,
        total: 1
      }];
    })
    .groupBy('week')
    .map((items, week) => ({
      week,
      open: _.sumBy(items, 'open'),
      closed: _.sumBy(items, 'closed'),
      total: items.length
    }))
    .value();

  return metrics;
}

export function formatMetricName(key: string): string {
  return key
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Add helper functions for program health calculations
function calculateNPSScore(data: EngagementData[]): number {
  const scores = data
    .map(entry => parseInt(entry['How likely are you to recommend the PLDG to others?'] || '0'))
    .filter(score => score > 0);

  if (scores.length === 0) return 0;

  const promoters = scores.filter(score => score >= 9).length;
  const detractors = scores.filter(score => score <= 6).length;
  
  return Math.round(((promoters - detractors) / scores.length) * 100);
}

// Add the helper function here too
function parseTechPartners(techPartner: string | string[]): string[] {
  if (Array.isArray(techPartner)) {
    return techPartner;
  }
  return techPartner?.split(',').map(p => p.trim()) ?? [];
}

// Add this function near the other calculation helpers
function calculateAvgEngagement(engagementScores: number[]): number {
  if (!engagementScores.length) return 0;
  return Math.round(engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length);
}

// Add helper function for collaboration score
function calculateCollaborationScore(contributors: number, issues: number): number {
  if (contributors === 0) return 0;
  // Basic score based on average issues per contributor with a cap
  const score = Math.min((issues / contributors) * 20, 100);
  return Math.round(score);
}

// Remove the duplicate calculateEngagementScore function and keep one version
function calculateEngagementScoreFromTrends(data: ProcessedData): number {
  const recentEngagement = data.engagementTrends[data.engagementTrends.length - 1];
  const engagementRate = (recentEngagement['High Engagement'] / recentEngagement.total) * 100;
  return Math.round((engagementRate + data.programHealth.npsScore) / 2);
}

function calculateEngagementScoreFromScores(scores: number[]): number {
  if (!scores.length) return 0;
  
  // Calculate weighted score based on engagement levels
  const weightedSum = scores.reduce((sum, score) => {
    if (score >= 8) return sum + 3; // High engagement
    if (score >= 5) return sum + 2; // Medium engagement
    return sum + 1; // Low engagement
  }, 0);

  // Normalize to 0-100 scale
  return Math.round((weightedSum / (scores.length * 3)) * 100);
}

function processTopPerformers(data: EngagementData[]): TopPerformer[] {
  const contributorData = data.reduce((acc, record) => {
    const name = record['Contributor Name'];
    if (!name) return acc;

    if (!acc[name]) {
      acc[name] = {
        totalIssues: 0,
        engagementScores: [] as number[],
        techPartner: record['Tech Partner'] || 'Unknown',
        issuesCompleted: 0
      };
    }

    const issues = parseInt(record['How many issues, PRs, or projects this week?'] || '0');
    acc[name].totalIssues += issues;
    
    const engagement = parseInt(record['How likely are you to recommend the PLDG to others?'] || '0');
    if (engagement) acc[name].engagementScores.push(engagement);

    return acc;
  }, {} as Record<string, {
    totalIssues: number;
    engagementScores: number[];
    techPartner: string;
    issuesCompleted: number;
  }>);

  return Object.entries(contributorData)
    .map(([name, data]) => ({
      name,
      totalIssues: data.totalIssues,
      avgEngagement: data.engagementScores.length ? 
        data.engagementScores.reduce((a, b) => a + b, 0) / data.engagementScores.length : 0,
      engagementScore: calculateEngagementScoreFromScores(data.engagementScores), // Fixed function call
      issuesCompleted: data.issuesCompleted,
      techPartner: data.techPartner
    }))
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 10);
}
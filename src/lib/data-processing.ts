import { 
  ProcessedData, 
  EngagementData, 
  GitHubData, 
  ActionItem,
  ContributorGrowth,
  TechPartnerPerformance,
  WeeklyMetrics,
  EngagementTrend,
  TechnicalProgress,
  TechPartnerMetrics,
  FeedbackSentiment,
  TopPerformer,
  TechPartnerActivity
} from '@/types/dashboard';
import _ from 'lodash';

// Helper function to parse tech partners consistently
function parseTechPartners(techPartner: string | string[]): string[] {
  if (!techPartner) return [];
  return Array.isArray(techPartner) ? techPartner : [techPartner];
}

function parseWeekNumber(weekStr: string): number {
  const match = weekStr?.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

function formatWeekString(weekStr: string): string {
  return weekStr?.trim() || 'Unknown Week';
}

function calculateWeeklyChange(data: EngagementData[]): number {
  const weeklyData = _.groupBy(data, 'Program Week');
  const weeks = Object.keys(weeklyData).sort((a, b) => parseWeekNumber(b) - parseWeekNumber(a));
  
  if (weeks.length < 2) return 0;
  
  const currentWeek = weeklyData[weeks[0]];
  const previousWeek = weeklyData[weeks[1]];
  
  const currentTotal = currentWeek.reduce((sum, entry) => 
    sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0);
  const previousTotal = previousWeek.reduce((sum, entry) => 
    sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0);
  
  if (previousTotal === 0) return 100;
  return Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
}

function calculateNPSScore(data: EngagementData[]): number {
  if (!data || data.length === 0) return 0;
  
  const scores = data
    .filter(entry => entry['How likely are you to recommend the PLDG to others?'])
    .map(entry => parseInt(entry['How likely are you to recommend the PLDG to others?']));
  
  if (scores.length === 0) return 0;
  
  // For single responses, return the raw score
  if (scores.length === 1) return scores[0];
  
  // For multiple responses, calculate NPS as a percentage
  const promoters = scores.filter(score => score >= 9).length;
  const detractors = scores.filter(score => score <= 6).length;
  const total = scores.length;
  
  return total === 0 ? 0 : Math.round(((promoters - detractors) / total) * 100);
}

function calculateEngagementRate(data: EngagementData[]): number {
  const recentData = _.takeRight(data, 30); // Last 30 entries
  const engagedCount = recentData.filter(entry => 
    entry['Engagement Participation ']?.includes('3 -') || 
    entry['Engagement Participation ']?.includes('2 -')
  ).length;
  
  return Math.round((engagedCount / recentData.length) * 100);
}

function calculatePositiveFeedback(data: EngagementData[]): number {
  const recentData = _.takeRight(data, 30);
  const positiveCount = recentData.filter(entry => 
    parseInt(entry['How satisfied are you with your progress?'] || '0') >= 8
  ).length;
  
  return Math.round((positiveCount / recentData.length) * 100);
}

function processContributorGrowth(data: EngagementData[]): ContributorGrowth[] {
  const weeklyData = _.groupBy(data, 'Program Week');
  const sortedWeeks = Object.keys(weeklyData).sort((a, b) => parseWeekNumber(a) - parseWeekNumber(b));
  
  let cumulativeContributors = new Set<string>();
  
  return sortedWeeks.map(week => {
    const weekEntries = weeklyData[week];
    const activeContributors = new Set(weekEntries.map(entry => entry.Name)).size;
    const totalContributions = weekEntries.reduce((sum, entry) => 
      sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0);
    
    weekEntries.forEach(entry => cumulativeContributors.add(entry.Name));
    const newContributors = weekEntries.filter(entry => 
      !weeklyData[sortedWeeks[sortedWeeks.indexOf(week) - 1]]?.some(e => e.Name === entry.Name)
    ).length;
    
    return {
      week: formatWeekString(week),
      totalContributions,
      activeContributors,
      contributionsPerDev: activeContributors > 0 ? Math.round(totalContributions / activeContributors) : 0,
      newContributors
    };
  });
}

function calculateTechPartnerPerformance(data: EngagementData[]): TechPartnerPerformance[] {
  const partnerMap = new Map<string, TechPartnerPerformance>();

  data.forEach(entry => {
    if (entry['Tech Partner Collaboration?'] === 'Yes' && entry['Which Tech Partner']) {
      const partners = parseTechPartners(entry['Which Tech Partner']);
      partners.forEach(partner => {
        const current = partnerMap.get(partner) || {
          partner,
          issues: 0,
          activeContributors: 0,
          completionRate: 0
        };

        current.issues += parseInt(entry['How many issues, PRs, or projects this week?'] || '0');
        current.activeContributors++;
        partnerMap.set(partner, current);
      });
    }
  });

  return Array.from(partnerMap.values()).map(perf => ({
    ...perf,
    completionRate: perf.issues > 0 ? perf.activeContributors / perf.issues : 0
  }));
}

function processTechPartnerActivity(data: EngagementData[]): TechPartnerActivity[] {
  const weeklyData = _.groupBy(data, 'Program Week');
  return Object.entries(weeklyData).flatMap(([week, entries]) => {
    const partnerData = _.groupBy(entries, 'Which Tech Partner');
    return Object.entries(partnerData).map(([partner, partnerEntries]) => ({
      week: formatWeekString(week),
      partner: partner || 'Unknown',
      issues: partnerEntries.reduce((sum, entry) => 
        sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0),
      contributions: partnerEntries.length,
      collaborations: partnerEntries.filter(entry => 
        entry['Tech Partner Collaboration?'] === 'Yes').length
    }));
  });
}

function calculateProgramHealth(data: EngagementData[]): ProcessedData['programHealth'] {
  return {
    npsScore: calculateNPSScore(data),
    engagementRate: calculateEngagementRate(data),
    satisfactionScore: calculatePositiveFeedback(data),
    activeTechPartners: new Set(data.map(entry => entry['Which Tech Partner']).filter(Boolean)).size
  };
}

function calculateActionItems(data: EngagementData[]): ActionItem[] {
  const actionItems: ActionItem[] = [];
  const recentData = _.takeRight(data, 30);

  // Check engagement levels
  const lowEngagement = recentData.filter(entry => 
    entry['Engagement Participation ']?.includes('1 -')).length;
  
  if (lowEngagement > recentData.length * 0.2) {
    actionItems.push({
      type: 'warning',
      title: 'Low Engagement Alert',
      description: `${lowEngagement} participants showing low engagement levels`,
      action: 'Review engagement strategies and reach out to affected participants'
    });
  }

  // Check satisfaction scores
  const lowSatisfaction = recentData.filter(entry => 
    parseInt(entry['How satisfied are you with your progress?'] || '0') < 6).length;
  
  if (lowSatisfaction > 0) {
    actionItems.push({
      type: 'warning',
      title: 'Satisfaction Concerns',
      description: `${lowSatisfaction} participants reported low satisfaction`,
      action: 'Schedule 1:1 check-ins with affected participants'
    });
  }

  // Check for blocked progress
  const blocked = recentData.filter(entry => {
    const blockingProgress = entry['What is blocking your progress?'];
    return blockingProgress && blockingProgress.length > 0;
  }).length;
  
  if (blocked > 0) {
    actionItems.push({
      type: 'warning',
      title: 'Progress Blockers',
      description: `${blocked} participants reported blockers`,
      action: 'Review reported blockers and coordinate with tech partners'
    });
  }

  return actionItems;
}

function processEngagementTrends(data: EngagementData[]): EngagementTrend[] {
  const weeklyData = _.groupBy(data, 'Program Week');
  return Object.entries(weeklyData).map(([week, entries]) => {
    const total = entries.length;
    const highEngagement = entries.filter(e => e['Engagement Participation ']?.includes('3 -')).length;
    const mediumEngagement = entries.filter(e => e['Engagement Participation ']?.includes('2 -')).length;
    const lowEngagement = entries.filter(e => e['Engagement Participation ']?.includes('1 -')).length;
    
    return {
      week: formatWeekString(week),
      'High Engagement': highEngagement,
      'Medium Engagement': mediumEngagement,
      'Low Engagement': lowEngagement,
      total
    };
  });
}

function processTechnicalProgress(data: EngagementData[]): TechnicalProgress[] {
  const weeklyData = _.groupBy(data, 'Program Week');
  return Object.entries(weeklyData).map(([week, entries]) => ({
    week: formatWeekString(week),
    'Total Issues': entries.reduce((sum, entry) => 
      sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0)
  }));
}

function processTechPartnerMetrics(data: EngagementData[]): TechPartnerMetrics[] {
  const partnerData = _.groupBy(
    data.filter(d => d['Tech Partner Collaboration?'] === 'Yes'),
    'Which Tech Partner'
  );

  return Object.entries(partnerData).map(([partner, entries]) => {
    const totalIssues = entries.reduce((sum, entry) => 
      sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0);
    const activeContributors = new Set(entries.map(e => e.Name)).size;
    const collaborationRate = entries.length / data.length;

    return {
      partner,
      totalIssues,
      activeContributors,
      collaborationRate,
      avgIssuesPerContributor: activeContributors > 0 ? totalIssues / activeContributors : 0,
      collaborationScore: calculateCollaborationScore(entries)
    };
  });
}

function calculateCollaborationScore(entries: EngagementData[]): number {
  const weights = {
    issues: 0.4,
    satisfaction: 0.3,
    engagement: 0.3
  };

  const avgIssues = entries.reduce((sum, e) => 
    sum + parseInt(e['How many issues, PRs, or projects this week?'] || '0'), 0) / entries.length;
  
  const avgSatisfaction = entries.reduce((sum, e) => 
    sum + parseInt(e['How satisfied are you with the collaboration?'] || '0'), 0) / entries.length;
  
  const avgEngagement = entries.reduce((sum, e) => 
    sum + parseInt(e['Engagement Level'] || '0'), 0) / entries.length;

  return (
    (avgIssues / 10) * weights.issues + 
    (avgSatisfaction / 5) * weights.satisfaction + 
    (avgEngagement / 3) * weights.engagement
  ) * 100;
}

function processFeedbackSentiment(data: EngagementData[]): FeedbackSentiment {
  const recentData = _.takeRight(data, 30);
  const total = recentData.length;
  
  return {
    positive: Math.round((recentData.filter(e => parseInt(e['How satisfied are you with your progress?'] || '0') >= 8).length / total) * 100),
    neutral: Math.round((recentData.filter(e => {
      const score = parseInt(e['How satisfied are you with your progress?'] || '0');
      return score >= 6 && score < 8;
    }).length / total) * 100),
    negative: Math.round((recentData.filter(e => parseInt(e['How satisfied are you with your progress?'] || '0') < 6).length / total) * 100)
  };
}

function calculateTopPerformers(data: EngagementData[]): TopPerformer[] {
  const contributorData = _.groupBy(data, 'Name');
  return Object.entries(contributorData)
    .map(([name, entries]) => ({
      name,
      totalIssues: entries.reduce((sum, entry) => 
        sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0),
      avgEngagement: entries.filter(e => 
        e['Engagement Participation ']?.includes('3 -') || 
        e['Engagement Participation ']?.includes('2 -')
      ).length / entries.length * 100
    }))
    .sort((a, b) => b.totalIssues - a.totalIssues)
    .slice(0, 5);
}

function processWeeklyMetrics(data: EngagementData[]): WeeklyMetrics[] {
  // Group data by week
  const weeklyData = _.groupBy(data, 'Program Week');
  
  return Object.entries(weeklyData).map(([week, entries]) => {
    // Process session attendance
    const sessionAttendance = entries.reduce((acc, entry) => {
      if (entry['Engagement Participation ']) {
        acc[entry.Name] = entry['Engagement Participation '] === 'Yes' ? 1 : 0;
      }
      return acc;
    }, {} as { [key: string]: number });

    // Calculate participation levels
    const participationLevels = entries.reduce(
      (acc, entry) => {
        const issueCount = parseInt(entry['How many issues, PRs, or projects this week?'] || '0');
        if (issueCount >= 3) acc.high++;
        else if (issueCount >= 1) acc.medium++;
        else acc.low++;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );

    // Collect issues
    const issues = {
      total: entries.reduce((sum, entry) => {
        return sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0');
      }, 0),
      details: entries.reduce((acc, entry) => {
        if (entry['Issue Title 1'] && entry['Issue Link 1']) {
          acc.push({
            title: entry['Issue Title 1'],
            link: entry['Issue Link 1'],
            description: entry['Issue Description 1'] || ''
          });
        }
        return acc;
      }, [] as Array<{ title: string; link: string; description: string }>)
    };

    // Calculate cumulative metrics
    const cumulative = {
      totalContributions: issues.total,
      byTechPartner: entries.reduce((acc, entry) => {
        const partners = parseTechPartners(entry['Which Tech Partner']);
        partners.forEach(partner => {
          acc[partner] = (acc[partner] || 0) + parseInt(entry['How many issues, PRs, or projects this week?'] || '0');
        });
        return acc;
      }, {} as { [key: string]: number })
    };

    return {
      week,
      sessionAttendance,
      participationLevels,
      issues,
      cumulative
    };
  });
}

export function processData(
  airtableData: EngagementData[],
  githubData: GitHubData
): ProcessedData {
  if (!airtableData?.length) {
    throw new Error('No Airtable data available');
  }

  const programHealth = calculateProgramHealth(airtableData);
  
  return {
    weeklyChange: calculateWeeklyChange(airtableData),
    participationRate: calculateEngagementRate(airtableData),
    activeContributors: new Set(airtableData.map(entry => entry.Name)).size,
    totalContributions: airtableData.reduce((sum, entry) => 
      sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0),
    programHealth,
    npsScore: programHealth.npsScore,
    engagementRate: programHealth.engagementRate,
    satisfactionScore: programHealth.satisfactionScore,
    activeTechPartners: programHealth.activeTechPartners,
    engagementTrends: processEngagementTrends(airtableData),
    technicalProgress: processTechnicalProgress(airtableData),
    techPartnerMetrics: processTechPartnerMetrics(airtableData),
    techPartnerActivity: processTechPartnerActivity(airtableData),
    techPartnerPerformance: calculateTechPartnerPerformance(airtableData),
    contributorGrowth: processContributorGrowth(airtableData),
    feedbackSentiment: processFeedbackSentiment(airtableData),
    actionItems: calculateActionItems(airtableData),
    topPerformers: calculateTopPerformers(airtableData)
  };
}

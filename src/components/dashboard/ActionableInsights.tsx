import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { ProcessedData } from "@/types/dashboard";

interface ActionableInsight {
  type: 'success' | 'warning' | 'opportunity';
  title: string;
  description: string;
  metric?: number;
  action?: string;
}

export function ActionableInsights({ data }: { data: ProcessedData }) {
  const insights: ActionableInsight[] = React.useMemo(() => {
    const insights: ActionableInsight[] = [];
    
    // Engagement Drop Detection
    const recentEngagement = data.engagementTrends.slice(-2);
    if (recentEngagement[1]?.['High Engagement'] < recentEngagement[0]?.['High Engagement']) {
      insights.push({
        type: 'warning',
        title: 'Engagement Drop Detected',
        description: 'High engagement decreased from last week',
        metric: Math.round((recentEngagement[1]['High Engagement'] / recentEngagement[0]['High Engagement'] - 1) * 100),
        action: 'Review recent program changes and gather feedback'
      });
    }

    // Active Contributor Growth
    const contributorGrowth = data.contributorGrowth.slice(-1)[0];
    if (contributorGrowth?.newContributors > 2) {
      insights.push({
        type: 'success',
        title: 'New Contributor Influx',
        description: `${contributorGrowth.newContributors} new contributors this week`,
        action: 'Schedule onboarding sessions and assign mentors'
      });
    }

    // Tech Partner Opportunities
    const inactivePartners = data.techPartnerMetrics.filter(m => m.activeContributors === 0);
    if (inactivePartners.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Partner Engagement Opportunity',
        description: `${inactivePartners.length} tech partners need attention`,
        action: 'Schedule check-ins with inactive partners'
      });
    }

    return insights;
  }, [data]);

  return (
    <Card className="border-2 border-gray-200/20 shadow-md dark:border-gray-800/20">
      <CardHeader>
        <CardTitle>Action Items</CardTitle>
        <CardDescription>Key areas requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                insight.type === 'success' ? 'bg-green-50 border-green-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                {insight.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {insight.type === 'opportunity' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                <div>
                  <h4 className="font-medium mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  {insight.action && (
                    <p className="text-sm font-medium">
                      Recommended Action: {insight.action}
                    </p>
                  )}
                </div>
                {insight.metric && (
                  <span className={`ml-auto font-medium ${
                    insight.metric > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {insight.metric > 0 ? '+' : ''}{insight.metric}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
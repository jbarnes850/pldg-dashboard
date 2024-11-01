'use client';

import * as React from 'react';
import { TechnicalProgress } from '../../types/dashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  data: TechnicalProgress[];
  githubData?: {
    inProgress: number;
    done: number;
  };
}

const GITHUB_LINKS = {
  board: "https://github.com/users/kt-wawro/projects/7/views/1",
  issues: "https://github.com/users/kt-wawro/projects/7/views/1?filterQuery=is%3Aissue"
};

// Add type guard for data validation
const isValidGitHubData = (data: unknown): data is { inProgress: number; done: number } => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'inProgress' in data &&
    'done' in data &&
    typeof data.inProgress === 'number' &&
    typeof data.done === 'number'
  );
};

export default function TechnicalProgressChart({ data, githubData }: Props) {
  const hasData = Array.isArray(data) && data.length > 0;
  
  const chartData = React.useMemo(() => {
    if (!hasData) return [];
    
    return data.map((weekData) => ({
      week: weekData.week,
      'New Issues': weekData.newIssues || 0,
      'In Progress': weekData.inProgress || 0,
      'Completed': weekData.completed || 0
    }));
  }, [data, hasData]);

  // Data flow check
  React.useEffect(() => {
    console.log('TechnicalProgressChart data:', {
      hasData: Array.isArray(data) && data.length > 0,
      hasGithubData: !!githubData,
      chartData: data?.map(weekData => ({
        week: weekData.week,
        newIssues: weekData.newIssues,
        inProgress: weekData.inProgress,
        completed: weekData.completed
      }))
    });
  }, [data, githubData]);

  return (
    <Card className="relative overflow-hidden border-2 border-purple-200/20 bg-gradient-to-br from-purple-50/50 via-white to-white dark:from-purple-950/5 dark:via-purple-900/5 dark:to-gray-900/50 h-[500px] shadow-md">
      <CardHeader className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">Technical Progress</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {hasData ? 'Weekly contribution tracking' : 'No technical data available'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(GITHUB_LINKS.board, '_blank')}
              className="flex items-center gap-1 bg-white/80 hover:bg-white/90 border-purple-100"
            >
              <ExternalLink className="w-4 h-4" />
              Project Board
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(GITHUB_LINKS.issues, '_blank')}
              className="flex items-center gap-1 bg-white/80 hover:bg-white/90 border-purple-100"
            >
              <ExternalLink className="w-4 h-4" />
              Issues
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 h-[400px]">
        {!hasData ? (
          <div className="h-full flex items-center justify-center text-muted-foreground bg-white/50 rounded-lg">
            No technical data to display
          </div>
        ) : (
          <div className="bg-white/50 p-4 rounded-lg h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  stroke="#94a3b8"
                />
                <YAxis 
                  domain={[0, 'auto']}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                  stroke="#94a3b8"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    padding: '12px',
                    border: '1px solid rgba(124, 58, 237, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '20px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="New Issues"
                  stroke="#2196F3"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="In Progress"
                  stroke="#FFA726"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Completed"
                  stroke="#66BB6A"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
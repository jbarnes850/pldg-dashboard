'use client';

import * as React from 'react';
import { TechnicalProgress } from '../../types/dashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  data: TechnicalProgress[];
}

const GITHUB_LINKS = {
  board: "https://github.com/users/kt-wawro/projects/7/views/1",
  issues: "https://github.com/users/kt-wawro/projects/7/views/1?filterQuery=is%3Aissue"
};

export default function TechnicalProgressChart({ data }: Props) {
  const maxIssues = Math.max(...data.map(d => d['Total Issues']));
  const yAxisTicks = Array.from({ length: 5 }, (_, i) => Math.round(maxIssues * i / 4));

  return (
    <Card className="h-[500px]">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Technical Progress</CardTitle>
            <CardDescription>Weekly contribution tracking</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(GITHUB_LINKS.board, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Project Board
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(GITHUB_LINKS.issues, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Issues
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[400px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              domain={[0, maxIssues]} 
              ticks={yAxisTicks}
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '6px',
                padding: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="Total Issues" 
              stroke="#2196F3"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 
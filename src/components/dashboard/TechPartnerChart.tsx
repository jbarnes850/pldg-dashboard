'use client';

import * as React from 'react';
import { TechPartnerPerformance } from '@/types/dashboard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TechPartnerChartProps {
  data: Array<{
    partner: string;
    issues: number;
    activeContributors: number;
    completionRate: number;
  }>;
}

const TechPartnerChart: React.FC<TechPartnerChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tech Partner Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="partner" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="completionRate" name="Completion Rate (%)" fill="#2563eb" />
              <Bar dataKey="issues" name="Issues" fill="#059669" />
              <Bar dataKey="activeContributors" name="Active Contributors" fill="#c026d3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export { TechPartnerChart as default };
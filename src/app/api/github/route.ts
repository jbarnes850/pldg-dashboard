import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

const PROJECT_ID = '7';
const USERNAME = 'kt-wawro';

// column mapping
const COLUMN_STATUS = {
  'In Progress': 'In Progress',
  'In Review': 'In Progress',
  'Done': 'Done',
  'Backlog': 'Todo',
  'Triage': 'Todo'
} as const;

interface ProjectV2Item {
  id: string;
  fieldValues: {
    nodes: Array<{
      field?: {
        name: string;
      };
      name?: string;
      date?: string;
      text?: string;
    }>;
  };
  content: {
    title: string;
    state: string;
    number: number;
    url: string;
    createdAt: string;
    closedAt: string | null;
    labels: {
      nodes: Array<{
        name: string;
        color: string;
      }>;
    };
    assignees: {
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
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

export async function GET() {
  try {
    console.log('GitHub API route called');
    
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GitHub token not found');
    }

    const query = `
      query {
        user(login: "${USERNAME}") {
          projectV2(number: ${PROJECT_ID}) {
            items(first: 100) {
              nodes {
                id
                fieldValues(first: 8) {
                  nodes {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      field {
                        ... on ProjectV2SingleSelectField {
                          name
                        }
                      }
                      name
                    }
                  }
                }
                content {
                  ... on Issue {
                    title
                    state
                    number
                    url
                    createdAt
                    closedAt
                    labels(first: 10) {
                      nodes {
                        name
                        color
                      }
                    }
                    assignees(first: 5) {
                      nodes {
                        login
                        avatarUrl
                      }
                    }
                    milestone {
                      title
                      dueOn
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await octokit.graphql<{
      user: {
        projectV2: {
          items: {
            nodes: ProjectV2Item[];
          };
        };
      };
    }>(query);

    console.log('GitHub API response shape:', {
      hasUser: !!response?.user,
      hasProjectV2: !!response?.user?.projectV2,
      hasItems: !!response?.user?.projectV2?.items,
      hasNodes: !!response?.user?.projectV2?.items?.nodes,
      nodesLength: response?.user?.projectV2?.items?.nodes?.length,
      sampleNode: response?.user?.projectV2?.items?.nodes?.[0] ? {
        ...response.user.projectV2.items.nodes[0],
        id: '[redacted]',
        content: response.user.projectV2.items.nodes[0].content ? {
          ...response.user.projectV2.items.nodes[0].content,
          title: '[redacted]'
        } : null
      } : null
    });

    const items = response?.user?.projectV2?.items?.nodes || [];
    const issues = items
      .filter(item => item?.content)
      .map(item => ({
        id: item.id,
        title: item.content?.title || '',
        state: item.content?.state || '',
        status: getItemStatus(item),
        number: item.content?.number || 0,
        url: item.content?.url || '',
        created_at: item.content?.createdAt || '',
        closed_at: item.content?.closedAt || null,
        labels: item.content?.labels?.nodes || [],
        assignees: item.content?.assignees?.nodes || [],
        milestone: item.content?.milestone || null
      }));

    const statusGroups = {
      todo: issues.filter(issue => issue.status === 'Todo').length,
      inProgress: issues.filter(issue => issue.status === 'In Progress').length,
      done: issues.filter(issue => issue.status === 'Done').length
    };

    const metrics = {
      totalIssues: issues.length,
      openIssues: issues.filter(issue => issue.state === 'OPEN').length,
      recentActivity: issues.filter(issue => {
        const date = new Date(issue.created_at);
        const now = new Date();
        const twoWeeksAgo = new Date(now.setDate(now.getDate() - 14));
        return date >= twoWeeksAgo;
      }).length,
      avgTimeToClose: calculateAvgTimeToClose(issues),
      contributorCount: new Set(issues.flatMap(issue => 
        issue.assignees.map(assignee => assignee.login)
      )).size
    };

    console.log('Processed GitHub data:', {
      totalIssues: issues.length,
      statusGroups,
      metrics,
      sampleIssue: issues[0] ? {
        ...issues[0],
        id: '[redacted]',
        title: '[redacted]'
      } : null
    });

    return NextResponse.json({
      issues,
      statusGroups,
      metrics
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 });
  }
}

function getItemStatus(item: ProjectV2Item): string {
  const statusField = item.fieldValues.nodes.find(node => 
    node.field?.name === 'Status'
  );
  const status = statusField?.name || 'Todo';
  return COLUMN_STATUS[status as keyof typeof COLUMN_STATUS] || 'Todo';
}

function calculateAvgTimeToClose(issues: any[]) {
  const closedIssues = issues.filter(issue => issue.closed_at);
  if (closedIssues.length === 0) return 0;

  const totalTime = closedIssues.reduce((sum, issue) => {
    const created = new Date(issue.created_at);
    const closed = new Date(issue.closed_at!);
    return sum + (closed.getTime() - created.getTime());
  }, 0);

  return Math.round(totalTime / (closedIssues.length * 86400000)); // Convert to days
} 
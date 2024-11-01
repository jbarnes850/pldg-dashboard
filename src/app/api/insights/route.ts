import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Add rate limiting
let lastCallTime = 0;
const RATE_LIMIT_WINDOW = 10000; // 10 seconds

export async function POST(request: Request) {
  try {
    // Check rate limit
    const now = Date.now();
    if (now - lastCallTime < RATE_LIMIT_WINDOW) {
      return NextResponse.json({ 
        error: 'Too many requests',
        success: false 
      }, { 
        status: 429 
      });
    }
    lastCallTime = now;

    // Validate request body exists
    if (!request.body) {
      return NextResponse.json({ 
        error: 'Missing request body',
        success: false 
      }, { 
        status: 400 
      });
    }

    let data;
    try {
      data = await request.json();
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        success: false 
      }, { 
        status: 400 
      });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are analyzing PLDG (Protocol Labs Developer Guild) engagement data. 
        Please provide insights and recommendations based on the following metrics:

        Engagement Trends:
        ${JSON.stringify(data.engagementMetrics.trends, null, 2)}

        Tech Partner Performance:
        ${JSON.stringify(data.techPartnerMetrics, null, 2)}

        Contributor Metrics:
        ${JSON.stringify(data.contributorMetrics, null, 2)}

        GitHub Activity:
        ${JSON.stringify(data.githubMetrics, null, 2)}

        Please structure your analysis into these sections:
        1. Key Trends
        2. Areas of Concern
        3. Specific Recommendations
        4. Notable Achievements
        
        Format the response in markdown.`
      }]
    });

    return NextResponse.json({
      insights: response.content,
      success: true
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json({ 
      error: 'Failed to generate insights',
      success: false 
    }, { 
      status: 500 
    });
  }
} 
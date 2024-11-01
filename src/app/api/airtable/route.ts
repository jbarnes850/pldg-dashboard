import { NextResponse } from 'next/server';
import { default as fetch } from 'node-fetch';

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: {
    'Program Week'?: string;
    'Name'?: string;
    'Engagement Participation '?: string;
    'Tech Partner Collaboration?'?: string;
    'Which Tech Partner'?: string | string[];
    'How many issues, PRs, or projects this week?'?: string;
    'How likely are you to recommend the PLDG to others?'?: string;
    'PLDG Feedback'?: string;
    'Issue Title 1'?: string;
    'Issue Link 1'?: string;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
}

export async function GET() {
  try {
    console.log('Airtable API route called');
    
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      throw new Error('Missing Airtable credentials');
    }

    console.log('Querying Airtable base:', process.env.AIRTABLE_BASE_ID);

    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Weekly%20Engagement%20Survey?view=Weekly%20Breakdown`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Airtable records fetched:', {
      count: data.records?.length,
      fields: data.records?.[0]?.fields ? Object.keys(data.records[0].fields) : []
    });

    return NextResponse.json({ records: data.records });
  } catch (error) {
    console.error('Airtable API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Airtable data', details: error },
      { status: 500 }
    );
  }
} 
import useSWR from 'swr';
import { EngagementData } from '@/types/dashboard';

interface AirtableResponse {
  records: Array<{
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
  }>;
}

export function useAirtableData() {
  const { data, error, mutate } = useSWR<AirtableResponse>(
    '/api/airtable',
    async () => {
      const response = await fetch('/api/airtable');
      if (!response.ok) {
        throw new Error('Failed to fetch Airtable data');
      }
      const data = await response.json();
      if (!data.records) {
        throw new Error('Invalid Airtable response format');
      }
      return data;
    },
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      dedupingInterval: 10000
    }
  );

  // Transform the records to match EngagementData structure
  const transformedData = data?.records?.map(record => {
    const techPartner = record.fields['Which Tech Partner'];
    return {
      'Tech Partner': Array.isArray(techPartner) ? techPartner[0] : techPartner || '',
      'Contributor Name': record.fields['Name'] || '',
      'Which Tech Partner': Array.isArray(techPartner) ? techPartner[0] : techPartner || '',
      'Program Week': record.fields['Program Week'] || '',
      'Engagement Participation ': record.fields['Engagement Participation '] || '',
      'How many issues, PRs, or projects this week?': record.fields['How many issues, PRs, or projects this week?'] || '0',
      'How likely are you to recommend the PLDG to others?': record.fields['How likely are you to recommend the PLDG to others?'] || '0',
      'PLDG Feedback': record.fields['PLDG Feedback'] || '',
      'Issue Title 1': record.fields['Issue Title 1'] || '',
      'Issue Link 1': record.fields['Issue Link 1'] || '',
      'Name': record.fields['Name'] || ''
    };
  }) || [];

  return {
    data: transformedData,
    isLoading: !error && !data,
    isError: !!error,
    mutate
  };
}

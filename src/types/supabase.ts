export interface Database {
  public: {
    Tables: {
      metrics_history: {
        Row: {
          id: number
          timestamp: string
          metric_type: string
          value: any
          week: string
        }
        Insert: {
          id?: number
          timestamp?: string
          metric_type: string
          value: any
          week?: string
        }
        Update: {
          id?: number
          timestamp?: string
          metric_type?: string
          value?: any
          week?: string
        }
      }
      cached_responses: {
        Row: {
          id: number
          endpoint: string
          data: any
          expires_at: string
          cached_at?: string
        }
        Insert: {
          id?: number
          endpoint: string
          data: any
          expires_at: string
          cached_at?: string
        }
        Update: {
          id?: number
          endpoint?: string
          data?: any
          expires_at?: string
          cached_at?: string
        }
      }
      tech_partner_metrics: {
        Row: {
          id: number
          partner_name: string
          timestamp: string
          issues_count: number
          contributors_count: number
          engagement_score: number
        }
        Insert: {
          id?: number
          partner_name: string
          timestamp?: string
          issues_count: number
          contributors_count: number
          engagement_score: number
        }
        Update: {
          id?: number
          partner_name?: string
          timestamp?: string
          issues_count?: number
          contributors_count?: number
          engagement_score?: number
        }
      }
      contributor_metrics: {
        Row: {
          id: number
          contributor_name: string
          timestamp: string
          total_issues: number
          avg_engagement: number
          status: string
        }
        Insert: {
          id?: number
          contributor_name: string
          timestamp?: string
          total_issues: number
          avg_engagement: number
          status: string
        }
        Update: {
          id?: number
          contributor_name?: string
          timestamp?: string
          total_issues?: number
          avg_engagement?: number
          status?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 
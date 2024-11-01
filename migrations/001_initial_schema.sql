-- Core metrics table for all dashboard KPIs
CREATE TABLE metrics_history (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metric_type VARCHAR(50) NOT NULL,
  value JSONB NOT NULL,
  CONSTRAINT valid_metric_type CHECK (
    metric_type IN (
      'engagement_rate',
      'nps_score', 
      'active_tech_partners',
      'completion_rate',
      'weekly_contributions',
      'technical_progress',
      'engagement_trends'
    )
  )
);

-- Tech partner performance tracking
CREATE TABLE tech_partner_metrics (
  id SERIAL PRIMARY KEY,
  partner_name VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  issues_count INTEGER NOT NULL DEFAULT 0,
  contributors_count INTEGER NOT NULL DEFAULT 0,
  engagement_score NUMERIC(5,2),
  CONSTRAINT valid_partner CHECK (
    partner_name IN (
      'IPFS',
      'Libp2p',
      'Fil-B',
      'Fil-Oz',
      'Coordination Network',
      'Storacha',
      'Helia'
    )
  )
);

-- Contributor performance tracking
CREATE TABLE contributor_metrics (
  id SERIAL PRIMARY KEY,
  contributor_name VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  total_issues INTEGER NOT NULL DEFAULT 0,
  avg_engagement NUMERIC(5,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) CHECK (
    status IN ('top_performer', 'high_performer', 'active_contributor')
  )
);

-- Cache table for external API responses
CREATE TABLE cached_responses (
  id SERIAL PRIMARY KEY,
  endpoint VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_metrics_type_timestamp ON metrics_history(metric_type, timestamp);
CREATE INDEX idx_tech_partner_timestamp ON tech_partner_metrics(partner_name, timestamp);
CREATE INDEX idx_contributor_timestamp ON contributor_metrics(contributor_name, timestamp);
CREATE INDEX idx_cached_responses_endpoint ON cached_responses(endpoint); 
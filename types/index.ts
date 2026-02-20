export interface Company {
  id: string;
  name: string;
  website: string;
  description: string;
  stage: string;
  industry: string;
  location: string;
  founded: number;
  employees: string;
  funding?: string;
  tags: string[];
  enriched?: boolean;
  enrichmentData?: EnrichmentData;
}

export interface EnrichmentData {
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  signals: Signal[];
  sources: Source[];
  enrichedAt: string;
}

export interface Signal {
  type: string;
  description: string;
  confidence: "high" | "medium" | "low";
}

export interface Source {
  url: string;
  timestamp: string;
}

export interface List {
  id: string;
  name: string;
  description?: string;
  companyIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: string;
}

export interface SearchFilters {
  stage?: string;
  industry?: string;
  location?: string;
  tags?: string[];
}

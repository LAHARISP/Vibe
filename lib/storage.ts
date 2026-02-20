import { List, SavedSearch, Company, EnrichmentData } from "@/types";

const STORAGE_KEYS = {
  LISTS: "vc_lists",
  SAVED_SEARCHES: "vc_saved_searches",
  COMPANY_NOTES: "vc_company_notes",
  ENRICHMENT_CACHE: "vc_enrichment_cache",
};

export const storage = {
  // Lists
  getLists: (): List[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.LISTS);
    return data ? JSON.parse(data) : [];
  },

  saveLists: (lists: List[]): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
  },

  // Saved Searches
  getSavedSearches: (): SavedSearch[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_SEARCHES);
    return data ? JSON.parse(data) : [];
  },

  saveSavedSearches: (searches: SavedSearch[]): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.SAVED_SEARCHES, JSON.stringify(searches));
  },

  // Company Notes
  getCompanyNotes: (companyId: string): string => {
    if (typeof window === "undefined") return "";
    const notes = localStorage.getItem(`${STORAGE_KEYS.COMPANY_NOTES}_${companyId}`);
    return notes || "";
  },

  saveCompanyNote: (companyId: string, note: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${STORAGE_KEYS.COMPANY_NOTES}_${companyId}`, note);
  },

  // Enrichment Cache
  getEnrichmentCache: (companyId: string): EnrichmentData | null => {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(`${STORAGE_KEYS.ENRICHMENT_CACHE}_${companyId}`);
    return data ? JSON.parse(data) : null;
  },

  saveEnrichmentCache: (companyId: string, data: EnrichmentData): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${STORAGE_KEYS.ENRICHMENT_CACHE}_${companyId}`, JSON.stringify(data));
  },
};

"use client";

import GlobalSearch from "@/components/GlobalSearch";
import Sidebar from "@/components/Sidebar";
import { storage } from "@/lib/storage";
import { SavedSearch } from "@/types";
import { Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SavedSearchesPage() {
  const router = useRouter();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStage, setSearchStage] = useState("");
  const [searchIndustry, setSearchIndustry] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  useEffect(() => {
    setSavedSearches(storage.getSavedSearches());
  }, []);

  const handleSaveSearch = () => {
    if (!searchName.trim()) {
      alert("Please enter a name for this search");
      return;
    }
    if (!searchQuery.trim() && !searchStage && !searchIndustry && !searchLocation) {
      alert("Please enter at least one search criteria");
      return;
    }
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      query: searchQuery,
      filters: {
        stage: searchStage || undefined,
        industry: searchIndustry || undefined,
        location: searchLocation || undefined,
      },
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedSearches, newSearch];
    storage.saveSavedSearches(updated);
    setSavedSearches(updated);
    setSearchName("");
    setSearchQuery("");
    setSearchStage("");
    setSearchIndustry("");
    setSearchLocation("");
    setShowSaveModal(false);
  };

  const handleDeleteSearch = (id: string) => {
    if (confirm("Are you sure you want to delete this saved search?")) {
      const updated = savedSearches.filter((s) => s.id !== id);
      storage.saveSavedSearches(updated);
      setSavedSearches(updated);
    }
  };

  const handleRunSearch = (search: SavedSearch) => {
    const params = new URLSearchParams();
    if (search.query) params.set("search", search.query);
    if (search.filters.stage) params.set("stage", search.filters.stage);
    if (search.filters.industry) params.set("industry", search.filters.industry);
    if (search.filters.location) params.set("location", search.filters.location);
    router.push(`/companies?${params.toString()}`);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6 shadow-sm">
          <GlobalSearch />
        </header>
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Saved Searches</h1>
                <p className="mt-1 text-sm text-gray-500">Quickly re-run your favorite searches</p>
              </div>
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Save Current Search
              </button>
            </div>

            {savedSearches.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-16 text-center shadow-sm">
                <Search className="mx-auto h-16 w-16 text-gray-400" />
                <p className="mt-4 text-lg font-semibold text-gray-700">No saved searches yet</p>
                <p className="mt-2 text-sm text-gray-500">
                  Save your search criteria to quickly re-run them later
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedSearches.map((search) => (
                  <div
                    key={search.id}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 p-2">
                            <Search className="h-5 w-5 text-white" />
                          </div>
                          <h2 className="text-xl font-bold text-gray-900">{search.name}</h2>
                        </div>
                        <div className="ml-11 space-y-2">
                          {search.query && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-500">Query:</span>
                              <span className="rounded-lg bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
                                "{search.query}"
                              </span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {search.filters.stage && (
                              <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                Stage: {search.filters.stage}
                              </span>
                            )}
                            {search.filters.industry && (
                              <span className="rounded-lg bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                                Industry: {search.filters.industry}
                              </span>
                            )}
                            {search.filters.location && (
                              <span className="rounded-lg bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                Location: {search.filters.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 ml-11 text-xs font-medium text-gray-500">
                          Saved {new Date(search.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRunSearch(search)}
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
                        >
                          <Search className="h-4 w-4" />
                          Run Search
                        </button>
                        <button
                          onClick={() => handleDeleteSearch(search.id)}
                          className="rounded-lg border-2 border-red-200 bg-white px-3 py-2.5 text-sm font-semibold text-red-600 transition-all hover:border-red-400 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Save Search</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g., Fintech Series B"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Query</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Keywords..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stage</label>
                <input
                  type="text"
                  value={searchStage}
                  onChange={(e) => setSearchStage(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g., Series B"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={searchIndustry}
                  onChange={(e) => setSearchIndustry(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g., Fintech"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveSearch}
                  className="flex-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setSearchName("");
                    setSearchQuery("");
                    setSearchStage("");
                    setSearchIndustry("");
                    setSearchLocation("");
                  }}
                  className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

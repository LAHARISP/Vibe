"use client";

import GlobalSearch from "@/components/GlobalSearch";
import Sidebar from "@/components/Sidebar";
import { mockCompanies } from "@/lib/mockData";
import { storage } from "@/lib/storage";
import { EnrichmentData } from "@/types";
import { ExternalLink, Loader2, Plus, Sparkles } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const company = mockCompanies.find((c) => c.id === companyId);

  const [note, setNote] = useState("");
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState("");

  useEffect(() => {
    if (!company) return;
    const savedNote = storage.getCompanyNotes(companyId);
    setNote(savedNote);
    const cached = storage.getEnrichmentCache(companyId);
    if (cached) {
      setEnrichmentData(cached);
    }
  }, [companyId, company]);

  if (!company) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Company not found</h1>
            <button
              onClick={() => router.push("/companies")}
              className="mt-4 text-gray-600 hover:text-gray-900"
            >
              Back to companies
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleEnrich = async () => {
    setIsEnriching(true);
    setEnrichError(null);

    try {
      const response = await fetch(`/api/enrich?url=${encodeURIComponent(company.website)}`);
      if (!response.ok) {
        throw new Error("Failed to enrich company data");
      }
      const data: EnrichmentData = await response.json();
      setEnrichmentData(data);
      storage.saveEnrichmentCache(companyId, data);
    } catch (error) {
      setEnrichError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsEnriching(false);
    }
  };

  const handleSaveNote = () => {
    storage.saveCompanyNote(companyId, note);
    alert("Note saved!");
  };

  const handleAddToList = () => {
    if (!selectedListId) {
      alert("Please select a list");
      return;
    }
    const lists = storage.getLists();
    const list = lists.find((l) => l.id === selectedListId);
    if (list) {
      if (!list.companyIds.includes(companyId)) {
        list.companyIds.push(companyId);
        list.updatedAt = new Date().toISOString();
        storage.saveLists(lists);
        alert("Company added to list!");
        setSelectedListId("");
      } else {
        alert("Company already in this list");
      }
    }
  };

  const lists = storage.getLists();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6 shadow-sm">
          <GlobalSearch />
        </header>
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600"
              >
                ← Back
              </button>
              <div className="flex items-start justify-between rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold">{company.name}</h1>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-2 text-indigo-100 transition-colors hover:text-white"
                  >
                    {company.website}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <button
                  onClick={handleEnrich}
                  disabled={isEnriching}
                  className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-600 shadow-md transition-all disabled:opacity-50 hover:bg-indigo-50 hover:shadow-lg"
                >
                  {isEnriching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enriching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Enrich
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Overview */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Overview</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Industry</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{company.industry}</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Stage</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{company.stage}</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Location</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{company.location}</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Founded</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{company.founded}</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Employees</div>
                  <div className="mt-1 text-lg font-bold text-gray-900">{company.employees}</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Funding</div>
                  <div className="mt-1 text-lg font-bold text-green-600">{company.funding || "—"}</div>
                </div>
              </div>
              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Description</div>
                <div className="mt-2 text-gray-900">{company.description}</div>
              </div>
              <div className="mt-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {company.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Enrichment Data */}
            {enrichError && (
              <div className="mb-6 rounded-xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4 text-red-800 shadow-sm">
                <div className="font-semibold">Error:</div>
                <div className="mt-1">{enrichError}</div>
              </div>
            )}

            {enrichmentData && (
              <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 p-2">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Enrichment Data</h2>
                </div>

                <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">Summary</h3>
                  <p className="text-lg leading-relaxed text-gray-900">{enrichmentData.summary}</p>
                </div>

                <div className="mb-6 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-5">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">What They Do</h3>
                  <ul className="space-y-2 text-gray-900">
                    {enrichmentData.whatTheyDo.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-5">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {enrichmentData.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-1.5 text-sm font-semibold text-green-700 shadow-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-700">Derived Signals</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {enrichmentData.signals.map((signal, idx) => (
                      <div
                        key={idx}
                        className="group rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">{signal.type}</span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              signal.confidence === "high"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700"
                                : signal.confidence === "medium"
                                ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700"
                                : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700"
                            }`}
                          >
                            {signal.confidence}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{signal.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4 rounded-lg bg-gray-50 p-5">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-700">Sources</h3>
                  <div className="space-y-3">
                    {enrichmentData.sources.map((source, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 font-medium text-indigo-600 transition-colors hover:text-indigo-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {source.url}
                        </a>
                        <span className="text-xs text-gray-500">
                          {new Date(source.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-indigo-50 p-3 text-center text-xs font-medium text-indigo-700">
                  Enriched at: {new Date(enrichmentData.enrichedAt).toLocaleString()}
                </div>
              </div>
            )}

            {/* Signals Timeline */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Signals Timeline</h2>
              <div className="space-y-4">
                {enrichmentData ? (
                  enrichmentData.signals.map((signal, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-4 w-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md"></div>
                        {idx < enrichmentData.signals.length - 1 && (
                          <div className="h-16 w-0.5 bg-gradient-to-b from-indigo-200 to-purple-200"></div>
                        )}
                      </div>
                      <div className="flex-1 rounded-lg bg-gradient-to-r from-gray-50 to-white p-4 pb-6 shadow-sm">
                        <div className="font-bold text-gray-900">{signal.type}</div>
                        <div className="mt-1 text-sm text-gray-600">{signal.description}</div>
                        <div className="mt-2 text-xs font-medium text-indigo-600">
                          {new Date(enrichmentData.enrichedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg bg-gray-50 p-8 text-center">
                    <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm font-medium text-gray-500">No signals yet</p>
                    <p className="mt-1 text-xs text-gray-400">Click "Enrich" to fetch data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Notes</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add your notes about this company..."
                className="w-full rounded-lg border-2 border-gray-200 p-4 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                rows={6}
              />
              <button
                onClick={handleSaveNote}
                className="mt-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
              >
                Save Note
              </button>
            </div>

            {/* Save to List */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Save to List</h2>
              <div className="flex gap-3">
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-medium transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select a list...</option>
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddToList}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  Add to List
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import GlobalSearch from "@/components/GlobalSearch";
import { mockCompanies } from "@/lib/mockData";
import { Company, SearchFilters } from "@/types";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type SortField = "name" | "stage" | "industry" | "location" | "founded";
type SortDirection = "asc" | "desc";

function CompaniesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState<SearchFilters>({
    stage: searchParams.get("stage") || "",
    industry: searchParams.get("industry") || "",
    location: searchParams.get("location") || "",
  });
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const industries = Array.from(new Set(mockCompanies.map((c) => c.industry))).sort();
  const stages = Array.from(new Set(mockCompanies.map((c) => c.stage))).sort();
  const locations = Array.from(new Set(mockCompanies.map((c) => c.location))).sort();

  const filteredAndSorted = useMemo(() => {
    let filtered = mockCompanies.filter((company) => {
      const matchesSearch =
        !searchQuery ||
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStage = !filters.stage || company.stage === filters.stage;
      const matchesIndustry = !filters.industry || company.industry === filters.industry;
      const matchesLocation = !filters.location || company.location === filters.location;

      return matchesSearch && matchesStage && matchesIndustry && matchesLocation;
    });

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "founded") {
        aVal = a.founded;
        bVal = b.founded;
      }

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return filtered;
  }, [searchQuery, filters, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedCompanies = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const updateFilters = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && typeof v === "string") {
        params.set(k, v);
      }
    });
    router.push(`/companies?${params.toString()}`);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlStage = searchParams.get("stage");
    const urlIndustry = searchParams.get("industry");
    const urlLocation = searchParams.get("location");
    
    if (urlSearch !== null) setSearchQuery(urlSearch);
    setFilters({
      stage: urlStage || "",
      industry: urlIndustry || "",
      location: urlLocation || "",
    });
  }, [searchParams]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6 shadow-sm">
          <GlobalSearch />
        </header>
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
                <p className="mt-1 text-sm text-gray-500">Discover and explore venture-backed companies</p>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-md">
                {filteredAndSorted.length} {filteredAndSorted.length === 1 ? "company" : "companies"}
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-3">
              <select
                value={filters.stage || ""}
                onChange={(e) => updateFilters("stage", e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All Stages</option>
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
              <select
                value={filters.industry || ""}
                onChange={(e) => updateFilters("industry", e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
              <select
                value={filters.location || ""}
                onChange={(e) => updateFilters("location", e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-2 transition-colors hover:text-indigo-600"
                      >
                        Company
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                      <button
                        onClick={() => handleSort("industry")}
                        className="flex items-center gap-2 transition-colors hover:text-indigo-600"
                      >
                        Industry
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                      <button
                        onClick={() => handleSort("stage")}
                        className="flex items-center gap-2 transition-colors hover:text-indigo-600"
                      >
                        Stage
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                      <button
                        onClick={() => handleSort("location")}
                        className="flex items-center gap-2 transition-colors hover:text-indigo-600"
                      >
                        Location
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                      Funding
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {paginatedCompanies.map((company) => (
                    <tr key={company.id} className="transition-colors hover:bg-indigo-50/50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/companies/${company.id}`}
                          className="group block"
                        >
                          <div className="font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                            {company.name}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">{company.description}</div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {company.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="rounded-lg bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                          {company.industry}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                          {company.stage}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {company.location}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {company.funding ? (
                          <span className="font-semibold text-green-600">{company.funding}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
                <div className="text-sm font-medium text-gray-700">
                  Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredAndSorted.length)}</span> of{" "}
                  <span className="font-semibold text-gray-900">{filteredAndSorted.length}</span> companies
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                          currentPage === page
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                            : "border border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6 shadow-sm">
            <GlobalSearch />
          </header>
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-lg font-medium text-gray-900">Loading companies...</div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    }>
      <CompaniesContent />
    </Suspense>
  );
}

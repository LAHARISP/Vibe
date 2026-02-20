"use client";

import GlobalSearch from "@/components/GlobalSearch";
import Sidebar from "@/components/Sidebar";
import { mockCompanies } from "@/lib/mockData";
import { storage } from "@/lib/storage";
import { Company, List } from "@/types";
import { Download, List as ListIcon, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");

  useEffect(() => {
    setLists(storage.getLists());
  }, []);

  const handleCreateList = () => {
    if (!newListName.trim()) {
      alert("Please enter a list name");
      return;
    }
    const newList: List = {
      id: Date.now().toString(),
      name: newListName,
      description: newListDescription,
      companyIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedLists = [...lists, newList];
    storage.saveLists(updatedLists);
    setLists(updatedLists);
    setNewListName("");
    setNewListDescription("");
    setShowCreateModal(false);
  };

  const handleDeleteList = (listId: string) => {
    if (confirm("Are you sure you want to delete this list?")) {
      const updatedLists = lists.filter((l) => l.id !== listId);
      storage.saveLists(updatedLists);
      setLists(updatedLists);
    }
  };

  const handleRemoveCompany = (listId: string, companyId: string) => {
    const updatedLists = lists.map((list) => {
      if (list.id === listId) {
        return {
          ...list,
          companyIds: list.companyIds.filter((id) => id !== companyId),
          updatedAt: new Date().toISOString(),
        };
      }
      return list;
    });
    storage.saveLists(updatedLists);
    setLists(updatedLists);
  };

  const handleExport = (list: List, format: "csv" | "json") => {
    const companies = list.companyIds
      .map((id) => mockCompanies.find((c) => c.id === id))
      .filter((c): c is Company => c !== undefined);

    if (format === "csv") {
      const headers = ["Name", "Website", "Industry", "Stage", "Location", "Funding"];
      const rows = companies.map((c) => [
        c.name,
        c.website,
        c.industry,
        c.stage,
        c.location,
        c.funding || "",
      ]);
      const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${list.name.replace(/\s+/g, "_")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const json = JSON.stringify(companies, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${list.name.replace(/\s+/g, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Lists</h1>
                <p className="mt-1 text-sm text-gray-500">Organize companies into custom lists</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Create List
              </button>
            </div>

            {lists.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-16 text-center shadow-sm">
                <ListIcon className="mx-auto h-16 w-16 text-gray-400" />
                <p className="mt-4 text-lg font-semibold text-gray-700">No lists yet</p>
                <p className="mt-2 text-sm text-gray-500">Create your first list to get started organizing companies</p>
              </div>
            ) : (
              <div className="space-y-6">
                {lists.map((list) => {
                  const companies = list.companyIds
                    .map((id) => mockCompanies.find((c) => c.id === id))
                    .filter((c): c is Company => c !== undefined);

                  return (
                    <div key={list.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 p-2">
                              <ListIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900">{list.name}</h2>
                              {list.description && (
                                <p className="mt-1 text-sm text-gray-600">{list.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4">
                            <span className="rounded-full bg-indigo-100 px-4 py-1 text-sm font-semibold text-indigo-700">
                              {companies.length} {companies.length === 1 ? "company" : "companies"}
                            </span>
                            <span className="text-sm text-gray-500">
                              Created {new Date(list.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleExport(list, "csv")}
                            className="flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-green-400 hover:bg-green-50 hover:text-green-700"
                          >
                            <Download className="h-4 w-4" />
                            CSV
                          </button>
                          <button
                            onClick={() => handleExport(list, "json")}
                            className="flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Download className="h-4 w-4" />
                            JSON
                          </button>
                          <button
                            onClick={() => handleDeleteList(list.id)}
                            className="rounded-lg border-2 border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition-all hover:border-red-400 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {companies.length === 0 ? (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                          <p className="text-sm font-medium text-gray-500">No companies in this list yet</p>
                          <p className="mt-1 text-xs text-gray-400">Add companies from their profile pages</p>
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                          <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                  Company
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                  Industry
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                  Stage
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                  Location
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {companies.map((company) => (
                                <tr key={company.id} className="transition-colors hover:bg-indigo-50/50">
                                  <td className="whitespace-nowrap px-4 py-3">
                                    <Link
                                      href={`/companies/${company.id}`}
                                      className="font-semibold text-gray-900 transition-colors hover:text-indigo-600"
                                    >
                                      {company.name}
                                    </Link>
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3">
                                    <span className="rounded-lg bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                                      {company.industry}
                                    </span>
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3">
                                    <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                      {company.stage}
                                    </span>
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                    {company.location}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                    <button
                                      onClick={() => handleRemoveCompany(list.id, company.id)}
                                      className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-800"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Create New List</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g., Fintech Portfolio"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateList}
                  className="flex-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewListName("");
                    setNewListDescription("");
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

"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/companies?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-600" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search companies, industries, tags..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-gray-400"
        />
      </div>
    </form>
  );
}

"use client";

import { Building2, List, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Lists", href: "/lists", icon: List },
  { name: "Saved Searches", href: "/saved", icon: Search },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center border-b border-gray-200 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white/20 p-1.5">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">VC Intelligence</h1>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 bg-gray-50/50">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30"
                  : "text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm"
              }`}
            >
              <item.icon className={`h-5 w-5 transition-transform ${isActive ? "text-white" : "text-gray-500 group-hover:text-indigo-600"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 p-4 bg-gray-50/50">
        <div className="text-xs text-gray-500">
          <div className="font-medium text-gray-700 mb-1">Powered by AI</div>
          <div>Live enrichment enabled</div>
        </div>
      </div>
    </div>
  );
}

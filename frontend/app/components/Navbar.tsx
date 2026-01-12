"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [isImporting, setIsImporting] = useState(false);

  const pathname = usePathname();

  const isActive = (path: string): boolean => pathname === path;

  const handleImportGmail = async () => {
    try {
      setIsImporting(true);

      const res = await fetch("http://localhost:3001/api/jobs/import-gmail");

      const data = await res.json();
      alert(`✅ ${data.imported} jobs importés`);
    } catch (error) {
      console.error(error);
      alert("❌ Erreur lors de l'import");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <aside className="bg-white shadow-md w-64 h-screen sticky top-0 flex flex-col justify-between px-6 py-6">
      <div>
        <h1 className="text-2xl font-bold text-[#9D4FDD] mb-10">Job Tracker</h1>

        <nav className="flex flex-col gap-2">
          <Link
            href="/"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition
              ${
                isActive("/dashboard")
                  ? "bg-[#9D4FDD]/10 text-[#9D4FDD] font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <i className="fi fi-sr-home"></i>
            Dashboard
          </Link>

          <Link
            href="/jobs"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition
              ${
                isActive("/jobs")
                  ? "bg-[#9D4FDD]/10 text-[#9D4FDD] font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <i className="fi fi-sr-briefcase"></i>
            Mes candidatures
          </Link>

          <Link
            href="/stats"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition
              ${
                isActive("/stats")
                  ? "bg-[#9D4FDD]/10 text-[#9D4FDD] font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <i className="fi fi-sr-chart-pie"></i>
            Statistiques
          </Link>

          <Link
            href="/bulk-import"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition
              ${
                isActive("/bulk-import")
                  ? "bg-[#9D4FDD]/10 text-[#9D4FDD] font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            <i className="fi fi-sr-inbox-in"></i>
            Import manuel
          </Link>
        </nav>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleImportGmail}
          disabled={isImporting}
          className={`flex items-center cursor-pointer justify-center gap-2 py-2 rounded-lg shadow-md transition
            ${
              isImporting
                ? "bg-gray-300 cursor-not-allowed text-gray-600"
                : "bg-linear-to-t from-[#9D4FDD] to-[#C083F1] text-white hover:opacity-90"
            }`}
        >
          {isImporting ? (
            "Import en cours..."
          ) : (
            <>
              <i className="fi fi-br-at"></i>
              Import Gmail
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          © 2026 Job Tracker
        </p>
      </div>
    </aside>
  );
}

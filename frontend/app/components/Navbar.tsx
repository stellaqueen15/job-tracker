"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditJobPage() {
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);

  return (
    <nav className="bg-white shadow-md w-[80%] rounded-full mt-5">
      <div className="mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#9041d0]">Job Tracker</h1>

        <div className="flex gap-2">
          <button
            onClick={() => router.push("/bulk-import")}
            className="bg-[#9041d0] font-bold flex justify-center text-[1.45rem] cursor-pointer w-11 h-11 text-white px-4 py-1 rounded-full hover:bg-[#8037bc] transition"
          >
            &#123;&#125;
          </button>

          <button
            disabled={isImporting}
            onClick={async () => {
              try {
                setIsImporting(true);

                const res = await fetch(
                  "http://localhost:3001/api/jobs/import-gmail"
                );

                const data = await res.json();
                alert(`✅ ${data.imported} jobs importés`);
              } catch (err) {
                console.error(err);
                alert("❌ Erreur lors de l'import");
              } finally {
                setIsImporting(false);
              }
            }}
            className={`flex justify-center text-[1.45rem] cursor-pointer w-11 h-11 text-white px-4 py-2 rounded-full transition
                ${
                  isImporting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#9041d0] hover:bg-[#8037bc]"
                }
              `}
          >
            {isImporting ? (
              "⏳ Import en cours..."
            ) : (
              <i className="fi fi-br-at"></i>
            )}
          </button>

          <button
            onClick={() => router.push("/newJob")}
            className="bg-[#9041d0] flex justify-center text-[1.45rem] cursor-pointer w-11 h-11 text-white px-4 py-2 rounded-full hover:bg-[#8037bc] transition"
          >
            <i className="fi fi-sr-add"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}

"use client";
import { useState } from "react";

export default function BulkImportJobs() {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImport = async () => {
    setError("");
    setSuccess("");

    let parsedData;

    try {
      parsedData = JSON.parse(jsonInput);
    } catch {
      setError("❌ JSON invalide");
      return;
    }

    if (!Array.isArray(parsedData)) {
      setError("❌ Le JSON doit être un tableau d’emplois");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/jobs/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      if (!res.ok) {
        throw new Error("Erreur serveur");
      }

      setSuccess(`✅ ${parsedData.length} emplois importés avec succès`);
      setJsonInput("");
    } catch (err) {
      setError("❌ Impossible d’importer les emplois");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Importer des candidatures (JSON)
      </h1>

      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder="Colle ici ton tableau JSON"
        rows={14}
        className="w-full p-4 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-400"
      />

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">{success}</p>}

      <button
        onClick={handleImport}
        className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Importer
      </button>
    </div>
  );
}

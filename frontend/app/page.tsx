"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Job } from "./types/job";
import Navbar from "./components/Navbar";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  const jobsPerPage = 20;

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  useEffect(() => {
    router.push(`/?page=${currentPage}`, { scroll: false });
  }, [currentPage]);

  useEffect(() => {
    fetch("http://localhost:3001/api/jobs")
      .then((res) => res.json())
      .then((data: Job[]) => setJobs(data));
  }, []);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer ce job ?"
    );
    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:3001/api/jobs/${id}`, {
        method: "DELETE",
      });

      setJobs(jobs.filter((job) => job.id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/editJob/${id}?page=${currentPage}`);
  };

  // Marquer le suivi comme fait / non fait
  const handleFollowUp = async (id: number) => {
    try {
      // On récupère le job dans le state
      const jobToUpdate = jobs.find((job) => job.id === id);
      if (!jobToUpdate) return;

      // Inverse hasFollowedUp
      const updatedJob = {
        ...jobToUpdate,
        hasFollowedUp: jobToUpdate.hasFollowedUp === 1 ? 0 : 1,
      };

      // On update côté API
      await fetch(`http://localhost:3001/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedJob),
      });

      // Puis côté front
      setJobs(jobs.map((job) => (job.id === id ? updatedJob : job)));
    } catch (err) {
      console.error("Erreur lors du suivi :", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <Navbar />
      {isImporting && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg text-indigo-700 font-semibold mb-2">
              📥 Import Gmail en cours
            </p>
            <p className="text-sm text-gray-500">
              Cela peut prendre quelques minutes…
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            Pas encore de job. Ajoute-en un !
          </p>
        ) : (
          <div className="flex flex-col space-y-4">
            {/* Jobs de la page actuelle */}
            {currentJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white shadow-md rounded-2xl p-4 flex flex-col hover:shadow-lg transition-all duration-300 space-y-3"
              >
                {/* Infos principales */}
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {job.position}
                  </h2>
                  <p className="text-indigo-600 font-medium text-sm">
                    {job.company}
                  </p>

                  {/* Badge statut */}
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      job.status === "Postulé"
                        ? "bg-blue-100 text-blue-800"
                        : job.status === "Entretien"
                        ? "bg-purple-100 text-purple-800"
                        : job.status === "Offre"
                        ? "bg-green-100 text-green-800"
                        : job.status === "Refus"
                        ? "bg-red-100 text-red-800"
                        : job.status === "Archivé"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {job.status}
                  </span>

                  {job.appliedDate && (
                    <p className="text-gray-500 text-xs">
                      Appliqué le{" "}
                      {(() => {
                        const [year, month, day] = job.appliedDate.split("-");
                        const date = new Date(
                          Number(year),
                          Number(month) - 1,
                          Number(day)
                        );
                        return date.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        });
                      })()}
                    </p>
                  )}

                  {job.notes && (
                    <p className="text-gray-600 text-xs">{job.notes}</p>
                  )}

                  {job.jobLink && (
                    <a
                      href={job.jobLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-indigo-600 text-sm hover:underline"
                    >
                      Voir offre 🔗
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(job.id)}
                    className="flex cursor-pointer items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium hover:bg-yellow-200 transition"
                  >
                    ✏️ Modifier
                  </button>

                  <button
                    onClick={() => handleDelete(job.id)}
                    className="flex cursor-pointer items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium hover:bg-red-200 transition"
                  >
                    🗑️ Supprimer
                  </button>

                  {job.canFollowUp ? (
                    <button
                      onClick={() => handleFollowUp(job.id)}
                      className={`flex cursor-pointer items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition ${
                        job.hasFollowedUp === 1
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                      }`}
                    >
                      📩{" "}
                      {job.hasFollowedUp === 1 ? "Suivi fait" : "Faire suivi"}
                    </button>
                  ) : (
                    <p>Aucun suivi</p>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="flex justify-center space-x-2 mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded cursor-pointer text-indigo-600 bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Précédent
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1 rounded cursor-pointer ${
                      currentPage === num
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-indigo-600 font-bold hover:bg-gray-300"
                    }`}
                  >
                    {num}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded cursor-pointer text-indigo-600 bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

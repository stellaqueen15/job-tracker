"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Job } from "../types/job";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isImporting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Généré les jobs
  useEffect(() => {
    fetch("http://localhost:3001/api/jobs")
      .then((res) => res.json())
      .then((data: Job[]) => setJobs(data));
  }, []);

  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobs);
  const [statusFilter, setStatusFilter] = useState("all");

  const statuses = ["all", "Postulé", "Entretien", "Offre", "Refus", "Archivé"];

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: jobs.length };
    jobs.forEach((job) => {
      c[job.status] = (c[job.status] || 0) + 1;
    });
    return c;
  }, [jobs]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter((job) => job.status === statusFilter));
    }

    setCurrentPage(1);
  }, [jobs, statusFilter]);

  // Setup de la pagination
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  const jobsPerPage = 20;

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;

  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", currentPage.toString());

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [currentPage]);

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

  const handleSearchResults = (results: Job[]) => {
    setFilteredJobs(results);
    setCurrentPage(1);
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
    <div className="min-h-screen flex">
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

      <main className="mx-auto w-[80%] py-6 space-y-4">
        <SearchBar
          data={jobs}
          placeholder="Rechercher un job..."
          onResults={handleSearchResults}
        />

        <div className="flex justify-between">
          <div className="flex gap-2">
            {statuses.map((status) => (
              <Button
                variant="outline"
                key={status}
                className={`px-3 py-1 rounded ${
                  statusFilter === status ? "text-indigo-400" : "bg-gray-200"
                } cursor-pointer`}
                onClick={() => setStatusFilter(status)}
              >
                {status === "all" ? "Tous" : status} ({counts[status] || 0})
              </Button>
            ))}
          </div>

          <Button variant="outline" className="cursor-pointer">
            <Link href="/newJob" className="flex gap-2">
              <i className="fi fi-sr-add"></i>
              Nouvelle candidature
            </Link>
          </Button>
        </div>

        {jobs.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            Pas encore de job. Ajoute-en un !
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-sm">
            <Table className="min-w-full text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-3 py-2 text-left font-medium">
                    Entreprise / Poste
                  </TableHead>
                  <TableHead className="px-3 py-2 text-left font-medium">
                    Statut
                  </TableHead>
                  <TableHead className="px-3 py-2 text-left font-medium">
                    Date
                  </TableHead>
                  <TableHead className="px-3 py-2 text-left font-medium">
                    Notes
                  </TableHead>
                  <TableHead className="px-3 py-2 text-left font-medium">
                    Lien
                  </TableHead>
                  <TableHead className="px-3 py-2 text-center font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentJobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <TableCell className="px-3 py-2">
                      <p className="font-medium text-sm">{job.company}</p>
                      <p className="text-xs">{job.position}</p>
                    </TableCell>

                    <TableCell className="px-3 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          job.status === "Postulé"
                            ? "bg-blue-900 text-blue-200"
                            : job.status === "Entretien"
                            ? "bg-yellow-900 text-yellow-200"
                            : job.status === "Offre"
                            ? "bg-green-900 text-green-200"
                            : job.status === "Refus"
                            ? "bg-red-900 text-red-200"
                            : "bg-gray-800 text-gray-200"
                        }`}
                      >
                        {job.status}
                      </span>
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-500 text-xs">
                      {job.appliedDate &&
                        new Date(job.appliedDate).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                    </TableCell>

                    <TableCell className="px-3 py-2 text-gray-600 text-xs">
                      {job.notes || "-"}
                    </TableCell>

                    <TableCell className="px-3 py-2">
                      {job.jobLink ? (
                        <a
                          href={job.jobLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 text-xs hover:underline"
                        >
                          Voir offre
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell className="px-3 py-2 flex flex-wrap justify-center gap-1 text-white">
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => handleEdit(job.id)}
                        className="cursor-pointer"
                      >
                        <i className="fi fi-sr-file-edit mt-0.5"></i>
                      </Button>

                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => handleDelete(job.id)}
                        className="cursor-pointer"
                      >
                        <i className="fi fi-sr-trash mt-0.5"></i>
                      </Button>

                      {job.canFollowUp ? (
                        <Button
                          onClick={() => handleFollowUp(job.id)}
                          size="icon-sm"
                          variant="outline"
                          className={`cursor-pointer ${
                            job.hasFollowedUp === 1
                              ? "text-green-500 hover:text-green-600"
                              : "text-white hover:text-gray-200"
                          }`}
                        >
                          <i className="fi fi-sr-newsletter-subscribe"></i>
                        </Button>
                      ) : (
                        ""
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex justify-center space-x-2 mt-3 text-sm flex-wrap">
              {/* Précédent */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition"
              >
                Précédent
              </button>

              {(() => {
                const pages = [];
                const maxPagesToShow = 7;
                let start = Math.max(currentPage - 3, 1);
                const end = Math.min(start + maxPagesToShow - 1, totalPages);
                start = Math.max(end - maxPagesToShow + 1, 1);

                if (start > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      className={`px-3 py-1 roundedtransition ${
                        currentPage === 1
                          ? "bg-white text-black"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      1
                    </button>
                  );
                  if (start > 2)
                    pages.push(<span key="start-ellipsis">…</span>);
                }

                // Pages dynamiques
                for (let i = start; i <= end; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-1 rounded-full cursor-pointer transition ${
                        currentPage === i
                          ? "bg-white text-black"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                if (end < totalPages) {
                  if (end < totalPages - 1)
                    pages.push(<span key="end-ellipsis">…</span>);
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-3 py-1 rounded transition ${
                        currentPage === totalPages
                          ? "bg-white text-black"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pages;
              })()}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition"
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

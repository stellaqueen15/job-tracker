"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Job } from "../../types/job";
import Navbar from "../../components/Navbar";

export default function EditJobPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  const [job, setJob] = useState<Partial<Job>>({
    company: "",
    position: "",
    status: "",
    appliedDate: "",
    notes: "",
    hasFollowedUp: 0,
    canFollowUp: 1,
    followUpDate: "",
    isInteresting: 2,
    jobLink: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/jobs/${id}`);
        const data = await res.json();

        if (data.appliedDate) {
          const d = new Date(data.appliedDate);
          const yyyy = d.getUTCFullYear();
          const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
          const dd = String(d.getUTCDate()).padStart(2, "0");
          data.appliedDate = `${yyyy}-${mm}-${dd}`;
        }

        setJob(data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur fetch job:", err);
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, type } = e.target;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setJob({ ...job, [name]: target.checked ? 1 : 0 });
    } else if (type === "select-one") {
      const target = e.target as HTMLSelectElement;

      // Si c'est le select "isInteresting" => number
      if (name === "isInteresting") {
        setJob({ ...job, [name]: Number(target.value) });
      } else {
        // Sinon on garde la string (ex: status)
        setJob({ ...job, [name]: target.value });
      }
    } else {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      setJob({ ...job, [name]: target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch(`http://localhost:3001/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });

      router.push(`/?page=${page}`);
    } catch (err) {
      console.error("Erreur lors de la modification du job :", err);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen flex">
      <Navbar />
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg mx-auto my-10 rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h1 className="text-3xl font-extrabold text-center text-indigo-600">
          Modifier le job
        </h1>

        {/* Entreprise */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Entreprise</label>
          <input
            type="text"
            name="company"
            placeholder="Ex: Google"
            value={job.company}
            onChange={handleChange}
            className="p-3 text-blue-600 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        {/* Poste */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Nom du poste</label>
          <input
            type="text"
            name="position"
            placeholder="Ex: Développeur Frontend"
            value={job.position}
            onChange={handleChange}
            className="p-3 border text-blue-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        {/* Statut */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Statut</label>
          <select
            name="status"
            value={job.status}
            onChange={handleChange}
            className="p-3 border text-blue-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Choisir un statut</option>
            <option value="Postulé">Candidature envoyée</option>
            <option value="Entretien">Entretien</option>
            <option value="Offre">Offre</option>
            <option value="Refus">Refus</option>
            <option value="Archivé">Archivé</option>
          </select>
        </div>

        {/* Date de candidature */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Date de candidature
          </label>
          <input
            type="date"
            name="appliedDate"
            value={job.appliedDate}
            onChange={handleChange}
            className="p-3 border text-blue-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Follow Up */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="hasFollowedUp"
              checked={job.hasFollowedUp === 1}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-indigo-600"
            />
            <span className="text-gray-700">Suivi effectué</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="canFollowUp"
              checked={job.canFollowUp === 1}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-indigo-600"
            />
            <span className="text-gray-700">Suivi possible</span>
          </label>
        </div>

        {/* Intérêt */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Intérêt pour le poste
          </label>
          <select
            name="isInteresting"
            value={job.isInteresting ?? 2}
            onChange={handleChange}
            className="p-3 border text-blue-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value={1}>1 - Pas trop envie</option>
            <option value={2}>2 - Normal / neutre</option>
            <option value={3}>3 - Super motivée</option>
          </select>
        </div>

        {/* Lien */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Lien de loffre
          </label>
          <input
            type="url"
            name="jobLink"
            placeholder="https://..."
            value={job.jobLink ?? ""}
            onChange={handleChange}
            className="p-3 border text-blue-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            placeholder="Ajouter des notes..."
            value={job.notes ?? ""}
            onChange={handleChange}
            className="p-3 border text-blue-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none h-24"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full cursor-pointer bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Modifier
        </button>
      </form>
    </div>
  );
}

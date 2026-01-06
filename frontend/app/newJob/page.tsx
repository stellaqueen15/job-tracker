"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Job } from "../types/job";

export default function NewJob() {
  const router = useRouter();
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
      await fetch("http://localhost:3001/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });
      router.push("/");
    } catch (err) {
      console.error("Erreur lors de l'ajout du job :", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h1 className="text-3xl font-extrabold text-center text-indigo-600">
          Ajouter un job
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

        {/* État de la candidature */}
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

        {/* Date de la candidature */}
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

        {/* Niveau d'appréciation*/}
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

        {/* Lien de l'offre */}
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
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}

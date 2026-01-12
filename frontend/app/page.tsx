"use client";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex ">
      <Navbar />

      <main className="mx-auto w-[80%] flex-1 p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bienvenue sur Job Tracker</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Suivez vos candidatures et restez organisée !
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Candidatures totales</h2>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              12
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Toutes vos candidatures ajoutées
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">En suivi</h2>
            <p className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">
              3
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Candidatures nécessitant un suivi
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Offres reçues</h2>
            <p className="text-2xl font-bold text-green-500 dark:text-green-400">
              1
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Candidatures acceptées / propositions
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Candidatures récentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                company: "Acme Corp",
                position: "Développeuse Frontend",
                status: "Entretien",
                date: "2026-01-08",
              },
              {
                company: "Globex",
                position: "Développeuse Fullstack",
                status: "Postulé",
                date: "2026-01-09",
              },
              {
                company: "Initech",
                position: "Développeuse Backend",
                status: "Refus",
                date: "2026-01-07",
              },
            ].map((job, i) => (
              <div
                key={i}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{job.position}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {job.company}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">
                    {job.date}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    job.status === "Postulé"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
                      : job.status === "Entretien"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300"
                      : job.status === "Offre"
                      ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300"
                  }`}
                >
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Prochaines actions</h2>
          <div className="space-y-3">
            {[
              {
                text: "Envoyer un email de relance à Acme Corp",
                due: "2026-01-11",
              },
              { text: "Préparer l'entretien pour Globex", due: "2026-01-12" },
              { text: "Vérifier le statut de Initech", due: "2026-01-15" },
            ].map((reminder, i) => (
              <div
                key={i}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md flex justify-between"
              >
                <p className="text-gray-700 dark:text-gray-200">
                  {reminder.text}
                </p>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {reminder.due}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

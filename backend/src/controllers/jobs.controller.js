const JobModel = require("../models/jobs.model");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");

const CREDENTIALS_PATH = path.join(
  __dirname,
  "../credentials/credentials.json"
);
const TOKEN_PATH = path.join(__dirname, "../credentials/token.json");
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

function loadCredentials() {
  const content = fs.readFileSync(CREDENTIALS_PATH, "utf8");
  return JSON.parse(content);
}

async function authorize() {
  const credentials = loadCredentials();
  const { client_secret, client_id, redirect_uris } =
    credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH, "utf8");
    if (token) {
      oAuth2Client.setCredentials(JSON.parse(token));
      return oAuth2Client;
    }
  }

  console.log("🔑 Autorise l’accès ici :");
  console.log(
    oAuth2Client.generateAuthUrl({ access_type: "offline", scope: SCOPES })
  );
  throw new Error(
    "Token manquant. Connecte-toi via le terminal pour générer le token."
  );
}

function extractLink(detail) {
  let body = "";

  if (detail.data.payload.parts) {
    body = detail.data.payload.parts.map((p) => p.body?.data || "").join("");
  } else {
    body = detail.data.payload.body?.data || "";
  }

  body = Buffer.from(body, "base64").toString("utf8");
  const match = body.match(/https?:\/\/[^\s"<>]+/);
  return match ? match[0] : null;
}

const MAX_RESULTS_PER_PAGE = 100;

const BATCH_SIZE = 20;

exports.importJobsFromGmail = async (req, res) => {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

    const MAIL_KEYWORDS = [
      "candidature spontanée",
      "petite candidature, gros potentiel",
      "candidature",
    ];

    // Fonction pour normaliser texte (minuscules + trim + espaces)
    const normalize = (str) => str.toLowerCase().trim().replace(/\s+/g, " ");

    // 1️⃣ Récupérer tous les mails envoyés
    let messages = [];
    let nextPageToken = null;

    do {
      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: MAX_RESULTS_PER_PAGE,
        pageToken: nextPageToken,
        q: "in:sent after:2025/07/28",
      });

      if (response.data.messages) messages.push(...response.data.messages);

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    console.log(`📨 Mails envoyés récupérés : ${messages.length}`);

    // 2️⃣ Récupérer jobs déjà en DB
    const existingJobs = await JobModel.getAll();
    const existingSet = new Set(
      existingJobs.map(
        (job) => `${normalize(job.company)}|||${normalize(job.position)}`
      )
    );

    const jobsToInsert = [];
    const skipped = [];

    // 3️⃣ Fonction pour traiter un batch
    const processBatch = async (batch) => {
      for (const message of batch) {
        try {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
            format: "metadata",
            metadataHeaders: ["Subject", "To"],
          });

          const headers = detail.data.payload.headers || [];
          const subject =
            headers.find((h) => h.name === "Subject")?.value || "";
          const to = headers.find((h) => h.name === "To")?.value || "";

          // Vérifier si le mail correspond à un job
          const subjectLower = subject.toLowerCase();
          const isJobMail = MAIL_KEYWORDS.some((kw) =>
            subjectLower.includes(kw.toLowerCase())
          );
          if (!isJobMail) continue;

          // Clé unique normalisée
          const uniqueKey = `${normalize(to)}|||${normalize(subject)}`;
          if (existingSet.has(uniqueKey)) {
            skipped.push({ company: to, position: subject });
            continue;
          }

          jobsToInsert.push({
            company: to || "Entreprise inconnue",
            position: subject || "Poste inconnu",
            status: "Postulé",
            appliedDate: new Date(
              parseInt(detail.data.internalDate, 10)
            ).toISOString(),
            notes: "",
            hasFollowedUp: 0,
            canFollowUp: 1,
            followUpDate: null,
            isInteresting: 2,
            jobLink: extractLink(detail) || null,
          });

          // Ajouter à l’ensemble pour éviter doublons dans le même import
          existingSet.add(uniqueKey);
        } catch (err) {
          console.error(
            "❌ Erreur lors du traitement du mail :",
            message.id,
            err.message
          );
        }
      }
    };

    // 4️⃣ Traiter par batch
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);
      await processBatch(batch);
      console.log(`✅ Batch ${i / BATCH_SIZE + 1} traité`);
    }

    // 5️⃣ Dédupliquer au cas où
    const dedupedJobs = Array.from(
      new Map(
        jobsToInsert.map((job) => [
          `${normalize(job.company)}|||${normalize(job.position)}`,
          job,
        ])
      ).values()
    );

    // 6️⃣ Insérer dans la DB
    await Promise.all(dedupedJobs.map((job) => JobModel.create(job)));

    res.json({
      success: true,
      imported: dedupedJobs.length,
      skipped: skipped.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await JobModel.getAll();
    res.json(jobs);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getJobById = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const job = await JobModel.getJobById(id);
    if (!job) {
      return res.status(404).json({ error: "Job non trouvé" });
    }
    res.json(job);
  } catch (err) {
    console.error("Erreur getJobById:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.createJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await JobModel.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.createManyJobs = async (req, res) => {
  let jobs = req.body;

  if (!Array.isArray(jobs)) {
    return res.status(400).json({ error: "Le body doit être un tableau" });
  }

  // On s'assure que chaque job a un appliedDate valide et les champs requis
  jobs = jobs.map((job) => ({
    ...job,
    appliedDate:
      job.appliedDate && !isNaN(new Date(job.appliedDate))
        ? new Date(job.appliedDate).toISOString()
        : new Date().toISOString(), // si absent ou invalide, on met la date actuelle
    notes: job.notes || "",
    hasFollowedUp: job.hasFollowedUp ?? 0,
    canFollowUp: job.canFollowUp ?? 1,
    followUpDate: job.followUpDate || null,
    isInteresting: job.isInteresting ?? 0,
    jobLink: job.jobLink || null,
    company: job.company || "Inconnue",
    position: job.position || "Poste inconnu",
    status: job.status || "Postulé",
  }));

  try {
    const insertedJobs = [];
    for (const job of jobs) {
      const result = await JobModel.create(job);
      insertedJobs.push(result);
    }

    res.status(201).json({
      message: "Jobs importés avec succès",
      jobs: insertedJobs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur import jobs" });
  }
};

exports.updateJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await JobModel.update(req.params.id, req.body);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.deleteJob = async (req, res) => {
  try {
    await JobModel.delete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json(err);
  }
};

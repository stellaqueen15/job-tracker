const JobModel = require("../models/jobs.model");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

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

const BATCH_SIZE = 20; // nombre de mails traités en parallèle

exports.importJobsFromGmail = async (req, res) => {
  try {
    const auth = await authorize();
    const gmail = google.gmail({ version: "v1", auth });

    const ATS_KEYWORDS = [
      "greenhouse.io",
      "greenhouse-mail.io",
      "lever.co",
      "hire.lever.co",
      "workablemail.com",
      "applytojob.com",
      "smartrecruiters.com",
      "jobvite.com",
      "breezy.hr",
      "recruitee.com",
      "teamtailor.com",
      "icims.com",
      "icims.eu",
      "rippling.com",
      "trakstar.com",
      "jobadder.com",
      "welcome.hr",
      "hired.com",
      "indeed.com",
      "indeedapply@indeed.com",
      "glassdoor.com",
      "ziprecruiter.com",
      "monster.com",
      "linkedin.com",
      "bamboohr.com",
      "dayforce.com",
    ];
    const EXCLUDED_KEYWORDS = [
      "espresso-jobs",
      "newsletter",
      "alert",
      "no-reply",
      "noreply",
      "support@",
      "info@",
    ];

    let messages = [];
    let nextPageToken = null;

    do {
      const resList = await gmail.users.messages.list({
        userId: "me",
        maxResults: MAX_RESULTS_PER_PAGE,
        pageToken: nextPageToken,
        q: "after:2025/07/28",
      });
      messages.push(...(resList.data.messages || []));
      nextPageToken = resList.data.nextPageToken;
    } while (nextPageToken);

    console.log(`📨 Emails récupérés : ${messages.length}`);

    const existingJobs = await JobModel.getAll();
    const existingSet = new Set(
      existingJobs.map((j) => `${j.company}|||${j.position}`)
    );

    const jobsToInsert = [];
    const skipped = [];

    // 🔹 fonction pour traiter un batch
    const processBatch = async (batch) => {
      for (const msg of batch) {
        try {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: msg.id,
            format: "metadata",
            metadataHeaders: ["From", "Subject"],
          });

          const headers = detail.data.payload.headers || [];
          const subject =
            headers.find((h) => h.name === "Subject")?.value || "";
          const from = headers.find((h) => h.name === "From")?.value || "";

          const subjectLower = subject.toLowerCase();
          const fromLower = from.toLowerCase();

          if (
            EXCLUDED_KEYWORDS.some(
              (k) => subjectLower.includes(k) || fromLower.includes(k)
            )
          )
            continue;

          const isJobMail = ATS_KEYWORDS.some(
            (k) => subjectLower.includes(k) || fromLower.includes(k)
          );
          if (!isJobMail) continue;

          const key = `${from}|||${subject}`;
          if (existingSet.has(key)) {
            skipped.push({ company: from, position: subject });
            continue;
          }

          jobsToInsert.push({
            company: from || "Inconnue",
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

          existingSet.add(key);
        } catch (err) {
          console.error("Erreur mail :", msg.id, err.message);
        }
      }
    };

    // 🔹 traitement par batch
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);
      await processBatch(batch);
      console.log(`✅ Batch ${i / BATCH_SIZE + 1} traité`);
    }

    // 🔹 Insert batch final
    await Promise.all(jobsToInsert.map((job) => JobModel.create(job)));

    res.json({
      success: true,
      imported: jobsToInsert.length,
      skipped: skipped.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
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

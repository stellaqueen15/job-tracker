const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

const CREDENTIALS_PATH =
  process.env.GMAIL_CREDENTIALS_PATH ||
  path.join(__dirname, "./credentials/credentials.json");
const TOKEN_PATH =
  process.env.GMAIL_TOKEN_PATH ||
  path.join(__dirname, "./credentials/token.json");

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

function loadCredentials() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
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

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("🔑 Autorise l’accès ici :");
  console.log(authUrl);

  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) =>
    rl.question("Code Google: ", (code) => {
      rl.close();
      resolve(code);
    })
  );

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log("✅ Token sauvegardé");

  return oAuth2Client;
}

async function listLastEmails() {
  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: 10,
  });

  const messages = res.data.messages || [];

  for (const msg of messages) {
    const detail = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
    });

    const headers = detail.data.payload.headers;

    const subject = headers.find((h) => h.name === "Subject")?.value;
    const from = headers.find((h) => h.name === "From")?.value;

    console.log("📧", subject);
    console.log("👤", from);
    console.log("---");
  }
}

listLastEmails().catch(console.error);

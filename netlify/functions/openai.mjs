import fetch from "node-fetch";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const svc = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString());
  admin.initializeApp({
    credential: admin.credential.cert(svc),
    databaseURL: process.env.FIREBASE_DB_URL
  });
}

export async function handler(event) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };

  let uid = "guest";
  const token = event.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      uid = decoded.uid;
    } catch {}
  }

  const MAX = uid === "guest" ? 10 : 50;
  const key = uid + "-" + new Date().toISOString().slice(0,10);
  process.env[key] = (parseInt(process.env[key] || "0") + 1).toString();
  if (parseInt(process.env[key]) > MAX) return { statusCode: 429, headers, body: "Limit reached" };

  const { prompt } = JSON.parse(event.body || "{}");
  if (!prompt) return { statusCode: 400, headers, body: "Missing prompt" };

  const gpt = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    })
  }).then(r => r.json());

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ content: gpt.choices?.[0]?.message?.content || "" })
  };
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const $ = id => document.getElementById(id);
const output = $("output");

const firebaseConfig = {
  apiKey: "AIzaSyAP35dyrD3OfYyBMXJiR-D_c7S8wEsH_o0",
  authDomain: "p-itranslate.firebaseapp.com",
  projectId: "p-itranslate",
  storageBucket: "p-itranslate.firebasestorage.app",
  messagingSenderId: "754345992605",
  appId: "1:754345992605:web:141d1febc9f12081690f74",
  measurementId: "G-ZY3H1VWR59"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Auth functions
function signUp() {
  createUserWithEmailAndPassword(auth, $("authEmail").value, $("authPass").value)
    .catch(err => alert(err.message));
}

function signIn() {
  signInWithEmailAndPassword(auth, $("authEmail").value, $("authPass").value)
    .catch(err => alert(err.message));
}

function signOut() {
  firebaseSignOut(auth);
}

onAuthStateChanged(auth, async user => {
  $("btnOut").style.display = user ? "inline-block" : "none";
  $("trialMsg").style.display = user ? "none" : "block";
  $("authStatus").textContent = user ? `Logged in: ${user.email}` : "Guest mode";
  if (user) hideLogin();
});

// Modal
function showLogin() {
  $("loginModal").classList.remove("hidden");
}
function hideLogin() {
  $("loginModal").classList.add("hidden");
}

// Voice
function startVoice() {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = $("sourceLang").value === "fa" ? "fa-IR" : "en-US";
  rec.onresult = e => $("inputText").value = e.results[0][0].transcript;
  rec.start();
}

// Translate
async function translate() {
  const txt = $("inputText").value.trim();
  if (!txt) return alert("Please enter some text.");
  const src = $("sourceLang").value;
  const tgt = $("targetLang").value;
  const prompt = src === "auto"
    ? `Detect the input language and translate it to ${tgt}. Return only the translation:\n${txt}`
    : `Translate this from ${src} to ${tgt}. Return only the translation:\n${txt}`;

  const token = auth.currentUser ? await auth.currentUser.getIdToken() : "";
  const res = await fetch("/.netlify/functions/openai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ prompt })
  });
  const data = await res.json();
  output.textContent = data.content || "[No response]";
}

// Wire up
$("btnLogin").onclick = showLogin;
$("btnOut").onclick = signOut;
$("btnClose").onclick = hideLogin;
$("btnSignUp").onclick = signUp;
$("btnSignIn").onclick = signIn;
$("btnTranslate").onclick = translate;
$("btnSpeak").onclick = startVoice;

/* // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAP35dyrD3OfYyBMXJiR-D_c7S8wEsH_o0",
  authDomain: "p-itranslate.firebaseapp.com",
  projectId: "p-itranslate",
  storageBucket: "p-itranslate.firebasestorage.app",
  messagingSenderId: "754345992605",
  appId: "1:754345992605:web:141d1febc9f12081690f74",
  measurementId: "G-ZY3H1VWR59"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
 */
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
const analytics = getAnalytics(app);

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Firebase Auth functions
function signUp(){
  auth.createUserWithEmailAndPassword($("authEmail").value, $("authPass").value)
    .catch(err => alert(err.message));
}
function signIn(){
  auth.signInWithEmailAndPassword($("authEmail").value, $("authPass").value)
    .catch(err => alert(err.message));
}
function signOut(){
  auth.signOut();
}

// Auth state listener
auth.onAuthStateChanged(async user => {
  $("btnOut").style.display = user ? "inline-block" : "none";
  $("trialMsg").style.display = user ? "none" : "block";
  $("authStatus").textContent = user ? `Logged in: ${user.email}` : "Guest mode";
  if (user) hideLogin();
});

// Show/Hide login modal
function showLogin() {
  $("loginModal").classList.remove("hidden");
}
function hideLogin() {
  $("loginModal").classList.add("hidden");
}

// Voice input
function startVoice() {
  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.lang = $("sourceLang").value === "fa" ? "fa-IR" : "en-US";
  rec.onresult = e => $("inputText").value = e.results[0][0].transcript;
  rec.start();
}

// Translation
async function translate() {
  const txt = $("inputText").value.trim();
  if (!txt) return alert("Please enter some text.");
  const src = $("sourceLang").value;
  const tgt = $("targetLang").value;
  const prompt = src === "auto"
    ? `Detect the input language and translate it to ${tgt}. Return only the translation:\n\"\"\"${txt}\"\"\"`
    : `Translate this from ${src} to ${tgt}. Return only the translation:\n\"\"\"${txt}\"\"\"`;

  const token = await auth.currentUser?.getIdToken?.() || "";
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

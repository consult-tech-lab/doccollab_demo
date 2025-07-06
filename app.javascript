// === Firebase Config ===
const firebaseConfig = {
 apiKey: "AIzaSyBncbQrIwPCy2SwnP-nbhkHf4HjGgryg44",
  authDomain: "doccollabdemo.firebaseapp.com",
  projectId: "doccollabdemo",
  storageBucket: "doccollabdemo.firebasestorage.app",
  messagingSenderId: "691447074774",
  appId: "1:691447074774:web:67e7074be4a17b4d389e77"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// === Authentication Logic ===
const loginSection = document.getElementById('login-section');
const qaSection = document.getElementById('qa-section');
const pdfSection = document.getElementById('pdf-section');
const resourcesSection = document.getElementById('resources-section');
const logoutBtn = document.getElementById('logoutBtn');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginError = document.getElementById('loginError');

function showAppSections(show) {
  qaSection.style.display = show ? '' : 'none';
  pdfSection.style.display = show ? '' : 'none';
  resourcesSection.style.display = show ? '' : 'none';
  logoutBtn.style.display = show ? '' : 'none';
  loginSection.style.display = show ? 'none' : '';
}

auth.onAuthStateChanged(user => {
  showAppSections(!!user);
  if (user) {
    loadQAFeed();
  }
});

loginBtn.onclick = () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .catch(err => loginError.textContent = err.message);
};

signupBtn.onclick = () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.createUserWithEmailAndPassword(email, password)
    .catch(err => loginError.textContent = err.message);
};

logoutBtn.onclick = () => auth.signOut();

// === Q&A Section (Google Apps Script) ===
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbw0sihr3dA4TxkcPLcDeWe29Z8gxfSWLqBTdBrAzS-3j1eqIa38VBqXU-mARtIgLEcpbg/exec";

async function loadQAFeed() {
  const res = await fetch(SHEET_API_URL);
  const data = await res.json();
  const feed = document.getElementById('qaFeed');
  feed.innerHTML = '';
  data.reverse().forEach((item, idx) => {
    const li = document.createElement('li');
    li.textContent = `${item[0]}: ${item[1]} - ${item[2]}`;
    // Optional: add delete button for own entries
    feed.appendChild(li);
  });
}

document.getElementById('submitQuestionBtn').onclick = async function() {
  const question = document.getElementById('questionInput').value;
  const user = auth.currentUser ? auth.currentUser.email : "Anonymous";
  await fetch(SHEET_API_URL, {
    method: 'POST',
    body: JSON.stringify({ user, question, answer: '' }),
    headers: { 'Content-Type': 'application/json' }
  });
  document.getElementById('questionInput').value = '';
  loadQAFeed();
};

// === PDF Upload & AI Summarization ===
document.getElementById('summarizeBtn').onclick = async function() {
  const fileInput = document.getElementById('pdfInput');
  const file = fileInput.files[0];
  if (!file) {
    alert('Please upload a PDF first.');
    return;
  }
  // For demo: just send file name, real use would extract text
  const reader = new FileReader();
  reader.onload = async function(ev) {
    // In production, use pdf.js to extract text from PDF
    const fakeText = "This is a placeholder for extracted PDF text.";
    const res = await fetch('/api/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: "Summarize this medical document: " + fakeText })
    });
    const data = await res.json();
    document.getElementById('summaryOutput').textContent = data.choices ? data.choices[0].message.content : "No summary.";
  };
  reader.readAsArrayBuffer(file);
};

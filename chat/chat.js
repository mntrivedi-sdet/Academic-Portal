/*
  IMPORTANT:
  Replace API_URL below with your deployed Google Apps Script Web App URL.
*/
const API_URL = "https://script.google.com/macros/s/AKfycbwHptZmhfpPbOnru32wbHslRKia0VqA5sCeTtVVA1TaQd6qAW2SWMgUbKrvCSa4G6wE/exec";

const setup = document.getElementById("studentSetup");
const conversationArea = document.getElementById("conversationArea");
const messagesBox = document.getElementById("messages");
const setupMessage = document.getElementById("setupMessage");
const chatMessage = document.getElementById("chatMessage");

let student = JSON.parse(localStorage.getItem("academicChatStudent") || "null");
let conversationId = localStorage.getItem("academicChatConversationId") || "";

function showError(target, text) {
  target.textContent = text;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[ch]));
}

function formatDate(value) {
  const d = new Date(value);
  return isNaN(d) ? "" : d.toLocaleString();
}

async function api(action, payload = {}) {
  if (API_URL.includes("PASTE_YOUR")) {
    throw new Error("Connect the Google Apps Script Web App URL in chat.js first.");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload })
  });

  const data = await response.json();
  if (!data.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function renderMessages(items) {
  if (!items || !items.length) {
    messagesBox.innerHTML = '<div class="empty-state">No messages yet. Send your first question below.</div>';
    return;
  }

  messagesBox.innerHTML = items.map(item => {
    const role = item.sender === "Professor" ? "professor" : "student";
    return `
      <div class="bubble ${role}">
        ${escapeHtml(item.message)}
        <div class="meta">${escapeHtml(item.sender)} · ${escapeHtml(formatDate(item.timestamp))}</div>
      </div>
    `;
  }).join("");

  messagesBox.scrollTop = messagesBox.scrollHeight;
}

async function loadConversation() {
  if (!conversationId || !student) return;

  try {
    const data = await api("getMessages", {
      conversationId,
      email: student.email
    });

    renderMessages(data.messages);
  } catch (err) {
    showError(chatMessage, err.message);
  }
}

function openChat() {
  setup.classList.add("hidden");
  conversationArea.classList.remove("hidden");

  document.getElementById("studentLabel").textContent = student.name;
  document.getElementById("subjectLabel").textContent = student.subject;

  loadConversation();
}

document.getElementById("startBtn").addEventListener("click", async () => {
  const name = document.getElementById("studentName").value.trim();
  const email = document.getElementById("studentEmail").value.trim();
  const subject = document.getElementById("subject").value;

  if (!name || !email) {
    showError(setupMessage, "Please enter your name and email.");
    return;
  }

  try {
    const data = await api("createConversation", { name, email, subject });

    student = { name, email, subject };
    conversationId = data.conversationId;

    localStorage.setItem("academicChatStudent", JSON.stringify(student));
    localStorage.setItem("academicChatConversationId", conversationId);

    openChat();
  } catch (err) {
    showError(setupMessage, err.message);
  }
});

document.getElementById("messageForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const input = document.getElementById("messageInput");
  const message = input.value.trim();

  if (!message) return;

  try {
    await api("sendMessage", {
      conversationId,
      email: student.email,
      sender: "Student",
      message
    });

    input.value = "";
    chatMessage.textContent = "Message sent.";
    await loadConversation();
  } catch (err) {
    showError(chatMessage, err.message);
  }
});

document.getElementById("newChatBtn").addEventListener("click", () => {
  localStorage.removeItem("academicChatConversationId");
  conversationId = "";
  conversationArea.classList.add("hidden");
  setup.classList.remove("hidden");
  chatMessage.textContent = "";
});

if (student && conversationId) {
  openChat();
}

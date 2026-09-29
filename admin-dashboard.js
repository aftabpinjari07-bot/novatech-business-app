const SUPABASE_URL = "https://kiyasgbtlrgwfkgzsbcb.supabase.co";
const SUPABASE_KEY = "sb_publishable_wsuu9lZHnmC-vKs4TiIVMQ_yrGoqVE0";

const accessToken = localStorage.getItem(
  "novatech_admin_access_token"
);

const tableBody = document.getElementById("messages-table-body");
const messageCount = document.getElementById("message-count");
const logoutBtn = document.getElementById("logout-btn");


// Check login
if (!accessToken) {
  window.location.href = "admin.html";
}


// Load messages
async function loadMessages() {

  tableBody.innerHTML = `
    <tr>
      <td colspan="5" class="empty-message">
        Loading messages...
      </td>
    </tr>
  `;

  try {

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.desc`,
      {
        method: "GET",

        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${accessToken}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        data.error_description ||
        "Failed to load messages"
      );
    }

    renderMessages(data);

  } catch (error) {

    console.error("DASHBOARD ERROR:", error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-message">
          ${error.message}
        </td>
      </tr>
    `;

  }
}


// Render messages
function renderMessages(messages) {

  messageCount.textContent =
    `${messages.length} message${messages.length === 1 ? "" : "s"}`;

  if (messages.length === 0) {

    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-message">
          No messages yet.
        </td>
      </tr>
    `;

    return;
  }


  tableBody.innerHTML = messages.map(function (message) {

    const date = message.created_at
      ? new Date(message.created_at).toLocaleString()
      : "-";

    return `
      <tr>
        <td>${escapeHtml(message.name || "-")}</td>
        <td>${escapeHtml(message.email || "-")}</td>
        <td>${escapeHtml(message.phone || "-")}</td>
        <td>${escapeHtml(message.message || "-")}</td>
        <td>${date}</td>
      </tr>
    `;

  }).join("");
}


// Basic HTML escaping
function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// Logout
logoutBtn.addEventListener("click", function () {

  localStorage.removeItem(
    "novatech_admin_access_token"
  );

  localStorage.removeItem(
    "novatech_admin_refresh_token"
  );

  window.location.href = "admin.html";

});


// Load dashboard
loadMessages();
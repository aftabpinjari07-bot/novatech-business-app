const SUPABASE_URL = "https://kiyasgbtlrgwfkgzsbcb.supabase.co";
const SUPABASE_KEY = "sb_publishable_wsuu9lZHnmC-vKs4TiIVMQ_yrGoqVE0";

const loginForm = document.getElementById("admin-login-form");
const loginMessage = document.getElementById("login-message");
const passwordInput = document.getElementById("admin-password");
const passwordToggle = document.getElementById("password-toggle");
const loginMascot = document.getElementById("login-mascot");

passwordToggle.addEventListener("click", function () {
  const isPasswordVisible = passwordInput.type === "password";
  passwordInput.type = isPasswordVisible ? "text" : "password";
  passwordToggle.setAttribute("aria-pressed", String(isPasswordVisible));
  passwordToggle.setAttribute(
    "aria-label",
    isPasswordVisible ? "Hide password" : "Show password"
  );
  loginMascot.classList.toggle("is-looking-away", isPasswordVisible);
});

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("admin-email").value.trim();
  const password = document.getElementById("admin-password").value;

  loginMessage.textContent = "Logging in...";

  try {
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY
        },

        body: JSON.stringify({
          email: email,
          password: password
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data.error_description ||
        data.msg ||
        data.message ||
        "Login failed";

      throw new Error(
        `Supabase authentication failed (${response.status}): ${errorMessage}`
      );
    }

    // Save login tokens
    localStorage.setItem(
      "novatech_admin_access_token",
      data.access_token
    );

    localStorage.setItem(
      "novatech_admin_refresh_token",
      data.refresh_token
    );

    // Login successful
   loginMessage.textContent = "Login successful!";

console.log("Admin logged in:", data.user);

setTimeout(function () {
  window.location.href = "admin-dashboard.html";
}, 500);
  } catch (error) {

    console.error("LOGIN ERROR:", error);

    loginMessage.textContent =
      error.message || "Login failed. Check browser console.";
  }
});
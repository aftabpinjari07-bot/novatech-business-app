/*
  NovaTech interactions

  This script adds browser behaviors without changing
  the page design or existing HTML structure.
*/

// ============================================================
// Supabase configuration
// ============================================================

const SUPABASE_URL = "https://kiyasgbtlrgwfkgzsbcb.supabase.co";

const SUPABASE_KEY = "sb_publishable_wsuu9lZHnmC-vKs4TiIVMQ_yrGoqVE0";

const SUPABASE_MESSAGES_URL =
  SUPABASE_URL + "/rest/v1/messages";

const LOCAL_STORAGE_KEY = "novatech_messages";


// ============================================================
// Smooth scrolling for in-page navigation links
// ============================================================

const pageLinks = document.querySelectorAll('a[href^="#"]');

pageLinks.forEach(function (link) {

  const targetSelector = link.getAttribute("href");

  if (!targetSelector || targetSelector === "#") {

    link.addEventListener("click", function (event) {

      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    });

    return;
  }

  const targetElement = document.querySelector(targetSelector);

  if (!targetElement) {
    return;
  }

  link.addEventListener("click", function (event) {

    event.preventDefault();

    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  });

});


// ============================================================
// CTA buttons
// ============================================================

const ctaButtons = document.querySelectorAll(".btn");

ctaButtons.forEach(function (button) {

  button.addEventListener("click", function (event) {

    const href = button.getAttribute("href");

    if (href === "#") {

      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }

    button.setAttribute("aria-pressed", "true");

    window.setTimeout(function () {

      button.setAttribute("aria-pressed", "false");

    }, 200);

  });

});


// ============================================================
// Contact form
// ============================================================

const contactForm = document.querySelector("form");

if (contactForm) {

  const nameField = contactForm.querySelector("#full-name");
  const emailField = contactForm.querySelector("#email");
  const phoneField = contactForm.querySelector("#phone");
  const messageField = contactForm.querySelector("#message");

  const requiredFields = contactForm.querySelectorAll(
    "input[required], textarea[required]"
  );


  // ==========================================================
  // Show field error
  // ==========================================================

  function setFieldError(field, message) {

    field.setAttribute("aria-invalid", "true");

    field.classList.add("invalid");

    const parentGroup =
      field.closest(".input-group") || field.parentNode;

    const existingError =
      parentGroup.querySelector(".form-error");

    if (existingError) {

      existingError.textContent = message;

      return;
    }

    const errorMessage =
      document.createElement("small");

    errorMessage.className = "form-error";

    errorMessage.textContent = message;

    parentGroup.appendChild(errorMessage);

  }


  // ==========================================================
  // Clear field error
  // ==========================================================

  function clearFieldError(field) {

    field.removeAttribute("aria-invalid");

    field.classList.remove("invalid");

    const parentGroup =
      field.closest(".input-group") || field.parentNode;

    const existingError =
      parentGroup.querySelector(".form-error");

    if (existingError) {

      existingError.remove();

    }

  }


  // ==========================================================
  // Validate individual field
  // ==========================================================

  function validateField(field) {

    const value = field.value.trim();

    if (value === "") {

      setFieldError(
        field,
        "This field is required."
      );

      return false;
    }


    // Email validation

    if (field === emailField) {

      const isValidEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (!isValidEmail) {

        setFieldError(
          field,
          "Please enter a valid email address."
        );

        return false;
      }

    }


    clearFieldError(field);

    return true;

  }


  // ==========================================================
  // Validate fields while typing / leaving
  // ==========================================================

  requiredFields.forEach(function (field) {

    field.addEventListener("blur", function () {

      validateField(field);

    });


    field.addEventListener("input", function () {

      if (
        field.getAttribute("aria-invalid") === "true"
      ) {

        validateField(field);

      }

    });

  });


  // ==========================================================
  // Get locally saved messages
  // ==========================================================

  function getSavedMessages() {

    try {

      return JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEY)
      ) || [];

    } catch (error) {

      return [];

    }

  }


  // ==========================================================
  // Save locally
  // ==========================================================

  function saveMessages(messages) {

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(messages)
    );

  }


  // ==========================================================
  // Send one message to Supabase
  // ==========================================================

  async function sendToSupabase(formData) {

    const response = await fetch(
      SUPABASE_MESSAGES_URL,
      {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          "apikey": SUPABASE_KEY,

          "Authorization":
            "Bearer " + SUPABASE_KEY,

          "Prefer": "return=minimal"

        },

        body: JSON.stringify({

          name: formData.name,

          email: formData.email,

          phone: formData.phone,

          message: formData.message

        })

      }
    );


    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(errorText);

    }

  }


  // ==========================================================
  // Sync pending messages
  // ==========================================================

  async function syncPendingMessages() {

    if (!navigator.onLine) {

      return;

    }


    const savedMessages =
      getSavedMessages();

    if (savedMessages.length === 0) {

      return;

    }


    const remainingMessages = [];


    for (const formData of savedMessages) {

      try {

        await sendToSupabase(formData);

        console.log(
          "NovaTech: message synced successfully."
        );

      } catch (error) {

        console.error(
          "NovaTech: message sync failed.",
          error
        );

        remainingMessages.push(formData);

      }

    }


    saveMessages(remainingMessages);

  }


  // ==========================================================
  // Automatic sync when internet returns
  // ==========================================================

  window.addEventListener(
    "online",
    function () {

      syncPendingMessages();

    }
  );


  // ==========================================================
  // Try syncing existing messages on page load
  // ==========================================================

  syncPendingMessages();


  // ==========================================================
  // Form submit
  // ==========================================================

  contactForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      let isValid = true;


      // ------------------------------------------------------
      // Validate all required fields
      // ------------------------------------------------------

      requiredFields.forEach(function (field) {

        if (!validateField(field)) {

          isValid = false;

        }

      });


      if (!isValid) {

        return;

      }


      // ------------------------------------------------------
      // Collect form data
      // ------------------------------------------------------

      const formData = {

        name:
          nameField
            ? nameField.value.trim()
            : "",

        email:
          emailField
            ? emailField.value.trim()
            : "",

        phone:
          phoneField
            ? phoneField.value.trim()
            : "",

        message:
          messageField
            ? messageField.value.trim()
            : "",

        savedAt:
          new Date().toISOString()

      };


      // ------------------------------------------------------
      // Save locally FIRST
      // ------------------------------------------------------

      const savedMessages =
        getSavedMessages();

      savedMessages.push(formData);

      saveMessages(savedMessages);


      // ------------------------------------------------------
      // Clear form
      // ------------------------------------------------------

      contactForm.reset();


      // ------------------------------------------------------
      // Remove previous success message
      // ------------------------------------------------------

      const existingSuccess =
        contactForm.querySelector(".form-success");

      if (existingSuccess) {

        existingSuccess.remove();

      }


      // ------------------------------------------------------
      // Show initial message
      // ------------------------------------------------------

      const successMessage =
        document.createElement("p");

      successMessage.className =
        "form-success";


      if (navigator.onLine) {

        successMessage.textContent =
          "Message saved. Sending to server...";

      } else {

        successMessage.textContent =
          "Message saved. It will be sent when internet is available.";

      }


      contactForm.appendChild(
        successMessage
      );


      // ------------------------------------------------------
      // Try immediate sync
      // ------------------------------------------------------

      await syncPendingMessages();


      // ------------------------------------------------------
      // Update message after sync attempt
      // ------------------------------------------------------

      const remainingMessages =
        getSavedMessages();

      if (remainingMessages.length === 0) {

        successMessage.textContent =
          "Message sent successfully.";

      } else {

        successMessage.textContent =
          "Message saved. It will be sent when internet is available.";

      }

    }
  );

}
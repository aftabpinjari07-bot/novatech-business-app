/*
  NovaTech interactions

  This script adds browser behaviors without changing
  the page design or existing HTML structure.
*/

// ============================================================
// Smooth scrolling for in-page navigation links
// ============================================================

const pageLinks = document.querySelectorAll('a[href^="#"]');

pageLinks.forEach(function (link) {
  const targetSelector = link.getAttribute('href');

  if (!targetSelector || targetSelector === '#') {
    link.addEventListener('click', function (event) {
      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    return;
  }

  const targetElement = document.querySelector(targetSelector);

  if (!targetElement) {
    return;
  }

  link.addEventListener('click', function (event) {
    event.preventDefault();

    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
});


// ============================================================
// CTA buttons
// ============================================================

const ctaButtons = document.querySelectorAll('.btn');

ctaButtons.forEach(function (button) {
  button.addEventListener('click', function (event) {
    const href = button.getAttribute('href');

    // Keep "#" buttons at the top of the page.
    if (href === '#') {
      event.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // Lightweight pressed state.
    button.setAttribute('aria-pressed', 'true');

    window.setTimeout(function () {
      button.setAttribute('aria-pressed', 'false');
    }, 200);
  });
});


// ============================================================
// Contact form validation + local storage
// ============================================================

const contactForm = document.querySelector('form');

if (contactForm) {

  const nameField = contactForm.querySelector('#full-name');
  const emailField = contactForm.querySelector('#email');
  const phoneField = contactForm.querySelector('#phone');
  const messageField = contactForm.querySelector('#message');

  const requiredFields = contactForm.querySelectorAll(
    'input[required], textarea[required]'
  );


  // ----------------------------------------------------------
  // Show field error
  // ----------------------------------------------------------

  function setFieldError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    field.classList.add('invalid');

    const parentGroup = field.closest('.input-group') || field.parentNode;

    const existingError = parentGroup.querySelector('.form-error');

    if (existingError) {
      existingError.textContent = message;
      return;
    }

    const errorMessage = document.createElement('small');

    errorMessage.className = 'form-error';
    errorMessage.textContent = message;

    parentGroup.appendChild(errorMessage);
  }


  // ----------------------------------------------------------
  // Clear field error
  // ----------------------------------------------------------

  function clearFieldError(field) {
    field.removeAttribute('aria-invalid');
    field.classList.remove('invalid');

    const parentGroup = field.closest('.input-group') || field.parentNode;

    const existingError = parentGroup.querySelector('.form-error');

    if (existingError) {
      existingError.remove();
    }
  }


  // ----------------------------------------------------------
  // Validate individual field
  // ----------------------------------------------------------

  function validateField(field) {

    const value = field.value.trim();

    // Empty field
    if (value === '') {
      setFieldError(field, 'This field is required.');
      return false;
    }


    // Email validation
    if (field === emailField) {

      const isValidEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (!isValidEmail) {
        setFieldError(
          field,
          'Please enter a valid email address.'
        );

        return false;
      }
    }


    clearFieldError(field);

    return true;
  }


  // ----------------------------------------------------------
  // Validate fields while typing / leaving field
  // ----------------------------------------------------------

  requiredFields.forEach(function (field) {

    field.addEventListener('blur', function () {
      validateField(field);
    });


    field.addEventListener('input', function () {

      if (field.getAttribute('aria-invalid') === 'true') {
        validateField(field);
      }

    });

  });


  // ==========================================================
  // Form submit
  // ==========================================================

  contactForm.addEventListener('submit', function (event) {

    event.preventDefault();

    let isValid = true;


    // Validate all required fields
    requiredFields.forEach(function (field) {

      if (!validateField(field)) {
        isValid = false;
      }

    });


    // Stop here if validation failed
    if (!isValid) {
      return;
    }


    // --------------------------------------------------------
    // Collect form data
    // --------------------------------------------------------

    const formData = {
      name: nameField ? nameField.value.trim() : '',
      email: emailField ? emailField.value.trim() : '',
      phone: phoneField ? phoneField.value.trim() : '',
      message: messageField ? messageField.value.trim() : '',
      savedAt: new Date().toISOString()
    };


    // --------------------------------------------------------
    // Get previously saved messages
    // --------------------------------------------------------

    let savedMessages = [];

    try {
      savedMessages =
        JSON.parse(
          localStorage.getItem('novatech_messages')
        ) || [];
    } catch (error) {
      savedMessages = [];
    }


    // --------------------------------------------------------
    // Add new message
    // --------------------------------------------------------

    savedMessages.push(formData);


    // --------------------------------------------------------
    // Save messages locally
    // --------------------------------------------------------

    localStorage.setItem(
      'novatech_messages',
      JSON.stringify(savedMessages)
    );


    // --------------------------------------------------------
    // Clear form
    // --------------------------------------------------------

    contactForm.reset();


    // Remove previous success message
    const existingSuccess =
      contactForm.querySelector('.form-success');

    if (existingSuccess) {
      existingSuccess.remove();
    }


    // --------------------------------------------------------
    // Show success message
    // --------------------------------------------------------

    const successMessage =
      document.createElement('p');

    successMessage.className = 'form-success';

    successMessage.textContent =
      'Message saved successfully on this device.';

    contactForm.appendChild(successMessage);

  });

}
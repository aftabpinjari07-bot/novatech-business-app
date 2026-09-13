/*
  NovaTech interactions
  This script adds a few small browser behaviors without changing
  the page design or the existing HTML structure.
*/

// Smooth scrolling for in-page navigation links.
const pageLinks = document.querySelectorAll('a[href^="#"]');

pageLinks.forEach(function (link) {
  const targetSelector = link.getAttribute('href');

  if (!targetSelector || targetSelector === '#') {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return;
  }

  const targetElement = document.querySelector(targetSelector);

  if (!targetElement) {
    return;
  }

  link.addEventListener('click', function (event) {
    event.preventDefault();
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// CTA buttons: add a simple interaction without changing the design.
const ctaButtons = document.querySelectorAll('.btn');

ctaButtons.forEach(function (button) {
  button.addEventListener('click', function (event) {
    const href = button.getAttribute('href');

    // If the button points to the top of the page, keep it safe and smooth.
    if (href === '#') {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Toggle a lightweight pressed state for a very simple click interaction.
    button.setAttribute('aria-pressed', 'true');
    window.setTimeout(function () {
      button.setAttribute('aria-pressed', 'false');
    }, 200);
  });
});

// Contact form validation for the NovaTech contact form.
const contactForm = document.querySelector('#contact-form');

if (contactForm) {
  const nameField = contactForm.querySelector('#full-name');
  const emailField = contactForm.querySelector('#email');
  const messageField = contactForm.querySelector('#message');
  const requiredFields = [nameField, emailField, messageField].filter(Boolean);

  function setFieldError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('data-error', message);

    const parentGroup = field.closest('.input-group');
    const existingError = parentGroup ? parentGroup.querySelector('.form-error') : null;

    if (existingError) {
      existingError.textContent = message;
      return;
    }

    if (parentGroup) {
      const errorMessage = document.createElement('small');
      errorMessage.className = 'form-error';
      errorMessage.textContent = message;
      parentGroup.appendChild(errorMessage);
    }
  }

  function clearFieldError(field) {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('data-error');

    const parentGroup = field.closest('.input-group');
    const existingError = parentGroup ? parentGroup.querySelector('.form-error') : null;

    if (existingError) {
      existingError.remove();
    }
  }

  function validateField(field) {
    const value = field.value.trim();

    if (field === emailField) {
      if (value === '') {
        setFieldError(field, 'Email is required.');
        return false;
      }

      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (!isValidEmail) {
        setFieldError(field, 'Please enter a valid email address.');
        return false;
      }

      clearFieldError(field);
      return true;
    }

    if (value === '') {
      setFieldError(field, 'This field is required.');
      return false;
    }

    clearFieldError(field);
    return true;
  }

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

  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    let isValid = true;

    requiredFields.forEach(function (field) {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    if (isValid) {
      requiredFields.forEach(function (field) {
        clearFieldError(field);
      });

      contactForm.reset();
      const successMessage = document.createElement('p');
      successMessage.className = 'form-success';
      successMessage.textContent = 'Thanks! Your message has been received.';
      const existingSuccess = contactForm.querySelector('.form-success');

      if (existingSuccess) {
        existingSuccess.remove();
      }

      contactForm.appendChild(successMessage);
    }
  });
}

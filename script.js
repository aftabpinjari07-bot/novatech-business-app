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

// Basic contact form validation for any existing form.
const contactForm = document.querySelector('form');

if (contactForm) {
  const requiredFields = contactForm.querySelectorAll('input[required], textarea[required]');

  function setFieldError(field, message) {
    field.setAttribute('aria-invalid', 'true');
    field.classList.add('invalid');

    const existingError = field.parentNode.querySelector('.form-error');

    if (existingError) {
      existingError.textContent = message;
      return;
    }

    const errorMessage = document.createElement('small');
    errorMessage.className = 'form-error';
    errorMessage.textContent = message;
    field.parentNode.appendChild(errorMessage);
  }

  function clearFieldError(field) {
    field.removeAttribute('aria-invalid');
    field.classList.remove('invalid');

    const existingError = field.parentNode.querySelector('.form-error');

    if (existingError) {
      existingError.remove();
    }
  }

  requiredFields.forEach(function (field) {
    field.addEventListener('blur', function () {
      if (field.value.trim() === '') {
        setFieldError(field, 'This field is required.');
      } else {
        clearFieldError(field);
      }
    });
  });

  contactForm.addEventListener('submit', function (event) {
    let isValid = true;

    requiredFields.forEach(function (field) {
      if (field.value.trim() === '') {
        setFieldError(field, 'This field is required.');
        isValid = false;
      }
    });

    if (!isValid) {
      event.preventDefault();
    }
  });
}

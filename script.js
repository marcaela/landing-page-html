// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

// Load saved form data
const STORAGE_KEY = 'landing-form-data';
function loadFormData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      Object.keys(data).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = data[key];
      });
    }
  } catch (e) {}
}
function saveFormData() {
  try {
    const data = {};
    ['name', 'email', 'message'].forEach(key => {
      const el = document.getElementById(key);
      if (el) data[key] = el.value;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

// Debounce function to limit rate of function calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Create debounced version of saveFormData (300ms delay)
const debouncedSaveFormData = debounce(saveFormData, 300);

loadFormData();

// Back to top button functionality
const backToTopButton = document.getElementById('backToTop');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

window.addEventListener('scroll', () => {
  backToTopButton.classList.toggle('visible', window.scrollY > 300);
});

backToTopButton.addEventListener('click', (e) => {
  e.preventDefault();
  if (prefersReducedMotion) {
    window.scrollTo(0, 0);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

// Contact form validation
const form = document.getElementById('contactForm');
const fields = {
  name: {
    el: document.getElementById('name'),
    error: document.getElementById('nameError'),
    validate: v => v.length >= 2 ? '' : 'Name must be at least 2 characters'
  },
  email: {
    el: document.getElementById('email'),
    error: document.getElementById('emailError'),
    validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email'
  },
  message: {
    el: document.getElementById('message'),
    error: document.getElementById('messageError'),
    validate: v => v.length >= 10 ? '' : 'Message must be at least 10 characters'
  }
};

function validateField(name) {
  const field = fields[name];
  const value = field.el.value.trim();
  const err = field.validate(value);
  field.error.textContent = err;
  field.el.setAttribute('aria-invalid', !!err);
  field.el.style.borderColor = err ? '#e74c3c' : value ? '#27ae60' : '';
  return !err;
}

Object.keys(fields).forEach(name => {
  const input = fields[name].el;
  input.addEventListener('blur', () => validateField(name));
  input.addEventListener('input', () => {
    if (fields[name].error.textContent) validateField(name);
    debouncedSaveFormData();
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const allValid = Object.keys(fields).every(name => validateField(name));
  if (allValid) {
    const successMessage = document.getElementById('formSuccess');
    successMessage.textContent = 'Thank you! Your message has been sent.';
    successMessage.style.display = 'block';
    successMessage.focus();
    
    // Allow dismissing with Escape key or click
    const dismissSuccess = () => {
      successMessage.removeEventListener('click', dismissSuccess);
      successMessage.removeEventListener('keydown', dismissSuccess);
      form.reset();
      localStorage.removeItem(STORAGE_KEY);
      Object.values(fields).forEach(f => { f.el.style.borderColor = ''; });
      successMessage.style.display = 'none';
      form.querySelector('button[type="submit"]').focus();
    };
    
    successMessage.addEventListener('click', dismissSuccess);
    successMessage.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dismissSuccess();
      }
    });
    
    // Auto-dismiss after 2 seconds if not dismissed earlier
    setTimeout(() => {
      if (successMessage.style.display === 'block') {
        dismissSuccess();
      }
    }, 2000);
  }
});
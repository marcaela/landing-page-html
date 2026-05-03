// Configuration constants
const CONFIG = {
  SCROLL_THRESHOLD: 300,          // Pixels scrolled before showing back-to-top button
  THROTTLE_WAIT: 100,             // ms between scroll handler invocations
  DEBOUNCE_WAIT: 300,             // ms to wait before saving form data
  STORAGE_KEY: 'landing-form-data',// localStorage key for form persistence
  fields: ['name', 'email', 'message'],
  SUCCESS_AUTODISMISS_MS: 2000    // Time before success message auto-dismisses
};

// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

// Load saved form data
function loadFormData() {
  try {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      CONFIG.fields.forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = data[key];
      });
    }
  } catch (e) {}
}
function saveFormData() {
  try {
    const data = {};
    CONFIG.fields.forEach(key => {
      const el = document.getElementById(key);
      if (el) data[key] = el.value;
    });
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
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

// Throttle function to ensure at most one call per wait period
function throttle(func, wait) {
  let pending = false;
  return function(...args) {
    if (!pending) {
      pending = true;
      func(...args);
      setTimeout(() => pending = false, wait);
    }
  };
}

// Create debounced version of saveFormData
const debouncedSaveFormData = debounce(saveFormData, CONFIG.DEBOUNCE_WAIT);

loadFormData();

// Back to top button functionality
const backToTopButton = document.getElementById('backToTop');
const scrollProgress = document.getElementById('scrollProgress');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateScrollProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = `${progress}%`;
}

window.addEventListener('scroll', throttle(() => {
  if (!prefersReducedMotion) {
    updateScrollProgress();
  }
  backToTopButton.classList.toggle('visible', window.scrollY > CONFIG.SCROLL_THRESHOLD);
}, CONFIG.THROTTLE_WAIT));

// Initialize progress on load
updateScrollProgress();

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
      localStorage.removeItem(CONFIG.STORAGE_KEY);
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
    
    // Auto-dismiss after CONFIG.SUCCESS_AUTODISMISS_MS if not dismissed earlier
    setTimeout(() => {
      if (successMessage.style.display === 'block') {
        dismissSuccess();
      }
    }, CONFIG.SUCCESS_AUTODISMISS_MS);
  }
});
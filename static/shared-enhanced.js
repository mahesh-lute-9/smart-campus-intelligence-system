/**
 * Enhanced Shared Utilities
 * Loading states, form error handling, API calls with spinners
 */

// ============================================================================
// 1. LOADING STATE MANAGEMENT
// ============================================================================

class LoadingManager {
  constructor() {
    this.activeLoaders = new Set();
  }
  
  /**
   * Show loading state on a button
   * @param {HTMLElement|string} element - Button element or selector
   * @param {string} loadingText - Text to show while loading
   */
  setButtonLoading(element, loadingText = 'Loading...') {
    const btn = typeof element === 'string' ? document.querySelector(element) : element;
    if (!btn) return;
    
    btn.dataset.originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner spinner-sm"></span> ${loadingText}`;
    this.activeLoaders.add(btn);
  }
  
  /**
   * Reset button to original state
   * @param {HTMLElement|string} element - Button element or selector
   */
  clearButtonLoading(element) {
    const btn = typeof element === 'string' ? document.querySelector(element) : element;
    if (!btn) return;
    
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || btn.textContent;
    this.activeLoaders.delete(btn);
  }
  
  /**
   * Show/hide page-level loader
   * @param {boolean} show - True to show, false to hide
   */
  togglePageLoader(show = true) {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    
    if (show) {
      loader.style.display = 'flex';
    } else {
      loader.style.display = 'none';
    }
  }
  
  /**
   * Clear all active loaders
   */
  clearAll() {
    this.activeLoaders.forEach(btn => this.clearButtonLoading(btn));
    this.activeLoaders.clear();
    this.togglePageLoader(false);
  }
}

const loadingManager = new LoadingManager();

// ============================================================================
// 2. FORM ERROR HANDLING
// ============================================================================

class FormErrorHandler {
  /**
   * Display validation errors on a form
   * @param {HTMLElement|string} formElement - Form element or selector
   * @param {Array<string>|Object} errors - Array of error messages or object with field errors
   */
  static displayErrors(formElement, errors) {
    const form = typeof formElement === 'string' ? document.querySelector(formElement) : formElement;
    if (!form) return;
    
    // Clear previous errors
    this.clearErrors(form);
    
    // Handle array of errors
    if (Array.isArray(errors)) {
      const alertContainer = document.createElement('div');
      alertContainer.className = 'alert alert-danger mb-3';
      alertContainer.setAttribute('role', 'alert');
      
      const errorList = document.createElement('ul');
      errorList.style.margin = '0.5rem 0 0 1.5rem';
      
      errors.forEach(err => {
        const li = document.createElement('li');
        li.textContent = err;
        errorList.appendChild(li);
      });
      
      alertContainer.innerHTML = `<strong>${errors.length} error${errors.length > 1 ? 's' : ''}:</strong>`;
      alertContainer.appendChild(errorList);
      
      form.insertBefore(alertContainer, form.firstChild);
      alertContainer.classList.add('form-error-alert');
    }
    // Handle object of field-specific errors
    else if (typeof errors === 'object') {
      Object.keys(errors).forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;
        
        // Add error styling
        field.classList.add('is-invalid');
        field.setAttribute('aria-invalid', 'true');
        
        // Create error message element
        const errorMsg = document.createElement('small');
        errorMsg.className = 'text-danger d-block mt-1';
        errorMsg.setAttribute('id', `${fieldName}-error`);
        errorMsg.setAttribute('role', 'alert');
        errorMsg.textContent = errors[fieldName];
        
        field.parentElement.appendChild(errorMsg);
        field.setAttribute('aria-describedby', `${fieldName}-error`);
      });
    }
  }
  
  /**
   * Clear all errors from a form
   * @param {HTMLElement|string} formElement - Form element or selector
   */
  static clearErrors(formElement) {
    const form = typeof formElement === 'string' ? document.querySelector(formElement) : formElement;
    if (!form) return;
    
    // Remove alert
    const alert = form.querySelector('.form-error-alert');
    if (alert) alert.remove();
    
    // Remove field errors
    form.querySelectorAll('[aria-invalid="true"]').forEach(field => {
      field.classList.remove('is-invalid');
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    });
    
    form.querySelectorAll('[role="alert"]').forEach(el => el.remove());
  }
  
  /**
   * Mark a specific field as invalid
   * @param {HTMLElement|string} fieldElement - Input element or selector
   * @param {string} message - Error message
   */
  static setFieldError(fieldElement, message) {
    const field = typeof fieldElement === 'string' ? document.querySelector(fieldElement) : fieldElement;
    if (!field) return;
    
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
    
    const errorMsg = document.createElement('small');
    errorMsg.className = 'text-danger d-block mt-1';
    errorMsg.setAttribute('role', 'alert');
    errorMsg.textContent = message;
    
    // Remove existing error if present
    const existing = field.parentElement.querySelector('[role="alert"]');
    if (existing) existing.remove();
    
    field.parentElement.appendChild(errorMsg);
  }
  
  /**
   * Clear errors for a specific field
   * @param {HTMLElement|string} fieldElement - Input element or selector
   */
  static clearFieldError(fieldElement) {
    const field = typeof fieldElement === 'string' ? document.querySelector(fieldElement) : fieldElement;
    if (!field) return;
    
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');
    
    const errorMsg = field.parentElement.querySelector('[role="alert"]');
    if (errorMsg) errorMsg.remove();
  }
}

// ============================================================================
// 3. ENHANCED API CALLS WITH LOADING STATES
// ============================================================================

class ApiClient {
  static DEFAULT_OPTIONS = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
  };
  
  /**
   * Make an API call with automatic loading state management
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options + custom options
   * @param {HTMLElement|string} loadingElement - Element to show loading state on
   * @returns {Promise<Object>} Parsed response
   */
  static async call(endpoint, options = {}, loadingElement = null) {
    const {
      showPageLoader = false,
      loadingText = 'Loading...',
      ...fetchOptions
    } = options;
    
    // Merge with defaults
    const finalOptions = {
      ...this.DEFAULT_OPTIONS,
      ...fetchOptions,
      headers: {
        ...this.DEFAULT_OPTIONS.headers,
        ...fetchOptions.headers,
      },
    };
    
    try {
      // Show loading state
      if (loadingElement) {
        loadingManager.setButtonLoading(loadingElement, loadingText);
      }
      if (showPageLoader) {
        loadingManager.togglePageLoader(true);
      }
      
      // Make request
      const response = await fetch(endpoint, finalOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check for API-level errors
      if (data.success === false) {
        throw new Error(data.error || data.message || 'Unknown error');
      }
      
      return data;
    }
    catch (error) {
      console.error('API Error:', error);
      throw error;
    }
    finally {
      // Clear loading state
      if (loadingElement) {
        loadingManager.clearButtonLoading(loadingElement);
      }
      if (showPageLoader) {
        loadingManager.togglePageLoader(false);
      }
    }
  }
  
  /**
   * GET request helper
   */
  static get(endpoint, options = {}, loadingElement = null) {
    return this.call(endpoint, { ...options, method: 'GET' }, loadingElement);
  }
  
  /**
   * POST request helper
   */
  static post(endpoint, data = {}, options = {}, loadingElement = null) {
    return this.call(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }, loadingElement);
  }
  
  /**
   * PATCH request helper
   */
  static patch(endpoint, data = {}, options = {}, loadingElement = null) {
    return this.call(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }, loadingElement);
  }
  
  /**
   * DELETE request helper
   */
  static delete(endpoint, options = {}, loadingElement = null) {
    return this.call(endpoint, { ...options, method: 'DELETE' }, loadingElement);
  }
}

// ============================================================================
// 4. FORM SUBMISSION HANDLER
// ============================================================================

class FormSubmitter {
  /**
   * Handle form submission with validation and loading state
   * @param {HTMLElement|string} formElement - Form element or selector
   * @param {Function} onSubmit - Callback that returns Promise
   * @param {Object} options - Configuration options
   */
  static async handleSubmit(formElement, onSubmit, options = {}) {
    const {
      showPageLoader = false,
      clearFormOnSuccess = false,
      successMessage = 'Success!',
      successCallback = null,
    } = options;
    
    const form = typeof formElement === 'string' ? document.querySelector(formElement) : formElement;
    if (!form) return;
    
    const submitBtn = form.querySelector('button[type="submit"]');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Clear previous errors
      FormErrorHandler.clearErrors(form);
      
      try {
        // Show loading state
        if (submitBtn) {
          loadingManager.setButtonLoading(submitBtn, 'Submitting...');
        }
        if (showPageLoader) {
          loadingManager.togglePageLoader(true);
        }
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Call submit callback
        const response = await onSubmit(data);
        
        // Show success message
        if (successMessage) {
          const alert = document.createElement('div');
          alert.className = 'alert alert-success mb-3';
          alert.textContent = successMessage;
          form.insertBefore(alert, form.firstChild);
          
          setTimeout(() => alert.remove(), 3000);
        }
        
        // Clear form if requested
        if (clearFormOnSuccess) {
          form.reset();
        }
        
        // Call success callback
        if (successCallback) {
          successCallback(response);
        }
      }
      catch (error) {
        console.error('Form submission error:', error);
        
        // Handle error response with field-level errors
        if (error.response && error.response.errors) {
          FormErrorHandler.displayErrors(form, error.response.errors);
        } else {
          FormErrorHandler.displayErrors(form, [error.message || 'An error occurred']);
        }
      }
      finally {
        // Clear loading state
        if (submitBtn) {
          loadingManager.clearButtonLoading(submitBtn);
        }
        if (showPageLoader) {
          loadingManager.togglePageLoader(false);
        }
      }
    });
  }
}

// ============================================================================
// 5. AUTO CLEAR FORM ERRORS ON INPUT
// ============================================================================

function setupFormAutoErrorClear(formElement) {
  const form = typeof formElement === 'string' ? document.querySelector(formElement) : formElement;
  if (!form) return;
  
  form.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('change', () => {
      if (field.classList.contains('is-invalid')) {
        FormErrorHandler.clearFieldError(field);
      }
    });
  });
}

// ============================================================================
// 6. TOAST NOTIFICATIONS
// ============================================================================

class Toast {
  static show(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container') || this.createContainer();
    
    const toast = document.createElement('div');
    toast.className = `alert alert-${type}`;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      max-width: 400px;
      z-index: 1100;
      animation: slideInUp 0.3s ease-in-out;
    `;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    
    container.appendChild(toast);
    
    if (duration) {
      setTimeout(() => {
        toast.style.animation = 'slideOutDown 0.3s ease-in-out';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  }
  
  static success(message, duration = 3000) {
    this.show(message, 'success', duration);
  }
  
  static error(message, duration = 3000) {
    this.show(message, 'danger', duration);
  }
  
  static warning(message, duration = 3000) {
    this.show(message, 'warning', duration);
  }
  
  static info(message, duration = 3000) {
    this.show(message, 'info', duration);
  }
  
  static createContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
  }
}

// ============================================================================
// 7. KEYBOARD SHORTCUTS
// ============================================================================

class KeyboardShortcuts {
  static init() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+K or Cmd+K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const search = document.getElementById('search') || document.querySelector('[data-shortcut-search]');
        if (search) search.focus();
      }
      
      // Esc: Close modals
      if (e.key === 'Escape') {
        const modal = document.querySelector('.modal.active');
        if (modal) {
          modal.classList.remove('active');
        }
      }
    });
  }
}

// ============================================================================
// 8. INITIALIZE ON DOM READY
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  KeyboardShortcuts.init();
  
  // Auto-setup all forms for error clearing
  document.querySelectorAll('form').forEach(form => {
    setupFormAutoErrorClear(form);
  });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadingManager, FormErrorHandler, ApiClient, FormSubmitter, Toast, KeyboardShortcuts };
}

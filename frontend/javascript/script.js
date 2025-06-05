// script.js - Combined JavaScript functionality

// Add base styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    body { 
        transition: opacity 0.4s ease;
        background-color: var(--bg-color);
        color: var(--text-color);
    }
    .theme-transitioning, .theme-transitioning * {
        transition: background-color 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s !important;
    }
    .error-message {
        background-color: #fee2e2;
        border: 1px solid #ef4444;
        color: #b91c1c;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
    }
    .success-message {
        background-color: #dcfce7;
        border: 1px solid #22c55e;
        color: #15803d;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
    }
    .dark-mode {
        --bg-color: #1a202c;
        --text-color: #f7fafc;
    }
    .light-mode {
        --bg-color: #ffffff;
        --text-color: #1a202c;
    }
`;
document.head.appendChild(styleSheet);

// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    if (!themeToggle || !themeIcon) {
        console.warn('Theme elements not found');
        return;
    }

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(`${savedTheme}-mode`);
    updateThemeIcon(savedTheme === 'dark');

    // Handle theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.add('theme-transitioning');
        const isDarkMode = document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode', !isDarkMode);
        
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        updateThemeIcon(isDarkMode);

        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);
    });
}

function updateThemeIcon(isDarkMode) {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return;

    if (isDarkMode) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// Mobile Menu Management
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (!mobileMenuBtn || !navLinks) return;

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.setAttribute('aria-expanded', navLinks.classList.contains('active'));
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.mobile-menu-btn') && 
            !event.target.closest('.nav-links') && 
            navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Form Validation and Authentication
function initializeForm() {
    const form = document.querySelector('form');
    if (!form) return;

    const isRegistrationForm = form.closest('.registration-container');
    const isLoginForm = form.closest('.login-container');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = validateForm(form);
        if (!formData.isValid) return;

        if (isRegistrationForm) {
            await handleRegistration(form, formData.data);
        } else if (isLoginForm) {
            await handleLogin(form, formData.data);
        }
    });
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    const formData = {};

    inputs.forEach(input => {
        const value = input.value.trim();
        if (!value) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
            if (input.type === 'email') {
                formData.email = value;
                if (!validateEmail(value)) {
                    isValid = false;
                    input.classList.add('error');
                }
            } else if (input.type === 'password') {
                if (input.placeholder === 'Password') {
                    formData.password = value;
                } else if (input.placeholder === 'Confirm password') {
                    formData.confirm_password = value;
                }
            } else if (input.placeholder === 'Full name') {
                formData.fullName = value;
            }
        }
    });

    if (formData.password && formData.password.length < 8) {
        isValid = false;
        showError('Password must be at least 8 characters long');
    }

    if (formData.password && formData.confirm_password && formData.password !== formData.confirm_password) {
        isValid = false;
        showError('Passwords do not match');
    }

    return { isValid, data: formData };
}

async function handleRegistration(form, formData) {
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showError(data.error || 'Registration failed');
            return;
        }

        showSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);

    } catch (error) {
        console.error('Registration error:', error);
        showError('An error occurred during registration');
    }
}

async function handleLogin(form, formData) {
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showError(data.error || 'Login failed');
            return;
        }

        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userName', data.user.fullName);

        showSuccess('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);

    } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred during login');
    }
}

// Modal Management
function initializeModals() {
    const termsLink = document.querySelector('a[href="#"]');
    const privacyLink = termsLink?.nextElementSibling;
    
    setupModal('termsModal', termsLink);
    setupModal('privacyModal', privacyLink);

    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(closeModal);
        }
    });
}

function setupModal(modalId, trigger) {
    const modal = document.getElementById(modalId);
    if (!modal || !trigger) return;

    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });

    modal.querySelectorAll('.modal-close, .modal-close-btn').forEach(button => {
        button.addEventListener('click', () => closeModal(modal));
    });
}

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Authentication Status Check


// Utility Functions
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
    const form = document.querySelector('form');
    if (!form) return;

    const existingError = form.querySelector('.error-message');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    form.insertBefore(errorDiv, form.firstChild);
}

function showSuccess(message) {
    const form = document.querySelector('form');
    if (!form) return;

    const existingSuccess = form.querySelector('.success-message');
    if (existingSuccess) existingSuccess.remove();

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    form.insertBefore(successDiv, form.firstChild);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    initializeTheme();
    initializeMobileMenu();
    initializeForm();
    initializeModals();

    // Recognize selected plan from URL and store it
    const params = new URLSearchParams(window.location.search);
    const selectedPlan = params.get("plan");

    if (selectedPlan) {
        localStorage.setItem("selectedPlan", selectedPlan);

        // Update the header content with a "Change Plan" option
        document.querySelector(".registration-header p").innerHTML =
            `You are registering for the <strong>${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}</strong> plan. 
            <a href="index.html#pricing" class="change-plan-link">Change Plan</a>`;
    }
});


// ============================================
// MODAL & AUTH FUNCTIONALITY
// ============================================

let loginTermsCheckbox, signupTermsCheckbox, loginSubmitBtn, signupSubmitBtn;
let termsModalOverlay, termsModalContent, loginForm, signupForm;
let loginTab, signupTab, switchToSignup, switchToLogin;
let roleSelect, lawyerFields, licenseLabel, firmLabel;

// Initialize on page load
window.addEventListener('DOMContentLoaded', function () {
    loginTermsCheckbox = document.getElementById('loginTermsCheckbox');
    signupTermsCheckbox = document.getElementById('signupTermsCheckbox');
    loginSubmitBtn = document.getElementById('loginSubmitBtn');
    signupSubmitBtn = document.getElementById('signupSubmitBtn');
    termsModalOverlay = document.getElementById('termsModalOverlay');
    termsModalContent = document.getElementById('termsModalContent');
    loginForm = document.getElementById('loginForm');
    signupForm = document.getElementById('signupForm');
    loginTab = document.getElementById('loginTab');
    signupTab = document.getElementById('signupTab');
    switchToSignup = document.getElementById('switchToSignup');
    switchToLogin = document.getElementById('switchToLogin');
    roleSelect = document.getElementById('roleSelect');
    lawyerFields = document.getElementById('lawyerFields');
    licenseLabel = document.getElementById('licenseLabel');
    firmLabel = document.getElementById('firmLabel');
    loginTermsCheckbox.checked = false;
    signupTermsCheckbox.checked = false;
    loginSubmitBtn.disabled = true;
    signupSubmitBtn.disabled = true;

    loginTermsCheckbox.addEventListener('change', updateLoginButtonState);
    signupTermsCheckbox.addEventListener('change', updateSignupButtonState);

    loginTab.addEventListener('click', switchToLoginTab);
    signupTab.addEventListener('click', switchToSignupTab);
    switchToSignup.addEventListener('click', switchToSignupTab);
    switchToLogin.addEventListener('click', switchToLoginTab);

    roleSelect.addEventListener('change', updateRoleFields);

    loginForm.addEventListener('submit', handleLoginSubmit);
    signupForm.addEventListener('submit', handleSignupSubmit);

    // ============================================
    // VISUAL TAB LOGIC (extracted from inline script)
    // ============================================
    loginTab.addEventListener('click', function () {
        this.className = "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 text-white bg-primary shadow-lg shadow-primary/25";
        signupTab.className = "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5";
    });

    signupTab.addEventListener('click', function () {
        this.className = "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 text-white bg-primary shadow-lg shadow-primary/25";
        loginTab.className = "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5";
    });

    document.getElementById('switchToSignup').addEventListener('click', () => document.getElementById('signupTab').click());
    document.getElementById('switchToLogin').addEventListener('click', () => document.getElementById('loginTab').click());
});

function updateLoginButtonState() {
    loginSubmitBtn.disabled = !loginTermsCheckbox.checked;
}

function updateSignupButtonState() {
    signupSubmitBtn.disabled = !signupTermsCheckbox.checked;
}

function switchToLoginTab() {
    signupForm.style.opacity = '0';
    signupForm.style.transform = 'translateY(10px)';

    setTimeout(() => {
        signupForm.classList.remove('active-form');
        loginForm.classList.add('active-form');
        setTimeout(() => {
            loginForm.style.opacity = '1';
            loginForm.style.transform = 'translateY(0)';
        }, 50);
    }, 200);
}

function switchToSignupTab() {
    loginForm.style.opacity = '0';
    loginForm.style.transform = 'translateY(10px)';

    setTimeout(() => {
        loginForm.classList.remove('active-form');
        signupForm.classList.add('active-form');
        setTimeout(() => {
            signupForm.style.opacity = '1';
            signupForm.style.transform = 'translateY(0)';
        }, 50);
    }, 200);
}

function updateRoleFields() {
    const role = roleSelect.value;

    if (role === 'lawyer' || role === 'advocate') {
        licenseLabel.textContent = "Bar Enrollment No.";
        firmLabel.textContent = "Law Firm / Chamber Name";
        lawyerFields.classList.remove('hidden');
    } else if (role === 'ca') {
        licenseLabel.textContent = "ICAI Registration No.";
        firmLabel.textContent = "Accounting Firm Name";
        lawyerFields.classList.remove('hidden');
    } else {
        lawyerFields.classList.add('hidden');
    }
}

function handleLoginSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!loginTermsCheckbox.checked) return;
    if (!isValidEmail(email)) {
        showStatus('Please enter a valid professional email', 'error');
        return;
    }

    loginSubmitBtn.innerHTML = `<svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;

    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userType', 'login');
    if (!sessionStorage.getItem('userRole')) sessionStorage.setItem('userRole', 'lawyer');

    setTimeout(() => {
        window.location.href = '../html/dashboard.html';
    }, 800);
}

function handleSignupSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = roleSelect.value;

    if (!signupTermsCheckbox.checked) return;

    if (password !== confirmPassword) {
        showStatus('Passwords do not match', 'error');
        return;
    }

    signupSubmitBtn.innerHTML = `<svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;

    sessionStorage.setItem('userName', name);
    sessionStorage.setItem('userEmail', email);
    sessionStorage.setItem('userRole', role);

    if (role === 'lawyer' || role === 'advocate' || role === 'ca') {
        sessionStorage.setItem('licenseNum', document.getElementById('barNumber').value);
        sessionStorage.setItem('firmName', document.getElementById('firmName').value);
    }

    setTimeout(() => {
        window.location.href = '../html/dashboard.html';
    }, 1000);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('authStatus');
    statusDiv.textContent = message;

    const colorClasses = type === 'error' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    statusDiv.className = `mt-4 text-center text-sm font-semibold rounded-xl p-3 block backdrop-blur-md border ${colorClasses}`;

    setTimeout(() => {
        statusDiv.classList.add('hidden');
        statusDiv.classList.remove('block');
    }, 4000);
}

function openTermsModal(event) {
    event.preventDefault();
    termsModalOverlay.classList.remove('hidden');
    setTimeout(() => {
        termsModalOverlay.classList.remove('opacity-0');
        termsModalOverlay.classList.add('opacity-100');
        termsModalContent.classList.remove('scale-95');
        termsModalContent.classList.add('scale-100');
    }, 10);
    document.body.style.overflow = 'hidden';
}

function closeTermsModal() {
    termsModalOverlay.classList.remove('opacity-100');
    termsModalOverlay.classList.add('opacity-0');
    termsModalContent.classList.remove('scale-100');
    termsModalContent.classList.add('scale-95');

    setTimeout(() => {
        termsModalOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 300);
}

termsModalOverlay.addEventListener('click', function (e) {
    if (e.target === termsModalOverlay) closeTermsModal();
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !termsModalOverlay.classList.contains('hidden')) closeTermsModal();
});

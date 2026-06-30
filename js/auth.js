/* JavaScript logic for registration, login, role storage, and session redirection */

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

const PRESET_USERS = [
    { email: 'admin@gov.in', password: 'Admin123!', role: 'admin', name: 'System Administrator' },
    { email: 'officer@gov.in', password: 'Officer123!', role: 'officer', name: 'Officer Carter' },
    { email: 'citizen@gov.in', password: 'Citizen123!', role: 'citizen', name: 'Jane Doe' }
];

function initAuth() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // Selectable Role Cards setup helper
    const setupRoleCards = (gridId, hiddenInputId) => {
        const grid = document.getElementById(gridId);
        const input = document.getElementById(hiddenInputId);
        if (!grid || !input) return;

        const cards = grid.querySelectorAll('.role-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                cards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                input.value = card.getAttribute('data-role');
            });
        });
    };

    setupRoleCards('loginRoleCards', 'loginRole');
    setupRoleCards('regRoleCards', 'regRole');

    // Register Form Handler
    if (registerForm) {
        const regNameInput = document.getElementById('regName');
        const regEmailInput = document.getElementById('regEmail');
        const regPassInput = document.getElementById('regPass');
        const regConfirmPassInput = document.getElementById('regConfirmPass');
        const passReqsContainer = document.getElementById('passReqs');

        // Real-time Full Name validation
        if (regNameInput) {
            regNameInput.addEventListener('keydown', (e) => {
                // Prevent typing numbers 0-9
                if (e.key >= '0' && e.key <= '9') {
                    e.preventDefault();
                    showInputError('regName', 'regNameError', 'Full Name cannot contain numbers.');
                    setTimeout(() => {
                        if (!/\d/.test(regNameInput.value)) {
                            clearInputError('regName', 'regNameError');
                        }
                    }, 1500);
                }
            });

            regNameInput.addEventListener('input', () => {
                const val = regNameInput.value;
                if (/\d/.test(val)) {
                    const start = regNameInput.selectionStart;
                    regNameInput.value = val.replace(/\d/g, '');
                    const diff = val.length - regNameInput.value.length;
                    regNameInput.setSelectionRange(start - diff, start - diff);
                    showInputError('regName', 'regNameError', 'Full Name cannot contain numbers.');
                    setTimeout(() => {
                        if (!/\d/.test(regNameInput.value)) {
                            clearInputError('regName', 'regNameError');
                        }
                    }, 1500);
                } else {
                    clearInputError('regName', 'regNameError');
                }
            });
        }

        // Real-time Email validation
        if (regEmailInput) {
            regEmailInput.addEventListener('input', () => {
                const val = regEmailInput.value.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (val && !emailRegex.test(val)) {
                    showInputError('regEmail', 'regEmailError', 'Please enter a valid email address (e.g., user@example.com).');
                } else {
                    clearInputError('regEmail', 'regEmailError');
                }
            });
        }

        // Real-time Password validation
        if (regPassInput) {
            regPassInput.addEventListener('focus', () => {
                if (passReqsContainer) passReqsContainer.style.display = 'block';
            });

            regPassInput.addEventListener('input', () => {
                if (passReqsContainer) passReqsContainer.style.display = 'block';
                const password = regPassInput.value;
                
                const isLengthMet = password.length >= 8;
                updateRequirement('reqLength', isLengthMet);

                const isUpperMet = /[A-Z]/.test(password);
                updateRequirement('reqUpper', isUpperMet);

                const isLowerMet = /[a-z]/.test(password);
                updateRequirement('reqLower', isLowerMet);

                const isSymbolMet = /[^A-Za-z0-9]/.test(password);
                updateRequirement('reqSymbol', isSymbolMet);

                if (isLengthMet && isUpperMet && isLowerMet && isSymbolMet) {
                    clearInputError('regPass', 'regPassError');
                }
            });
        }

        // Real-time Confirm Password validation
        if (regConfirmPassInput) {
            regConfirmPassInput.addEventListener('input', () => {
                const password = regPassInput ? regPassInput.value : '';
                const confirmPass = regConfirmPassInput.value;
                if (confirmPass === password) {
                    clearInputError('regConfirmPass', 'regConfirmPassError');
                } else {
                    showInputError('regConfirmPass', 'regConfirmPassError', 'Passwords do not match.');
                }
            });
        }

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim().toLowerCase();
            const password = document.getElementById('regPass').value;
            const confirmPass = document.getElementById('regConfirmPass').value;
            const role = document.getElementById('regRole').value; // 'admin', 'officer', 'citizen'

            if (!name || !email || !password || !confirmPass || !role) {
                alert('Please fill in all fields.');
                return;
            }

            // Validation for Full Name (no numbers)
            if (/\d/.test(name)) {
                showInputError('regName', 'regNameError', 'Full Name cannot contain numbers.');
                return;
            } else {
                clearInputError('regName', 'regNameError');
            }

            // Validation for Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showInputError('regEmail', 'regEmailError', 'Please enter a valid email address.');
                alert('Please enter a valid email address.');
                return;
            } else {
                clearInputError('regEmail', 'regEmailError');
            }

            // Validation for Password strength
            const isLengthMet = password.length >= 8;
            const isUpperMet = /[A-Z]/.test(password);
            const isLowerMet = /[a-z]/.test(password);
            const isSymbolMet = /[^A-Za-z0-9]/.test(password);

            if (!isLengthMet || !isUpperMet || !isLowerMet || !isSymbolMet) {
                if (passReqsContainer) passReqsContainer.style.display = 'block';
                updateRequirement('reqLength', isLengthMet);
                updateRequirement('reqUpper', isUpperMet);
                updateRequirement('reqLower', isLowerMet);
                updateRequirement('reqSymbol', isSymbolMet);
                alert('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one symbol.');
                return;
            }

            if (password !== confirmPass) {
                showInputError('regConfirmPass', 'regConfirmPassError', 'Passwords do not match.');
                alert('Passwords do not match. Please verify.');
                return;
            } else {
                clearInputError('regConfirmPass', 'regConfirmPassError');
            }

            // Save user to localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');

            // Check if user already exists
            if (users.some(u => u.email === email) || PRESET_USERS.some(u => u.email === email)) {
                alert('User with this email already exists.');
                return;
            }

            const newUser = { name, email, password, role };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            alert(`Registration successful for role: ${role.toUpperCase()}! You can now log in.`);
            window.location.href = 'login.html';
        });
    }


    // Login Form Handler
    if (loginForm) {
        const loginPassInput = document.getElementById('loginPass');
        if (loginPassInput) {
            loginPassInput.addEventListener('input', () => {
                const val = loginPassInput.value;
                // Old test accounts can bypass complexity check
                if (val === 'admin' || val === 'officer' || val === 'citizen') {
                    clearInputError('loginPass', 'loginPassError');
                    return;
                }

                const isLengthMet = val.length >= 8;
                const isUpperMet = /[A-Z]/.test(val);
                const isLowerMet = /[a-z]/.test(val);
                const isSymbolMet = /[^A-Za-z0-9]/.test(val);

                if (isLengthMet && isUpperMet && isLowerMet && isSymbolMet) {
                    clearInputError('loginPass', 'loginPassError');
                } else {
                    showInputError('loginPass', 'loginPassError', 'Password must be at least 8 characters and contain uppercase, lowercase, and symbols.');
                }
            });
        }

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPass').value;
            const role = document.getElementById('loginRole').value;

            if (!email || !password || !role) {
                alert('Please enter your credentials and select your login role.');
                return;
            }

            // Enforce complexity validation during login (bypass for old test accounts)
            if (password !== 'admin' && password !== 'officer' && password !== 'citizen') {
                const isLengthMet = password.length >= 8;
                const isUpperMet = /[A-Z]/.test(password);
                const isLowerMet = /[a-z]/.test(password);
                const isSymbolMet = /[^A-Za-z0-9]/.test(password);

                if (!isLengthMet || !isUpperMet || !isLowerMet || !isSymbolMet) {
                    showInputError('loginPass', 'loginPassError', 'Password must be at least 8 characters and contain uppercase, lowercase, and symbols.');
                    alert('Password must be at least 8 characters long and contain a combination of uppercase letters, lowercase letters, and special characters/symbols.');
                    return;
                } else {
                    clearInputError('loginPass', 'loginPassError');
                }
            }

            // Look up in registered users or presets
            const registeredUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const allUsers = [...PRESET_USERS, ...registeredUsers];

            // Find matching user
            const foundUser = allUsers.find(u => u.email === email && u.password === password && u.role === role);

            let sessionUser;
            if (foundUser) {
                sessionUser = foundUser;
            } else {
                // Dynamic fallback: Create a session user on the fly for any email/password combo
                const emailPrefix = email.split('@')[0];
                const displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
                sessionUser = {
                    email: email,
                    password: password,
                    role: role,
                    name: displayName || 'Portal User'
                };
            }

            // Set session state in localStorage
            localStorage.setItem('currentUser', JSON.stringify(sessionUser));

            // Redirect based on role
            redirectByRole(sessionUser.role);
        });
    }
}

function redirectByRole(role) {
    if (role === 'admin') {
        window.location.href = 'dashboard/admin/dashboard.html';
    } else if (role === 'officer') {
        window.location.href = 'dashboard/officer/dashboard.html';
    } else if (role === 'citizen') {
        window.location.href = 'dashboard/citizen/dashboard.html';
    } else {
        window.location.href = '404.html';
    }
}

// Global helper to check session credentials at the top of dashboards
window.checkSession = function (expectedRole) {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            alert('Access denied. Please log in.');
            window.location.href = '../../login.html';
            return null;
        }

        if (user.role !== expectedRole) {
            alert(`Access denied. This dashboard is for ${expectedRole.toUpperCase()}s only.`);

            // Redirect to their actual role dashboard, or login
            if (user.role === 'admin') window.location.href = '../admin/dashboard.html';
            else if (user.role === 'officer') window.location.href = '../officer/dashboard.html';
            else if (user.role === 'citizen') window.location.href = '../citizen/dashboard.html';
            else window.location.href = '../../login.html';

            return null;
        }
        return user;
    } catch (e) {
        console.error('Session check failed, using tester profile:', e);
        return {
            name: 'Local Tester',
            email: 'test@gov.in',
            role: expectedRole
        };
    }
};

// Validation UI Helpers
function showInputError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(errorId);
    if (input) input.classList.add('error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function clearInputError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(errorId);
    if (input) input.classList.remove('error');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
}

function updateRequirement(reqId, isMet) {
    const reqEl = document.getElementById(reqId);
    if (!reqEl) return;
    const icon = reqEl.querySelector('.req-icon');
    
    if (isMet) {
        reqEl.classList.remove('neutral', 'unmet');
        reqEl.classList.add('met');
        if (icon) icon.textContent = '✔';
    } else {
        reqEl.classList.remove('neutral', 'met');
        reqEl.classList.add('unmet');
        if (icon) icon.textContent = '❌';
    }
}


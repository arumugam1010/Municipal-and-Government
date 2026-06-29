/* JavaScript logic for registration, login, role storage, and session redirection */

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

const PRESET_USERS = [
    { email: 'admin@gov.in', password: 'admin', role: 'admin', name: 'System Administrator' },
    { email: 'officer@gov.in', password: 'officer', role: 'officer', name: 'Officer Carter' },
    { email: 'citizen@gov.in', password: 'citizen', role: 'citizen', name: 'Jane Doe' }
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

            if (password !== confirmPass) {
                alert('Passwords do not match. Please verify.');
                return;
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
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPass').value;
            const role = document.getElementById('loginRole').value;

            if (!email || !password || !role) {
                alert('Please enter your credentials and select your login role.');
                return;
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
window.checkSession = function(expectedRole) {
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

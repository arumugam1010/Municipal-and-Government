/* JavaScript logic for futuristic 404 page redirection history tracker */

document.addEventListener('DOMContentLoaded', () => {
    initErrorRedirect();
});

function initErrorRedirect() {
    const backBtn = document.getElementById('backToDashboard');
    const backHomeBtn = document.getElementById('backToHome');
    if (!backBtn) return;

    // Check if there is an active session in localStorage
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (user) {
        // User is logged in, show both buttons
        backBtn.style.display = 'inline-flex';
        if (backHomeBtn) backHomeBtn.style.display = 'inline-flex';
        
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Retrieve last dashboard URL from localStorage
            const lastDashboard = localStorage.getItem('lastDashboard');
            
            if (lastDashboard) {
                window.location.href = lastDashboard;
            } else {
                if (user.role === 'admin') window.location.href = 'dashboard/admin/dashboard.html';
                else if (user.role === 'officer') window.location.href = 'dashboard/officer/dashboard.html';
                else if (user.role === 'citizen') window.location.href = 'dashboard/citizen/dashboard.html';
                else window.location.href = 'index.html';
            }
        });
    } else {
        // User is not logged in, hide dashboard button and keep only home button
        backBtn.style.display = 'none';
        if (backHomeBtn) backHomeBtn.style.display = 'inline-flex';
    }
}

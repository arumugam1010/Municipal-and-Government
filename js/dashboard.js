/* JavaScript logic for collapsible sidebar, profile bindings, mobile responsive triggers, and action button redirection */

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

function initDashboard() {
    // 1. Session verification based on page location
    const path = window.location.pathname;
    let expectedRole = 'citizen';
    if (path.includes('/admin/')) expectedRole = 'admin';
    else if (path.includes('/officer/')) expectedRole = 'officer';

    // Verify session with safety try-catch block
    let activeUser = null;
    try {
        activeUser = window.checkSession ? window.checkSession(expectedRole) : null;
    } catch (e) {
        console.error('Session check failed, using safe fallback:', e);
        activeUser = { name: 'Official Account' };
    }
    
    // Set user profile info
    if (activeUser) {
        const profileNames = document.querySelectorAll('.user-name-label');
        profileNames.forEach(el => {
            el.innerText = activeUser.name || 'Official Account';
        });
        
        const avatarBadges = document.querySelectorAll('.user-avatar');
        avatarBadges.forEach(el => {
            if (activeUser.name) {
                el.innerText = activeUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            }
        });

        // Dynamically inject user profile badge into mobile-header-bar
        const mobileHeader = document.querySelector('.mobile-header-bar');
        if (mobileHeader) {
            const badge = document.createElement('div');
            badge.className = 'mobile-user-badge';
            
            let initials = 'C';
            if (activeUser.name) {
                initials = activeUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            }
            
            badge.innerHTML = `
                <div class="user-avatar" style="width: 28px; height: 28px; font-size: 0.75rem; border-radius: var(--radius-sm); background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-weight: 700; color: white;">${initials}</div>
                <span class="user-name-label" style="font-size: 0.8rem; font-weight: 600; color: var(--text-main);">${activeUser.name || 'Official Account'}</span>
            `;
            
            const toggleButton = mobileHeader.querySelector('.sidebar-toggle');
            if (toggleButton) {
                mobileHeader.insertBefore(badge, toggleButton);
            } else {
                mobileHeader.appendChild(badge);
            }
        }

        // Dynamically create and inject dash-top-bar on desktop view
        const dashContent = document.querySelector('.dash-content');
        const dashHeader = document.querySelector('.dash-header');
        if (dashContent && dashHeader) {
            let topBar = dashContent.querySelector('.dash-top-bar');
            if (!topBar) {
                topBar = document.createElement('div');
                topBar.className = 'dash-top-bar';
                const controls = dashHeader.querySelector('.dash-controls');
                if (controls) {
                    topBar.appendChild(controls);
                }
                dashContent.insertBefore(topBar, dashContent.firstChild);
            }
        }
    }

    // 2. Sidebar collapsibility
    const sidebar = document.querySelector('.dash-sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const mobileToggleBtn = document.getElementById('mobileSidebarToggle');
    const overlay = document.querySelector('.sidebar-overlay');

    // Ensure scroll lock is disabled on fresh dashboard load
    document.body.classList.remove('sidebar-open');
    document.documentElement.classList.remove('sidebar-open');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            if (window.innerWidth <= 768 && overlay) {
                sidebar.classList.remove('active-mobile');
                overlay.classList.remove('active');
                document.body.classList.remove('sidebar-open');
                document.documentElement.classList.remove('sidebar-open');
            } else {
                sidebar.classList.toggle('collapsed');
            }
        });
    }

    if (mobileToggleBtn && sidebar && overlay) {
        mobileToggleBtn.addEventListener('click', () => {
            sidebar.classList.add('active-mobile');
            overlay.classList.add('active');
            document.body.classList.add('sidebar-open');
            document.documentElement.classList.add('sidebar-open');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active-mobile');
            overlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
            document.documentElement.classList.remove('sidebar-open');
        });
    }

    // 3. Action button redirection
    // Any button, input of submit type, or action link inside the main content workspace redirects to 404
    const contentArea = document.querySelector('.dash-content');
    if (contentArea) {
        contentArea.addEventListener('click', (e) => {
            const clickable = e.target.closest('button, a, input[type="submit"], .btn');
            
            if (clickable) {
                // If it is a link or button, but NOT a sidebar link, redirect to 404
                // Check if it has a specific exception (none specified by user except sidebar links which are outside .dash-content anyway)
                e.preventDefault();
                e.stopPropagation();
                
                // Store current dashboard URL so the 404 "Back to Dashboard" button can route the user back
                localStorage.setItem('lastDashboard', window.location.href);
                
                // Redirect to root 404
                window.location.href = '../../404.html';
            }
        });
    }
}

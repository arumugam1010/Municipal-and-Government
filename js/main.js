/* Global main.js containing common UI behaviors, ripples, particles, counters, scroll animation triggers */

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavbar();
    initRipples();
    initParticles();
    initScrollReveal();
    initCounters();
    checkSessionNavbar();
});

/* Navbar scroll effect & mobile toggle */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const toggleBtn = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    if (toggleBtn && navMenu) {
        function toggleMobileMenu(isOpen) {
            if (isOpen) {
                toggleBtn.classList.add('active');
                navMenu.classList.add('active');
                document.body.classList.add('menu-open');
                document.documentElement.classList.add('menu-open');
            } else {
                toggleBtn.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
                document.documentElement.classList.remove('menu-open');
            }
        }

        toggleBtn.addEventListener('click', () => {
            toggleMobileMenu(!navMenu.classList.contains('active'));
        });

        // Close menu on link click
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                toggleMobileMenu(false);
            });
        });

        // Close menu on close button click
        const closeBtn = navMenu.querySelector('.mobile-sidebar-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toggleMobileMenu(false);
            });
        }

        // Close menu if window is resized beyond mobile breakpoint
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                toggleMobileMenu(false);
            }
        });
    }
}

/* Premium ripple button animation */
function initRipples() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;

        // Remove old ripples
        const oldRipples = btn.querySelectorAll('.ripple');
        oldRipples.forEach(r => r.remove());

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        btn.appendChild(ripple);
    });
}

/* Floating BG Particles */
function initParticles() {
    const container = document.querySelector('.particle-container');
    if (!container) return;

    const count = window.innerWidth < 768 ? 10 : 25;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 20 + 8; // 8px to 28px
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;

        const duration = Math.random() * 8 + 6; // 6s to 14s
        const delay = Math.random() * 5;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `-${delay}s`;

        container.appendChild(particle);
    }
}

/* Scroll Reveal animation helper */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        observer.observe(el);
    });
}

/* Dynamic counter animations */
function initCounters() {
    const counters = document.querySelectorAll('.counter-val');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const limit = parseInt(target.getAttribute('data-target'), 10) || 0;
                let current = 0;
                const increment = Math.ceil(limit / 50);
                const interval = setInterval(() => {
                    current += increment;
                    if (current >= limit) {
                        target.innerText = limit.toLocaleString();
                        clearInterval(interval);
                    } else {
                        target.innerText = current.toLocaleString();
                    }
                }, 30);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

/* Dynamic Navbar Dashboard Button Injection for active sessions */
function checkSessionNavbar() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;

        // Resolve dashboard URL
        let dashboardUrl = 'index.html';
        if (currentUser.role === 'admin') dashboardUrl = 'dashboard/admin/dashboard.html';
        else if (currentUser.role === 'officer') dashboardUrl = 'dashboard/officer/dashboard.html';
        else if (currentUser.role === 'citizen') dashboardUrl = 'dashboard/citizen/dashboard.html';

        // Update Desktop Nav Buttons
        const navBtns = document.querySelector('.nav-btns');
        if (navBtns) {
            navBtns.innerHTML = `<a href="${dashboardUrl}" class="btn btn-primary">Dashboard</a>`;
        }

        // Update Mobile Nav Buttons inside Sidebar
        const mobileNavBtns = document.querySelector('.mobile-nav-btns');
        if (mobileNavBtns) {
            mobileNavBtns.innerHTML = `<a href="${dashboardUrl}" class="btn btn-primary" style="width: 100%; text-align: center; justify-content: center;">Dashboard</a>`;
        }
    } catch (e) {
        console.error("Session navbar check error:", e);
    }
}

function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Prevent user scrolling during load
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';

            // Restore scrollability
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';

            setTimeout(() => {
                preloader.remove();
            }, 500);
        }, 3000);
    }
}

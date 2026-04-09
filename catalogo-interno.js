document.addEventListener('DOMContentLoaded', () => {
 
    // ── Intersection Observer: trigger animations on scroll ──────────────────
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
 
    // Staggered obj-cards
    document.querySelectorAll('.obj-card').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.1}s`;
        observer.observe(el);
    });
 
    // Staggered roadmap items
    document.querySelectorAll('.roadmap-item').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.18}s`;
        observer.observe(el);
    });
 
    // Staggered pricing cards
    document.querySelectorAll('.pricing-card').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.12}s`;
        observer.observe(el);
    });
 
    // ── Nav scroll state ─────────────────────────────────────────────────────
    const nav = document.querySelector('.nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            nav.style.background = 'rgba(8, 8, 15, 0.96)';
        } else {
            nav.style.background = 'rgba(8, 8, 15, 0.85)';
        }
    }, { passive: true });
 
    // ── Smooth scroll for hero arrow ─────────────────────────────────────────
    const heroScroll = document.querySelector('.hero-scroll');
    if (heroScroll) {
        heroScroll.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector('#objetivo');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    }
 
    // ── Pause companies carousel on touch (mobile) ───────────────────────────
    const track = document.querySelector('.companies-track');
    if (track) {
        track.addEventListener('touchstart', () => {
            track.style.animationPlayState = 'paused';
        }, { passive: true });
        track.addEventListener('touchend', () => {
            track.style.animationPlayState = 'running';
        }, { passive: true });
    }
 
});

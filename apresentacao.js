/**
 * APRESENTAÇÃO IAUTOMATIZE - JavaScript Mobile-First
 * Sistema de apresentação empresarial com animações e interatividade
 */

// Global state
let appState = {
    currentSlide: 0,
    totalSlides: 9,
    isScrolling: false,
    isMenuOpen: false,
    particlesSystem: null,
    touchStartY: 0,
    touchEndY: 0
};

// DOM elements cache
let elements = {};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Apresentação IAutomatize...');
    
    initializeElements();
    initializeParticles();
    setupEventListeners();
    initializeAOS();
    startLoadingSequence();
    setupSlideNavigation();
    initializeStats();
});

/**
 * Initialize DOM elements cache
 */
function initializeElements() {
    elements.loadingScreen = document.getElementById('loadingScreen');
    elements.navigation = document.getElementById('navigation');
    elements.navigationMenu = document.getElementById('navigationMenu');
    elements.navigationToggle = document.getElementById('navigationToggle');
    elements.progressBar = document.getElementById('progressBar');
    elements.slideIndicators = document.querySelectorAll('.slide-indicators__dot');
    elements.slides = document.querySelectorAll('.slide');
    elements.particlesCanvas = document.getElementById('particlesCanvas');
    
    console.log('✅ Elementos DOM inicializados');
}

/**
 * Initialize particles system for hero background
 */
function initializeParticles() {
    const canvas = elements.particlesCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = window.innerWidth < 768 ? 50 : 100;

    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 3 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Wrap around screen
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(124, 77, 219, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Draw connections
        particles.forEach((particle, i) => {
            particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.strokeStyle = `rgba(124, 77, 219, ${0.1 * (1 - distance / 100)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        });

        requestAnimationFrame(animate);
    }

    animate();
    appState.particlesSystem = { canvas, ctx, particles };
    
    console.log('✨ Sistema de partículas inicializado');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Scroll events for navigation and progress
    let lastScroll = 0;
    const throttledScroll = throttle(() => {
        const currentScroll = window.pageYOffset;
        
        // Navigation scroll effect
        if (currentScroll > 100) {
            elements.navigation.classList.add('navigation--scrolled');
        } else {
            elements.navigation.classList.remove('navigation--scrolled');
        }
        
        // Update progress bar
        updateScrollProgress();
        
        // Update active slide indicator
        updateActiveSlide();
        
        lastScroll = currentScroll;
    }, 16);

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Mobile menu toggle
    if (elements.navigationToggle && elements.navigationMenu) {
        elements.navigationToggle.addEventListener('click', toggleMobileMenu);
        
        // Close menu when clicking on links
        elements.navigationMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('navigation__link')) {
                closeMobileMenu();
            }
        });
    }

    // Slide indicators
    elements.slideIndicators.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            navigateToSlide(index);
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            navigateToSlide(Math.min(appState.currentSlide + 1, appState.totalSlides - 1));
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            navigateToSlide(Math.max(appState.currentSlide - 1, 0));
        } else if (e.key === 'Home') {
            e.preventDefault();
            navigateToSlide(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            navigateToSlide(appState.totalSlides - 1);
        }
    });

    // Touch/swipe support for mobile
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - next slide
                navigateToSlide(Math.min(appState.currentSlide + 1, appState.totalSlides - 1));
            } else {
                // Swipe down - previous slide
                navigateToSlide(Math.max(appState.currentSlide - 1, 0));
            }
        }
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Contact form handling
    setupContactForm();

    console.log('🎯 Event listeners configurados');
}

/**
 * Initialize AOS (Animate On Scroll)
 */
function initializeAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 100,
            delay: 100
        });
        console.log('📱 AOS inicializado');
    }
}

/**
 * Start loading sequence
 */
function startLoadingSequence() {
    // Simulate loading time
    const loadingDuration = 2000;
    const progressSteps = [20, 40, 60, 80, 100];
    let currentStep = 0;

    const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
            updateLoadingProgress(progressSteps[currentStep]);
            currentStep++;
        } else {
            clearInterval(progressInterval);
            completeLoading();
        }
    }, loadingDuration / progressSteps.length);
}

/**
 * Update loading progress
 */
function updateLoadingProgress(percentage) {
    // You can add visual feedback here if needed
    console.log(`📊 Loading: ${percentage}%`);
}

/**
 * Complete loading and show main content
 */
function completeLoading() {
    setTimeout(() => {
        if (elements.loadingScreen) {
            elements.loadingScreen.classList.add('loading-screen--hidden');
            
            // Remove loading screen after animation
            setTimeout(() => {
                elements.loadingScreen.style.display = 'none';
            }, 500);
        }
        
        // Initialize animations
        initializeSlideAnimations();
        
        console.log('✅ Loading concluído');
    }, 500);
}

/**
 * Setup slide navigation
 */
function setupSlideNavigation() {
    // Intersection Observer for slide detection
    const slideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const slideIndex = Array.from(elements.slides).indexOf(entry.target);
                if (slideIndex !== -1) {
                    updateCurrentSlide(slideIndex);
                }
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '-50px 0px'
    });

    elements.slides.forEach(slide => {
        slideObserver.observe(slide);
    });
}

/**
 * Navigate to specific slide
 */
function navigateToSlide(slideIndex) {
    if (slideIndex < 0 || slideIndex >= appState.totalSlides || appState.isScrolling) {
        return;
    }

    appState.isScrolling = true;
    appState.currentSlide = slideIndex;

    const targetSlide = elements.slides[slideIndex];
    if (targetSlide) {
        targetSlide.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        // Update indicators
        updateSlideIndicators();

        // Reset scrolling flag after animation
        setTimeout(() => {
            appState.isScrolling = false;
        }, 1000);
    }
}

/**
 * Update current slide
 */
function updateCurrentSlide(slideIndex) {
    appState.currentSlide = slideIndex;
    updateSlideIndicators();
    updateScrollProgress();
}

/**
 * Update slide indicators
 */
function updateSlideIndicators() {
    elements.slideIndicators.forEach((dot, index) => {
        if (index === appState.currentSlide) {
            dot.classList.add('slide-indicators__dot--active');
        } else {
            dot.classList.remove('slide-indicators__dot--active');
        }
    });
}

/**
 * Update scroll progress bar
 */
function updateScrollProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    if (elements.progressBar) {
        elements.progressBar.style.width = scrolled + '%';
    }
}

/**
 * Update active slide based on scroll position
 */
function updateActiveSlide() {
    const scrollPosition = window.pageYOffset + window.innerHeight / 2;
    
    elements.slides.forEach((slide, index) => {
        const slideTop = slide.offsetTop;
        const slideBottom = slideTop + slide.offsetHeight;
        
        if (scrollPosition >= slideTop && scrollPosition < slideBottom) {
            if (appState.currentSlide !== index) {
                updateCurrentSlide(index);
            }
        }
    });
}

/**
 * Initialize slide animations
 */
function initializeSlideAnimations() {
    // Animate hero elements
    const heroElements = document.querySelectorAll('.hero__logo, .hero__title, .hero__subtitle, .hero__tagline, .hero__actions');
    heroElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

/**
 * Initialize statistics counter animation
 */
function initializeStats() {
    const statsNumbers = document.querySelectorAll('[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.getAttribute('data-count'));
                animateCounter(element, 0, target, 2000);
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });

    statsNumbers.forEach(number => {
        observer.observe(number);
    });
}

/**
 * Animate counter numbers
 */
function animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const value = Math.floor(start + (end - start) * easeOutQuart);
        
        // Format large numbers
        if (value >= 1000000) {
            element.textContent = (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            element.textContent = (value / 1000).toFixed(0) + 'K';
        } else {
            element.textContent = value.toString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    appState.isMenuOpen = !appState.isMenuOpen;
    
    if (appState.isMenuOpen) {
        openMobileMenu();
    } else {
        closeMobileMenu();
    }
}

/**
 * Open mobile menu
 */
function openMobileMenu() {
    elements.navigationToggle.classList.add('navigation__toggle--active');
    elements.navigationMenu.classList.add('navigation__menu--open');
    document.body.style.overflow = 'hidden';
    appState.isMenuOpen = true;
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    elements.navigationToggle.classList.remove('navigation__toggle--active');
    elements.navigationMenu.classList.remove('navigation__menu--open');
    document.body.style.overflow = '';
    appState.isMenuOpen = false;
}

/**
 * Setup contact form handling
 */
function setupContactForm() {
    // WhatsApp contact buttons
    const whatsappButtons = document.querySelectorAll('a[href*="wa.me"]');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('whatsapp_contact', {
                source: 'presentation',
                slide: appState.currentSlide
            });
        });
    });

    // Email contact links
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('email_contact', {
                source: 'presentation',
                slide: appState.currentSlide
            });
        });
    });

    // CTA buttons tracking
    const ctaButtons = document.querySelectorAll('.btn--primary, .btn--secondary');
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const buttonText = button.textContent.trim();
            trackEvent('cta_click', {
                button_text: buttonText,
                slide: appState.currentSlide,
                source: 'presentation'
            });
        });
    });
}

/**
 * Track analytics events
 */
function trackEvent(eventName, eventData = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('trackCustom', eventName, eventData);
    }
    
    // Custom analytics
    console.log('📊 Event tracked:', eventName, eventData);
}

/**
 * Utility functions
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

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

/**
 * Handle viewport changes for responsive behavior
 */
function handleViewportChanges() {
    const handleResize = debounce(() => {
        // Reinitialize particles on resize
        if (appState.particlesSystem) {
            const canvas = appState.particlesSystem.canvas;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        // Update AOS on resize
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
        
        console.log('📱 Viewport atualizado');
    }, 250);

    window.addEventListener('resize', handleResize, { passive: true });
}

/**
 * Initialize performance optimizations
 */
function initializePerformanceOptimizations() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Preload critical resources
    const criticalImages = [
        'https://github.com/user-attachments/assets/8a9ba7b7-5085-42f3-a808-7bef3554fb1d',
        'http://iautomatize.com/empresa/portifolio/profile.png'
    ];

    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

/**
 * Initialize accessibility features
 */
function initializeAccessibility() {
    // Skip to main content
    const skipLink = document.createElement('a');
    skipLink.href = '#home';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Pular para o conteúdo principal';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--color-primary);
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        font-weight: 600;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.prepend(skipLink);

    // ARIA live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    `;
    document.body.appendChild(liveRegion);

    // Announce slide changes
    const originalUpdateCurrentSlide = updateCurrentSlide;
    updateCurrentSlide = function(slideIndex) {
        originalUpdateCurrentSlide(slideIndex);
        const slideNames = [
            'Início', 'Sobre', 'Equipe', 'Soluções', 'Clientes', 
            'Processo', 'Investimento', 'Tecnologias', 'Contato'
        ];
        liveRegion.textContent = `Slide ${slideIndex + 1} de ${appState.totalSlides}: ${slideNames[slideIndex]}`;
    };
}

/**
 * Initialize error handling
 */
function initializeErrorHandling() {
    window.addEventListener('error', (e) => {
        console.error('🚨 Erro capturado:', e.error);
        trackEvent('javascript_error', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno
        });
    });

    window.addEventListener('unhandledrejection', (e) => {
        console.error('🚨 Promise rejeitada:', e.reason);
        trackEvent('promise_rejection', {
            reason: e.reason?.toString() || 'Unknown'
        });
    });
}

// Initialize additional features
handleViewportChanges();
initializePerformanceOptimizations();
initializeAccessibility();
initializeErrorHandling();

console.log('🎉 Sistema de Apresentação IAutomatize carregado com sucesso!');
console.log('📱 Mobile-first e otimizado para performance');
console.log('♿ Recursos de acessibilidade ativados');
console.log('📊 Sistema de analytics configurado');

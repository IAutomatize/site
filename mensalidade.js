// ========================================
// IAUTOMATIZE - MENSALIDADE JS
// Scripts para Landing Page de Automação
// ========================================

// ===== CONSTANTES E VARIÁVEIS GLOBAIS =====
const DOM = {
    progressBar: document.getElementById('progressBar'),
    mainHeader: document.getElementById('mainHeader'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileMenu: document.getElementById('mobileMenu'),
    navLinks: document.querySelectorAll('.nav-link'),
    mobileNavLinks: document.querySelectorAll('.mobile-nav-link'),
    larguraInput: document.getElementById('largura'),
    alturaInput: document.getElementById('altura'),
    valorCalculado: document.getElementById('valor-calculado'),
    roiButtons: document.querySelectorAll('.roi-btn'),
    tableRows: {
        basico: document.getElementById('row-basico'),
        intermediario: document.getElementById('row-intermediario'),
        avancado: document.getElementById('row-avancado')
    },
    particles: document.getElementById('particles'),
    fadeElements: document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right'),
    metricNumbers: document.querySelectorAll('.metric-number'),
    roiChart: document.getElementById('roiChart')
};

// ===== FUNÇÕES UTILITÁRIAS =====

// Debounce para otimizar performance
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

// Smooth scroll para links internos
function smoothScroll(target, duration) {
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 80;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// ===== PROGRESS BAR =====
function updateProgressBar() {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    if (DOM.progressBar) {
        DOM.progressBar.style.width = scrolled + '%';
    }
}

// ===== HEADER SCROLL EFFECT =====
function handleHeaderScroll() {
    if (window.scrollY > 50) {
        DOM.mainHeader.classList.add('scrolled');
    } else {
        DOM.mainHeader.classList.remove('scrolled');
    }
}

// ===== NAVEGAÇÃO ATIVA =====
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            DOM.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    DOM.mobileMenuBtn.classList.toggle('active');
    DOM.mobileMenu.classList.toggle('active');
    
    // Atualiza ARIA
    const isExpanded = DOM.mobileMenuBtn.classList.contains('active');
    DOM.mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
}

function closeMobileMenu() {
    DOM.mobileMenuBtn.classList.remove('active');
    DOM.mobileMenu.classList.remove('active');
    DOM.mobileMenuBtn.setAttribute('aria-expanded', 'false');
}

// ===== PARTÍCULAS ANIMADAS =====
function createParticles() {
    if (!DOM.particles) return;
    
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (20 + Math.random() * 20) + 's';
        DOM.particles.appendChild(particle);
    }
}

// ===== CALCULADORA DE ORÇAMENTO =====
function calcularValor() {
    const largura = parseFloat(DOM.larguraInput.value) || 0;
    const altura = parseFloat(DOM.alturaInput.value) || 0;
    
    if (largura > 0 && altura > 0) {
        const fatorPreco = 1.5;
        const valor = (largura * altura * fatorPreco) / 100;
        DOM.valorCalculado.textContent = `R$ ${valor.toFixed(2).replace('.', ',')}`;
        
        // Adiciona efeito visual
        DOM.valorCalculado.style.transform = 'scale(1.1)';
        setTimeout(() => {
            DOM.valorCalculado.style.transform = 'scale(1)';
        }, 200);
    } else {
        DOM.valorCalculado.textContent = 'R$ 0,00';
    }
}

// ===== ROI SELECTOR =====
function handleROISelection(event) {
    const selectedLevel = event.target.dataset.level;
    
    // Atualiza botões
    DOM.roiButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    event.target.classList.add('active');
    event.target.setAttribute('aria-selected', 'true');
    
    // Atualiza tabela
    Object.values(DOM.tableRows).forEach(row => {
        row.classList.remove('highlight-row');
    });
    
    if (DOM.tableRows[selectedLevel]) {
        DOM.tableRows[selectedLevel].classList.add('highlight-row');
        
        // Scroll suave para a tabela
        const table = document.querySelector('.roi-table-wrapper');
        table.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// ===== INTERSECTION OBSERVER PARA ANIMAÇÕES =====
function setupIntersectionObserver() {
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Para elementos com delay
                const delay = entry.target.classList.contains('delay-200') ? 200 :
                             entry.target.classList.contains('delay-400') ? 400 :
                             entry.target.classList.contains('delay-600') ? 600 : 0;
                
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) translateX(0)';
                }, delay);
                
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    DOM.fadeElements.forEach(element => {
        observer.observe(element);
    });
    
    // Observer específico para métricas
    const metricsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateMetrics();
                metricsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const metricsSection = document.querySelector('.success-metrics');
    if (metricsSection) {
        metricsObserver.observe(metricsSection);
    }
    
    // Observer para o gráfico
    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initROIChart();
                chartObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    const chartSection = document.querySelector('.roi-chart-section');
    if (chartSection) {
        chartObserver.observe(chartSection);
    }
}

// ===== ANIMAÇÃO DE NÚMEROS DAS MÉTRICAS =====
function animateMetrics() {
    DOM.metricNumbers.forEach(metric => {
        const target = parseInt(metric.dataset.target);
        const prefix = metric.dataset.prefix || '';
        const suffix = metric.dataset.suffix || '';
        const duration = 2000; // 2 segundos
        const increment = target / (duration / 16); // 60 FPS
        let current = 0;
        
        const updateNumber = () => {
            current += increment;
            if (current < target) {
                metric.textContent = prefix + Math.floor(current) + suffix;
                requestAnimationFrame(updateNumber);
            } else {
                metric.textContent = prefix + target + suffix;
            }
        };
        
        updateNumber();
    });
}

// ===== GRÁFICO DE ROI =====
function initROIChart() {
    if (!DOM.roiChart || typeof Chart === 'undefined') return;
    
    const ctx = DOM.roiChart.getContext('2d');
    
    // Dados do gráfico
    const meses = ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5', 'Mês 6', 'Mês 7', 'Mês 8', 'Mês 9', 'Mês 10', 'Mês 11', 'Mês 12'];
    const investimento = [1500, 3000, 4500, 6000, 7500, 9000, 10500, 12000, 13500, 15000, 16500, 18000];
    const retornoMinimo = [0, 3000, 6500, 10500, 15000, 20000, 26000, 33000, 41000, 50000, 60000, 72000];
    const retornoMaximo = [0, 4500, 9500, 15500, 22500, 31000, 41000, 52500, 65500, 80000, 96000, 114000];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Investimento',
                data: investimento,
                borderColor: '#666',
                backgroundColor: 'rgba(102, 102, 102, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                tension: 0.1
            }, {
                label: 'Retorno Mínimo (5x)',
                data: retornoMinimo,
                borderColor: '#9d4edd',
                backgroundColor: 'rgba(157, 78, 221, 0.1)',
                borderWidth: 3,
                tension: 0.1
            }, {
                label: 'Retorno Máximo (10x)',
                data: retornoMaximo,
                borderColor: '#8a2be2',
                backgroundColor: 'rgba(138, 43, 226, 0.1)',
                borderWidth: 3,
                tension: 0.1,
                fill: '-1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#fff',
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(42, 42, 69, 0.9)',
                    padding: 15,
                    cornerRadius: 10,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += 'R$ ' + context.parsed.y.toLocaleString('pt-BR');
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#b0b0b0',
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#b0b0b0'
                    }
                }
            }
        }
    });
}

// ===== ANALYTICS E TRACKING =====
function trackEvent(category, action, label) {
    // Se Google Analytics estiver presente
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Scroll events (com debounce para performance)
    window.addEventListener('scroll', debounce(() => {
        updateProgressBar();
        handleHeaderScroll();
        updateActiveNavLink();
    }, 10));
    
    // Mobile menu
    if (DOM.mobileMenuBtn) {
        DOM.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Navegação suave
    [...DOM.navLinks, ...DOM.mobileNavLinks].forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                smoothScroll(targetSection, 800);
                closeMobileMenu();
                
                // Track navigation
                trackEvent('Navigation', 'Click', targetId);
            }
        });
    });
    
    // Calculadora
    if (DOM.larguraInput && DOM.alturaInput) {
        DOM.larguraInput.addEventListener('input', calcularValor);
        DOM.alturaInput.addEventListener('input', calcularValor);
        
        // Track calculator usage
        DOM.larguraInput.addEventListener('change', () => {
            trackEvent('Calculator', 'Input', 'Width');
        });
        DOM.alturaInput.addEventListener('change', () => {
            trackEvent('Calculator', 'Input', 'Height');
        });
    }
    
    // ROI Selector
    DOM.roiButtons.forEach(button => {
        button.addEventListener('click', handleROISelection);
        button.addEventListener('click', () => {
            trackEvent('ROI', 'Select Level', button.dataset.level);
        });
    });
    
    // CTA Tracking
    const ctaButton = document.querySelector('.btn-cta');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            trackEvent('CTA', 'Click', 'WhatsApp Contact');
        });
    }
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!DOM.mobileMenu.contains(e.target) && 
            !DOM.mobileMenuBtn.contains(e.target) && 
            DOM.mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Tecla ESC fecha o menu mobile
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

// ===== PERFORMANCE OPTIMIZATION =====
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ===== INICIALIZAÇÃO =====
function init() {
    // Criar partículas
    createParticles();
    
    // Setup observers
    setupIntersectionObserver();
    
    // Setup event listeners
    setupEventListeners();
    
    // Lazy load de imagens
    lazyLoadImages();
    
    // Estado inicial
    updateProgressBar();
    handleHeaderScroll();
    updateActiveNavLink();
    
    // Adiciona classe para JS habilitado
    document.body.classList.add('js-enabled');
    
    // Remove loading state
    document.body.classList.add('loaded');
    
    console.log('IAutomatize Mensalidade - Scripts carregados com sucesso! 🚀');
}

// ===== EXECUÇÃO =====
// Aguarda DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ===== SERVICE WORKER (para PWA futuro) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
            registration => console.log('ServiceWorker registrado:', registration.scope),
            err => console.log('ServiceWorker falhou:', err)
        );
    });
}

// ===== EXPORTAR FUNÇÕES ÚTEIS =====
window.IAutomatize = {
    trackEvent,
    smoothScroll,
    calcularValor
};

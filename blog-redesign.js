/**
 * Blog IAutomatize - JavaScript Principal
 * Versão 2.0 - Redesign Profissional
 */

class BlogManager {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.currentCategory = 'Todos';
        this.isLoading = true;
        this.sitemapCache = null;
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
        this.lastFetch = null;
        
        this.init();
    }

    async init() {
        try {
            // Inicializar componentes
            this.setupEventListeners();
            this.setupScrollEffects();
            this.setupMouseEffects();
            
            // Carregar artigos
            await this.loadArticles();
            
            // Inicializar Spline 3D
            this.initSpline3D();
            
            // Remover loading
            this.setLoading(false);
            
        } catch (error) {
            console.error('Erro ao inicializar blog:', error);
            this.showError();
        }
    }

    // Setup Event Listeners
    setupEventListeners() {
        // Header scroll
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            const header = document.getElementById('header');
            
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });

        // Category filters
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-pill')) {
                this.handleCategoryFilter(e.target);
            }
        });

        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
        }

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // Setup Scroll Effects
    setupScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe elements
        document.querySelectorAll('.article-card, .section-title').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }

    // Setup Mouse Effects
    setupMouseEffects() {
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        const speed = 0.1;

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 100;
            mouseY = (e.clientY / window.innerHeight) * 100;
        });

        const updateMousePosition = () => {
            currentX += (mouseX - currentX) * speed;
            currentY += (mouseY - currentY) * speed;
            
            document.documentElement.style.setProperty('--mouse-x', currentX + '%');
            document.documentElement.style.setProperty('--mouse-y', currentY + '%');
            
            requestAnimationFrame(updateMousePosition);
        };

        updateMousePosition();
    }

    // Initialize Spline 3D
    initSpline3D() {
        const splineContainer = document.getElementById('spline-robot');
        if (!splineContainer) return;

        // Verificar se o Spline está disponível
        if (typeof Spline !== 'undefined') {
            // Adicionar o componente Spline
            // Substitua 'YOUR_SPLINE_URL' pela URL real do seu modelo
            splineContainer.innerHTML = `
                <spline-viewer url="https://prod.spline.design/D6Wx-47ld393GgIL/scene.splinecode"></spline-viewer>
            `;
        } else {
            // Placeholder enquanto não tem a URL do Spline
            splineContainer.innerHTML = `
                <div class="spline-placeholder">
                    <i class="fas fa-robot"></i>
                    <p>Spline 3D Robot</p>
                </div>
            `;
        }
    }

    // Load Articles from Sitemap
    async loadArticles() {
        try {
            const sitemapContent = await this.getSitemapContent();
            const articles = this.parseSitemap(sitemapContent);
            
            this.articles = articles;
            this.filteredArticles = articles;
            
            this.renderArticles();
            
        } catch (error) {
            console.error('Erro ao carregar artigos:', error);
            this.showError();
        }
    }

    // Get Sitemap Content with Cache
    async getSitemapContent() {
        const now = Date.now();
        
        // Check cache
        if (this.sitemapCache && this.lastFetch && (now - this.lastFetch) < this.cacheExpiry) {
            return this.sitemapCache;
        }
        
        try {
            const response = await fetch('sitemap.xml');
            if (!response.ok) throw new Error('Falha ao carregar sitemap');
            
            const text = await response.text();
            
            // Update cache
            this.sitemapCache = text;
            this.lastFetch = now;
            
            return text;
            
        } catch (error) {
            throw error;
        }
    }

    // Parse Sitemap XML
    parseSitemap(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        const urls = xmlDoc.getElementsByTagName("url");
        const articles = [];
        
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const locElement = url.getElementsByTagName("loc")[0];
            const lastmodElement = url.getElementsByTagName("lastmod")[0];
            
            if (locElement) {
                const urlStr = locElement.textContent.trim();
                const lastmod = lastmodElement ? lastmodElement.textContent.trim() : new Date().toISOString().split('T')[0];
                
                // Filter blog articles
                if (urlStr.includes('/blog/') && urlStr.endsWith('.html') && !urlStr.endsWith('/blog.html')) {
                    const pathParts = urlStr.split('/');
                    const filename = pathParts[pathParts.length - 1];
                    const relativeUrl = urlStr.replace('https://iautomatize.com/', '');
                    
                    articles.push({
                        url: relativeUrl,
                        title: this.formatTitle(filename),
                        date: lastmod,
                        category: this.extractCategory(filename),
                        description: this.generateDescription(filename),
                        readTime: Math.floor(Math.random() * 5) + 3
                    });
                }
            }
        }
        
        // Sort by date (newest first)
        return articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Format Title from Filename
    formatTitle(filename) {
        let title = filename.replace('.html', '');
        title = title.replace(/[-_]/g, ' ');
        
        // Capitalize words
        title = title.replace(/\b\w/g, l => l.toUpperCase());
        
        // Lowercase prepositions
        const lowercaseWords = ['de', 'da', 'do', 'e', 'ou', 'a', 'o', 'para', 'com', 'em'];
        title = title.split(' ').map((word, index) => {
            if (index !== 0 && lowercaseWords.includes(word.toLowerCase())) {
                return word.toLowerCase();
            }
            return word;
        }).join(' ');
        
        return title;
    }

    // Extract Category from Title
    extractCategory(filename) {
        const title = filename.toLowerCase();
        const categories = {
            'ia': 'Inteligência Artificial',
            'automacao': 'Automação',
            'automação': 'Automação',
            'digital': 'Transformação Digital',
            'case': 'Cases de Sucesso',
            'tutorial': 'Tutoriais',
            'guia': 'Tutoriais'
        };
        
        for (const [key, value] of Object.entries(categories)) {
            if (title.includes(key)) {
                return value;
            }
        }
        
        return 'Inteligência Artificial';
    }

    // Generate Description
    generateDescription(filename) {
        const title = this.formatTitle(filename);
        const templates = [
            `Descubra como ${title.toLowerCase()} pode transformar seu negócio`,
            `Guia completo sobre ${title.toLowerCase()} para empresas modernas`,
            `Tudo o que você precisa saber sobre ${title.toLowerCase()}`,
            `${title}: conceitos, aplicações e benefícios para sua empresa`,
            `Explore as possibilidades de ${title.toLowerCase()} no mundo digital`
        ];
        
        return templates[Math.floor(Math.random() * templates.length)];
    }

    // Render Articles
    renderArticles() {
        // Featured articles (3 most recent)
        const featuredContainer = document.getElementById('featured-articles');
        const featured = this.filteredArticles.slice(0, 3);
        
        if (featuredContainer && featured.length > 0) {
            featuredContainer.innerHTML = featured.map(article => this.createArticleCard(article)).join('');
        }
        
        // All articles
        const allContainer = document.getElementById('all-articles-grid');
        if (allContainer && this.filteredArticles.length > 0) {
            allContainer.innerHTML = this.filteredArticles.map(article => this.createArticleCard(article)).join('');
        }
        
        // Re-apply scroll effects
        this.setupScrollEffects();
    }

    // Create Article Card HTML
    createArticleCard(article) {
        const formattedDate = new Date(article.date).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        return `
            <article class="article-card" onclick="window.location.href='${article.url}'">
                <div class="article-image">
                    <img 
                        src="https://source.unsplash.com/800x600/?${encodeURIComponent(article.category)},technology,AI"
                        alt="${article.title}"
                        loading="lazy"
                        onerror="this.src='https://via.placeholder.com/800x600/8B5CF6/ffffff?text=IAutomatize'"
                    />
                </div>
                <div class="article-content">
                    <div class="article-meta">
                        <span><i class="far fa-calendar"></i> ${formattedDate}</span>
                        <span><i class="far fa-clock"></i> ${article.readTime} min</span>
                    </div>
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${article.description}</p>
                    <a href="${article.url}" class="article-link" onclick="event.stopPropagation()">
                        Ler artigo <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </article>
        `;
    }

    // Handle Category Filter
    handleCategoryFilter(pill) {
        // Update active state
        document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        
        // Filter articles
        const category = pill.textContent.trim();
        this.currentCategory = category;
        
        if (category === 'Todos') {
            this.filteredArticles = this.articles;
        } else {
            this.filteredArticles = this.articles.filter(article => article.category === category);
        }
        
        // Re-render with animation
        const container = document.getElementById('all-articles-grid');
        if (container) {
            container.style.opacity = '0';
            setTimeout(() => {
                this.renderArticles();
                container.style.opacity = '1';
            }, 300);
        }
    }

    // Handle Newsletter Submit
    async handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const button = form.querySelector('button');
        const input = form.querySelector('input[type="email"]');
        const email = input.value;
        
        // Update button state
        const originalText = button.textContent;
        button.textContent = 'Inscrevendo...';
        button.disabled = true;
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Success state
            button.textContent = 'Inscrito com sucesso!';
            button.style.background = 'rgba(34, 197, 94, 0.3)';
            form.reset();
            
            // Track event
            this.trackEvent('newsletter_signup', { email });
            
            // Reset button
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.disabled = false;
            }, 3000);
            
        } catch (error) {
            // Error state
            button.textContent = 'Erro ao inscrever';
            button.style.background = 'rgba(239, 68, 68, 0.3)';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.disabled = false;
            }, 3000);
        }
    }

    // Track Events
    trackEvent(eventName, eventData) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }
        
        // Custom tracking
        console.log('Track event:', eventName, eventData);
    }

    // Set Loading State
    setLoading(isLoading) {
        this.isLoading = isLoading;
        // Additional loading logic if needed
    }

    // Show Error Message
    showError() {
        const containers = ['featured-articles', 'all-articles-grid'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Ops! Algo deu errado</h3>
                        <p>Não foi possível carregar os artigos. Por favor, tente novamente.</p>
                        <button onclick="location.reload()" class="retry-button">
                            Tentar novamente
                        </button>
                    </div>
                `;
            }
        });
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        // Page load time
        window.addEventListener('load', () => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            this.metrics.pageLoadTime = pageLoadTime;
            
            console.log(`Page loaded in ${pageLoadTime}ms`);
        });

        // First Contentful Paint
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.fcp = entry.startTime;
                        console.log(`FCP: ${entry.startTime}ms`);
                    }
                }
            });
            observer.observe({ entryTypes: ['paint'] });
        }
    }

    getMetrics() {
        return this.metrics;
    }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Blog Manager
    window.blogManager = new BlogManager();
    
    // Initialize Performance Monitor
    window.performanceMonitor = new PerformanceMonitor();
    
    // Add CSS file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'blog-redesign.css';
    document.head.appendChild(link);
    
    console.log('✨ Blog IAutomatize initialized successfully!');
});

// Service Worker Registration (PWA ready)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(error => console.log('ServiceWorker registration failed:', error));
    });
}

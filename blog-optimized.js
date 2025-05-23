/**
 * Blog IAutomatize - JavaScript Otimizado
 * Performance + Acessibilidade + UX + Conversão
 * Versão 3.0 - 2025
 */

// Utilities
const Utils = {
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    },

    // Generate reading time
    generateReadingTime() {
        return Math.floor(Math.random() * 8) + 3;
    },

    // Animate number
    animateNumber(element, start, end, duration = 2000) {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(start + (end - start) * progress);
            element.textContent = value.toLocaleString('pt-BR');
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    },

    // Show toast notification
    showToast(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);
        
        // Show toast
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, duration);
    },

    // Track analytics event
    trackEvent(eventName, eventData = {}) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                custom_parameter_1: eventData.category || 'blog',
                custom_parameter_2: eventData.action || eventName,
                custom_parameter_3: eventData.label || '',
                value: eventData.value || 0
            });
        }

        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', eventName, eventData);
        }

        // Custom analytics
        console.log('📊 Analytics Event:', eventName, eventData);
    }
};

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        // Core Web Vitals
        this.observeWebVitals();
        
        // Custom metrics
        this.observeCustomMetrics();
        
        // Resource timing
        this.observeResourceTiming();
        
        // Navigation timing
        this.observeNavigationTiming();
    }

    observeWebVitals() {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
                Utils.trackEvent('performance_lcp', { value: Math.round(lastEntry.startTime) });
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                    Utils.trackEvent('performance_fid', { value: Math.round(entry.processingStart - entry.startTime) });
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.metrics.cls = clsValue;
                Utils.trackEvent('performance_cls', { value: Math.round(clsValue * 1000) });
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }

    observeCustomMetrics() {
        // Time to Interactive
        window.addEventListener('load', () => {
            const navTiming = performance.getEntriesByType('navigation')[0];
            const tti = navTiming.domInteractive - navTiming.fetchStart;
            this.metrics.tti = tti;
            Utils.trackEvent('performance_tti', { value: Math.round(tti) });
        });

        // First Contentful Paint
        if ('PerformanceObserver' in window) {
            const fcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.fcp = entry.startTime;
                        Utils.trackEvent('performance_fcp', { value: Math.round(entry.startTime) });
                    }
                });
            });
            fcpObserver.observe({ entryTypes: ['paint'] });
        }
    }

    observeResourceTiming() {
        // Monitor slow resources
        const resourceObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.duration > 1000) { // Slow resource (>1s)
                    Utils.trackEvent('performance_slow_resource', {
                        resource: entry.name,
                        duration: Math.round(entry.duration)
                    });
                }
            });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
    }

    observeNavigationTiming() {
        window.addEventListener('load', () => {
            const navTiming = performance.getEntriesByType('navigation')[0];
            const pageLoadTime = navTiming.loadEventEnd - navTiming.fetchStart;
            this.metrics.pageLoadTime = pageLoadTime;
            
            if (pageLoadTime > 3000) { // Slow page load (>3s)
                Utils.trackEvent('performance_slow_page', { 
                    duration: Math.round(pageLoadTime) 
                });
            }
        });
    }

    getMetrics() {
        return this.metrics;
    }
}

// Reading Progress Bar
class ReadingProgress {
    constructor() {
        this.progressBar = document.getElementById('reading-progress');
        this.init();
    }

    init() {
        if (!this.progressBar) return;

        const updateProgress = Utils.throttle(() => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            this.progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
            this.progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
        }, 16);

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }
}

// Intersection Observer for animations
class AnimationObserver {
    constructor() {
        this.init();
    }

    init() {
        const observerOptions = {
            threshold: [0.1, 0.3, 0.5],
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target, entry.intersectionRatio);
                }
            });
        }, observerOptions);

        // Observe elements
        this.observeElements();
    }

    observeElements() {
        const elements = document.querySelectorAll([
            '.article-card',
            '.section-title',
            '.hero-content',
            '.social-proof',
            '.newsletter-box',
            '.proof-number'
        ].join(', '));

        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            this.observer.observe(el);
        });
    }

    animateElement(element, ratio) {
        const delay = Array.from(element.parentElement?.children || []).indexOf(element) * 100;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';

            // Animate numbers
            if (element.classList.contains('proof-number')) {
                const targetNumber = parseInt(element.textContent.replace(/\D/g, ''));
                if (targetNumber) {
                    Utils.animateNumber(element, 0, targetNumber, 2000);
                }
            }
        }, delay);

        // Stop observing after animation
        this.observer.unobserve(element);
    }
}

// Advanced Search
class BlogSearch {
    constructor() {
        this.searchInput = document.getElementById('search-articles');
        this.searchBtn = document.querySelector('.search-btn');
        this.articles = [];
        this.filteredArticles = [];
        this.init();
    }

    init() {
        if (!this.searchInput) return;

        const debouncedSearch = Utils.debounce((query) => {
            this.performSearch(query);
        }, 300);

        this.searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });

        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(e.target.value);
            }
        });

        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => {
                this.performSearch(this.searchInput.value);
            });
        }
    }

    setArticles(articles) {
        this.articles = articles;
        this.filteredArticles = articles;
    }

    performSearch(query) {
        const trimmedQuery = query.trim().toLowerCase();
        
        if (!trimmedQuery) {
            this.filteredArticles = this.articles;
        } else {
            this.filteredArticles = this.articles.filter(article => {
                return article.title.toLowerCase().includes(trimmedQuery) ||
                       article.description.toLowerCase().includes(trimmedQuery) ||
                       article.category.toLowerCase().includes(trimmedQuery);
            });
        }

        // Trigger custom event
        window.dispatchEvent(new CustomEvent('searchComplete', {
            detail: { 
                query: trimmedQuery, 
                results: this.filteredArticles,
                total: this.articles.length 
            }
        }));

        // Track search
        if (trimmedQuery) {
            Utils.trackEvent('blog_search', {
                query: trimmedQuery,
                results: this.filteredArticles.length
            });
        }
    }

    getFilteredArticles() {
        return this.filteredArticles;
    }
}

// Category Filter
class CategoryFilter {
    constructor() {
        this.pills = document.querySelectorAll('.category-pill');
        this.currentCategory = 'Todos';
        this.init();
    }

    init() {
        this.pills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                this.handleCategoryChange(e.target);
            });

            pill.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleCategoryChange(e.target);
                }
            });
        });
    }

    handleCategoryChange(pill) {
        // Update active state
        this.pills.forEach(p => {
            p.classList.remove('active');
            p.setAttribute('aria-selected', 'false');
        });
        
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');
        
        const category = pill.getAttribute('data-category') || pill.textContent.trim();
        this.currentCategory = category;

        // Trigger custom event
        window.dispatchEvent(new CustomEvent('categoryChanged', {
            detail: { category }
        }));

        // Track category change
        Utils.trackEvent('category_filter', {
            category: category,
            previous: this.currentCategory
        });

        // Announce to screen readers
        const announcement = `Filtrando por categoria: ${category}`;
        this.announceToScreenReader(announcement);
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    getCurrentCategory() {
        return this.currentCategory;
    }
}

// Blog Manager Principal
class BlogManager {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.displayedArticles = [];
        this.articlesPerPage = 6;
        this.currentPage = 1;
        this.isLoading = false;
        this.sitemapCache = null;
        this.cacheExpiry = 10 * 60 * 1000; // 10 minutes
        this.lastFetch = null;
        
        // Components
        this.search = new BlogSearch();
        this.categoryFilter = new CategoryFilter();
        
        this.init();
    }

    async init() {
        try {
            // Setup event listeners
            this.setupEventListeners();
            
            // Load articles
            await this.loadArticles();
            
            // Initialize components
            this.initializeComponents();
            
            // Setup lazy loading
            this.setupLazyLoading();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar blog manager:', error);
            this.showError();
        }
    }

    setupEventListeners() {
        // Search events
        window.addEventListener('searchComplete', (e) => {
            this.handleSearchResults(e.detail);
        });

        // Category filter events
        window.addEventListener('categoryChanged', (e) => {
            this.handleCategoryFilter(e.detail.category);
        });

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreArticles();
            });
        }

        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                this.handleNewsletterSubmit(e);
            });
        }

        // Exit intent modal
        this.setupExitIntent();
    }

    async loadArticles() {
        try {
            this.setLoading(true);
            const sitemapContent = await this.getSitemapContent();
            const articles = this.parseSitemap(sitemapContent);
            
            this.articles = articles;
            this.filteredArticles = articles;
            this.search.setArticles(articles);
            
            this.renderArticles();
            
        } catch (error) {
            console.error('❌ Erro ao carregar artigos:', error);
            this.showError();
        } finally {
            this.setLoading(false);
        }
    }

    async getSitemapContent() {
        const now = Date.now();
        
        // Check cache
        if (this.sitemapCache && this.lastFetch && (now - this.lastFetch) < this.cacheExpiry) {
            return this.sitemapCache;
        }
        
        try {
            const response = await fetch('sitemap.xml', {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const text = await response.text();
            
            // Update cache
            this.sitemapCache = text;
            this.lastFetch = now;
            
            return text;
            
        } catch (error) {
            throw new Error(`Falha ao carregar sitemap: ${error.message}`);
        }
    }

    parseSitemap(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            
            // Check for parsing errors
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                throw new Error('Erro ao parsear XML do sitemap');
            }
            
            const urls = xmlDoc.getElementsByTagName("url");
            const articles = [];
            
            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                const locElement = url.getElementsByTagName("loc")[0];
                const lastmodElement = url.getElementsByTagName("lastmod")[0];
                
                if (locElement) {
                    const urlStr = locElement.textContent.trim();
                    const lastmod = lastmodElement ? 
                        lastmodElement.textContent.trim() : 
                        new Date().toISOString().split('T')[0];
                    
                    // Filter blog articles
                    if (this.isBlogArticle(urlStr)) {
                        const pathParts = urlStr.split('/');
                        const filename = pathParts[pathParts.length - 1];
                        const relativeUrl = urlStr.replace('https://iautomatize.com/', '');
                        
                        const article = {
                            url: relativeUrl,
                            title: this.formatTitle(filename),
                            date: lastmod,
                            category: this.extractCategory(filename),
                            description: this.generateDescription(filename),
                            readTime: Utils.generateReadingTime(),
                            filename: filename
                        };

                        articles.push(article);
                    }
                }
            }
            
            // Sort by date (newest first)
            return articles.sort((a, b) => new Date(b.date) - new Date(a.date));
            
        } catch (error) {
            throw new Error(`Erro ao processar sitemap: ${error.message}`);
        }
    }

    isBlogArticle(url) {
        return url.includes('/blog/') && 
               url.endsWith('.html') && 
               !url.endsWith('/blog.html') &&
               !url.includes('index.html');
    }

    formatTitle(filename) {
        let title = filename.replace('.html', '');
        title = title.replace(/[-_]/g, ' ');
        
        // Capitalize words
        title = title.replace(/\b\w/g, l => l.toUpperCase());
        
        // Lowercase prepositions
        const lowercaseWords = ['De', 'Da', 'Do', 'E', 'Ou', 'A', 'O', 'Para', 'Com', 'Em', 'No', 'Na'];
        title = title.split(' ').map((word, index) => {
            if (index !== 0 && lowercaseWords.includes(word)) {
                return word.toLowerCase();
            }
            return word;
        }).join(' ');
        
        return title;
    }

    extractCategory(filename) {
        const title = filename.toLowerCase();
        const categories = {
            'ia-': 'Inteligência Artificial',
            'automacao': 'Automação',
            'automação': 'Automação',
            'digital': 'Transformação Digital',
            'case-': 'Cases de Sucesso',
            'tutorial': 'Tutoriais',
            'guia': 'Tutoriais',
            'ai-': 'Inteligência Artificial',
            'artificial': 'Inteligência Artificial',
            'automation': 'Automação',
            'chatbot': 'Inteligência Artificial',
            'ml-': 'Inteligência Artificial',
            'machine-learning': 'Inteligência Artificial'
        };
        
        for (const [key, value] of Object.entries(categories)) {
            if (title.includes(key)) {
                return value;
            }
        }
        
        return 'Inteligência Artificial';
    }

    generateDescription(filename) {
        const title = this.formatTitle(filename);
        const templates = [
            `Descubra como ${title.toLowerCase()} pode revolucionar seu negócio`,
            `Guia completo sobre ${title.toLowerCase()} para empresas modernas`,
            `Tudo o que você precisa saber sobre ${title.toLowerCase()}`,
            `${title}: conceitos, aplicações e benefícios práticos`,
            `Explore as possibilidades de ${title.toLowerCase()} no mundo digital`,
            `Como implementar ${title.toLowerCase()} de forma eficiente`,
            `Estratégias avançadas de ${title.toLowerCase()} para resultados`
        ];
        
        return templates[Math.floor(Math.random() * templates.length)];
    }

    handleSearchResults(data) {
        this.filteredArticles = data.results;
        this.currentPage = 1;
        this.displayedArticles = [];
        this.renderArticles();

        // Show search feedback
        const resultsText = data.results.length === 1 ? 
            '1 artigo encontrado' : 
            `${data.results.length} artigos encontrados`;
        
        if (data.query) {
            Utils.showToast(`${resultsText} para "${data.query}"`, 'info');
        }
    }

    handleCategoryFilter(category) {
        if (category === 'Todos') {
            this.filteredArticles = this.articles;
        } else {
            this.filteredArticles = this.articles.filter(article => 
                article.category === category
            );
        }

        this.currentPage = 1;
        this.displayedArticles = [];
        this.renderArticles();
    }

    renderArticles() {
        const articlesToShow = this.filteredArticles.slice(0, this.currentPage * this.articlesPerPage);
        this.displayedArticles = articlesToShow;

        // Featured articles (first 3)
        this.renderFeaturedArticles(articlesToShow.slice(0, 3));
        
        // All articles
        this.renderAllArticles(articlesToShow);
        
        // Update load more button
        this.updateLoadMoreButton();
        
        // Update search results count
        this.updateResultsCount();
    }

    renderFeaturedArticles(articles) {
        const container = document.getElementById('featured-articles');
        if (!container) return;

        if (articles.length === 0) {
            container.innerHTML = '<p class="no-results">Nenhum artigo encontrado.</p>';
            return;
        }

        const html = articles.map(article => this.createArticleCard(article, true)).join('');
        
        // Smooth transition
        container.style.opacity = '0';
        container.innerHTML = html;
        
        requestAnimationFrame(() => {
            container.style.opacity = '1';
            this.setupLazyLoading();
        });
    }

    renderAllArticles(articles) {
        const container = document.getElementById('all-articles-grid');
        if (!container) return;

        if (articles.length === 0) {
            container.innerHTML = '<p class="no-results">Nenhum artigo encontrado.</p>';
            return;
        }

        const html = articles.map(article => this.createArticleCard(article)).join('');
        
        // Smooth transition
        container.style.opacity = '0';
        container.innerHTML = html;
        
        requestAnimationFrame(() => {
            container.style.opacity = '1';
            this.setupLazyLoading();
        });
    }

    createArticleCard(article, isFeatured = false) {
        const formattedDate = Utils.formatDate(article.date);
        const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(article.category)},technology,AI`;
        
        return `
            <article class="article-card" 
                     data-category="${article.category}"
                     role="article"
                     aria-labelledby="title-${article.filename}"
                     tabindex="0">
                <div class="article-image">
                    <img 
                        data-src="${imageUrl}"
                        alt="Ilustração sobre ${article.title}"
                        class="lazy-image"
                        loading="lazy"
                        width="800"
                        height="600"
                    />
                </div>
                <div class="article-content">
                    <div class="article-meta">
                        <span aria-label="Data de publicação">
                            <i class="far fa-calendar" aria-hidden="true"></i> 
                            <time datetime="${article.date}">${formattedDate}</time>
                        </span>
                        <span aria-label="Tempo de leitura">
                            <i class="far fa-clock" aria-hidden="true"></i> 
                            ${article.readTime} min
                        </span>
                    </div>
                    <h3 id="title-${article.filename}" class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${article.description}</p>
                    <a href="${article.url}" 
                       class="article-link" 
                       aria-label="Ler artigo: ${article.title}">
                        Ler artigo <i class="fas fa-arrow-right" aria-hidden="true"></i>
                    </a>
                </div>
            </article>
        `;
    }

    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for browsers without IntersectionObserver
            document.querySelectorAll('.lazy-image').forEach(img => {
                this.loadImage(img);
            });
            return;
        }

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    imageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        document.querySelectorAll('.lazy-image').forEach(img => {
            imageObserver.observe(img);
        });
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (src) {
            img.src = src;
            img.onload = () => {
                img.classList.add('loaded');
            };
            img.onerror = () => {
                img.src = 'https://via.placeholder.com/800x600/8B5CF6/ffffff?text=IAutomatize';
                img.classList.add('loaded');
            };
        }
    }

    loadMoreArticles() {
        this.currentPage++;
        Utils.trackEvent('load_more_articles', { page: this.currentPage });
        this.renderArticles();
    }

    updateLoadMoreButton() {
        const button = document.getElementById('load-more-btn');
        if (!button) return;

        const hasMore = this.displayedArticles.length < this.filteredArticles.length;
        
        if (hasMore) {
            button.style.display = 'flex';
            const remaining = this.filteredArticles.length - this.displayedArticles.length;
            button.innerHTML = `
                Carregar mais artigos (${remaining})
                <i class="fas fa-chevron-down" aria-hidden="true"></i>
            `;
        } else {
            button.style.display = 'none';
        }
    }

    updateResultsCount() {
        // Update screen reader announcement
        const total = this.filteredArticles.length;
        const displayed = this.displayedArticles.length;
        
        const announcement = `Mostrando ${displayed} de ${total} artigos`;
        this.announceToScreenReader(announcement);
    }

    announceToScreenReader(message) {
        const existing = document.querySelector('.search-announcement');
        if (existing) {
            existing.remove();
        }

        const announcement = document.createElement('div');
        announcement.className = 'search-announcement sr-only';
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 3000);
    }

    async handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const emailInput = form.querySelector('#newsletter-email');
        const button = form.querySelector('.newsletter-button');
        const errorDiv = form.querySelector('#email-error');
        const email = emailInput.value.trim();
        
        // Clear previous errors
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
        emailInput.classList.remove('error');
        
        // Validate email
        if (!this.validateEmail(email)) {
            this.showFieldError(emailInput, errorDiv, 'Por favor, insira um email válido');
            return;
        }
        
        // Update button state
        const originalText = button.querySelector('.btn-text').textContent;
        button.querySelector('.btn-text').textContent = 'Inscrevendo...';
        button.disabled = true;
        
        try {
            // Simulate API call
            await this.subscribeNewsletter(email);
            
            // Success state
            button.querySelector('.btn-text').textContent = '✓ Inscrito!';
            button.style.background = 'rgba(16, 185, 129, 0.3)';
            form.reset();
            
            // Show success message
            Utils.showToast('🎉 Inscrição realizada com sucesso!', 'success');
            
            // Track successful subscription
            Utils.trackEvent('newsletter_signup', {
                email: email,
                source: 'blog_newsletter'
            });
            
            // Reset button after delay
            setTimeout(() => {
                button.querySelector('.btn-text').textContent = originalText;
                button.style.background = '';
                button.disabled = false;
            }, 3000);
            
        } catch (error) {
            // Error state
            button.querySelector('.btn-text').textContent = 'Erro ao inscrever';
            button.style.background = 'rgba(239, 68, 68, 0.3)';
            
            Utils.showToast('❌ Erro ao realizar inscrição. Tente novamente.', 'error');
            
            // Reset button after delay
            setTimeout(() => {
                button.querySelector('.btn-text').textContent = originalText;
                button.style.background = '';
                button.disabled = false;
            }, 3000);
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showFieldError(input, errorDiv, message) {
        input.classList.add('error');
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        input.focus();
        
        // Remove error after user starts typing
        input.addEventListener('input', () => {
            input.classList.remove('error');
            errorDiv.classList.remove('show');
        }, { once: true });
    }

    async subscribeNewsletter(email) {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Erro do servidor'));
                }
            }, 1500);
        });
    }

    setupExitIntent() {
        let exitShown = false;
        const modal = document.getElementById('exit-intent-modal');
        const closeBtn = modal?.querySelector('.modal-close');
        const exitForm = document.getElementById('exit-form');
        
        if (!modal) return;

        // Show modal on exit intent
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY <= 0 && !exitShown && window.scrollY > 1000) {
                this.showExitModal();
                exitShown = true;
            }
        });

        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideExitModal();
            });
        }

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideExitModal();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.hideExitModal();
            }
        });

        // Handle form submission
        if (exitForm) {
            exitForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = exitForm.querySelector('input[type="email"]').value;
                
                try {
                    await this.subscribeNewsletter(email);
                    Utils.showToast('🎁 Guia enviado para seu email!', 'success');
                    Utils.trackEvent('exit_intent_conversion', { email });
                    this.hideExitModal();
                } catch (error) {
                    Utils.showToast('❌ Erro ao enviar guia. Tente novamente.', 'error');
                }
            });
        }
    }

    showExitModal() {
        const modal = document.getElementById('exit-intent-modal');
        if (modal) {
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            
            // Focus management
            const firstInput = modal.querySelector('input[type="email"]');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
            
            Utils.trackEvent('exit_intent_shown');
        }
    }

    hideExitModal() {
        const modal = document.getElementById('exit-intent-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    initializeComponents() {
        // Initialize Spline 3D
        this.initSpline3D();
        
        // Setup article click handlers
        this.setupArticleClickHandlers();
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
    }

    initSpline3D() {
        const splineContainer = document.getElementById('spline-robot');
        if (!splineContainer) return;

        // Check if Spline viewer is available
        if (typeof window.customElements !== 'undefined' && customElements.get('spline-viewer')) {
            // Replace with actual Spline URL when available
            splineContainer.innerHTML = `
                <spline-viewer 
                    url="https://prod.spline.design/your-robot-scene-url"
                    loading-anim-type="spinner-small-light">
                </spline-viewer>
            `;
        } else {
            // Enhanced placeholder
            splineContainer.innerHTML = `
                <div class="spline-placeholder">
                    <div class="robot-animation">
                        <i class="fas fa-robot"></i>
                        <div class="pulse-ring"></div>
                        <div class="pulse-ring delay-1"></div>
                        <div class="pulse-ring delay-2"></div>
                    </div>
                    <p>Robô 3D Interativo</p>
                </div>
            `;
        }
    }

    setupArticleClickHandlers() {
        document.addEventListener('click', (e) => {
            const articleCard = e.target.closest('.article-card');
            if (articleCard && !e.target.closest('.article-link')) {
                const link = articleCard.querySelector('.article-link');
                if (link) {
                    Utils.trackEvent('article_card_click', {
                        url: link.href,
                        title: articleCard.querySelector('.article-title').textContent
                    });
                    window.location.href = link.href;
                }
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const articleCard = e.target.closest('.article-card');
            if (articleCard && e.key === 'Enter') {
                const link = articleCard.querySelector('.article-link');
                if (link) {
                    link.click();
                }
            }
        });
    }

    setLoading(isLoading) {
        this.isLoading = isLoading;
        
        const skeletons = document.querySelectorAll('.skeleton');
        const containers = document.querySelectorAll('#featured-articles, #all-articles-grid');
        
        if (isLoading) {
            skeletons.forEach(skeleton => {
                skeleton.style.display = 'block';
            });
        } else {
            skeletons.forEach(skeleton => {
                skeleton.style.display = 'none';
            });
        }
    }

    showError() {
        const containers = ['featured-articles', 'all-articles-grid'];
        containers.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div class="error-message" role="alert">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Ops! Algo deu errado</h3>
                        <p>Não foi possível carregar os artigos. Verifique sua conexão e tente novamente.</p>
                        <button onclick="location.reload()" class="retry-button">
                            <i class="fas fa-redo"></i>
                            Tentar novamente
                        </button>
                    </div>
                `;
            }
        });
    }
}

// Header and Navigation
class HeaderManager {
    constructor() {
        this.header = document.getElementById('header');
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.navLinks = document.querySelector('.nav-links');
        this.lastScroll = 0;
        this.init();
    }

    init() {
        this.setupScrollEffect();
        this.setupMobileMenu();
        this.setupSmoothScroll();
    }

    setupScrollEffect() {
        const handleScroll = Utils.throttle(() => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
            
            this.lastScroll = currentScroll;
        }, 16);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    setupMobileMenu() {
        if (!this.mobileMenuBtn) return;

        this.mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = this.mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            
            this.mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            this.navLinks.classList.toggle('show');
            
            // Update icon
            const icon = this.mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.className = isExpanded ? 'fas fa-bars' : 'fas fa-times';
            }
        });

        // Close mobile menu on link click
        this.navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
                this.navLinks.classList.remove('show');
                
                const icon = this.mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-bars';
                }
            }
        });
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    e.preventDefault();
                    const headerHeight = this.header.offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without jumping
                    history.pushState(null, null, targetId);
                }
            });
        });
    }
}

// Mouse Effects
class MouseEffects {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.speed = 0.1;
        this.init();
    }

    init() {
        this.setupMouseTracking();
        this.startAnimation();
        this.setupHoverEffects();
    }

    setupMouseTracking() {
        const updateMousePosition = Utils.throttle((e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 100;
            this.mouseY = (e.clientY / window.innerHeight) * 100;
        }, 16);

        document.addEventListener('mousemove', updateMousePosition, { passive: true });
    }

    startAnimation() {
        const animate = () => {
            this.currentX += (this.mouseX - this.currentX) * this.speed;
            this.currentY += (this.mouseY - this.currentY) * this.speed;
            
            document.documentElement.style.setProperty('--mouse-x', this.currentX + '%');
            document.documentElement.style.setProperty('--mouse-y', this.currentY + '%');
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    setupHoverEffects() {
        // Enhanced button hover effects
        document.querySelectorAll('button, .article-card, .category-pill').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-2px)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = '';
            });
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize core components
        window.performanceMonitor = new PerformanceMonitor();
        window.readingProgress = new ReadingProgress();
        window.animationObserver = new AnimationObserver();
        window.blogManager = new BlogManager();
        window.headerManager = new HeaderManager();
        window.mouseEffects = new MouseEffects();
        
        console.log('✨ Blog IAutomatize inicializado com sucesso!');
        
        // Track page view
        Utils.trackEvent('page_view', {
            page: 'blog',
            url: window.location.href,
            referrer: document.referrer
        });
        
    } catch (error) {
        console.error('❌ Erro ao inicializar blog:', error);
        
        // Show fallback content
        const containers = document.querySelectorAll('#featured-articles, #all-articles-grid');
        containers.forEach(container => {
            if (container) {
                container.innerHTML = `
                    <div class="error-message">
                        <h3>Erro de carregamento</h3>
                        <p>Ocorreu um erro ao inicializar o blog. Recarregue a página para tentar novamente.</p>
                        <button onclick="location.reload()">Recarregar página</button>
                    </div>
                `;
            }
        });
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ ServiceWorker registrado:', registration.scope);
            
            Utils.trackEvent('service_worker_registered');
        } catch (error) {
            console.log('❌ Falha no registro do ServiceWorker:', error);
        }
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Utils,
        BlogManager,
        PerformanceMonitor,
        ReadingProgress,
        AnimationObserver
    };
}
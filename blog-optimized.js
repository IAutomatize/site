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
        if (!container) {
            console.warn('Toast container not found');
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`; // Você precisará de estilos CSS para .toast e .toast.success/error/info
        
        // Aplicando estilos inspirados em produtos.css (showToast)
        let bgColor = '#8B5CF6'; // Padrão info (roxo)
        if (type === 'success') bgColor = '#10B981'; // Verde
        if (type === 'error') bgColor = '#EF4444'; // Vermelho

        toast.style.cssText = `
            background: ${bgColor};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transform: translateX(110%); /* Começa fora da tela */
            transition: transform 0.3s ease, opacity 0.3s ease;
            opacity: 0;
            margin-bottom: 10px; /* Espaçamento entre toasts */
        `;
        
        const iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        toast.innerHTML = `
            <i class="fas ${iconClass}" style="margin-right: 8px;"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);
        
        // Show toast
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Remove toast
        setTimeout(() => {
            toast.style.transform = 'translateX(110%)';
            toast.style.opacity = '0';
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
        this.observeWebVitals();
        this.observeCustomMetrics();
        this.observeResourceTiming();
        this.observeNavigationTiming();
    }

    observeWebVitals() {
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
                Utils.trackEvent('performance_lcp', { value: Math.round(lastEntry.startTime) });
            });
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                    Utils.trackEvent('performance_fid', { value: Math.round(entry.processingStart - entry.startTime) });
                });
            });
            fidObserver.observe({ type: 'first-input', buffered: true });

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
            clsObserver.observe({ type: 'layout-shift', buffered: true });
        }
    }

    observeCustomMetrics() {
        window.addEventListener('load', () => {
            if (performance.getEntriesByType('navigation').length > 0) {
                const navTiming = performance.getEntriesByType('navigation')[0];
                const tti = navTiming.domInteractive - navTiming.fetchStart;
                this.metrics.tti = tti;
                Utils.trackEvent('performance_tti', { value: Math.round(tti) });
            }
        });

        if ('PerformanceObserver' in window) {
            const fcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.fcp = entry.startTime;
                        Utils.trackEvent('performance_fcp', { value: Math.round(entry.startTime) });
                        fcpObserver.disconnect(); // Observar apenas uma vez
                    }
                });
            });
            fcpObserver.observe({ type: 'paint', buffered: true });
        }
    }

    observeResourceTiming() {
        if ('PerformanceObserver' in window) {
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
            resourceObserver.observe({ type: 'resource', buffered: true });
        }
    }

    observeNavigationTiming() {
        window.addEventListener('load', () => {
            if (performance.getEntriesByType('navigation').length > 0) {
                const navTiming = performance.getEntriesByType('navigation')[0];
                const pageLoadTime = navTiming.loadEventEnd - navTiming.fetchStart;
                this.metrics.pageLoadTime = pageLoadTime;
                
                if (pageLoadTime > 3000) { // Slow page load (>3s)
                    Utils.trackEvent('performance_slow_page', { 
                        duration: Math.round(pageLoadTime) 
                    });
                }
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
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            ) - window.innerHeight;
            
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            
            this.progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
            this.progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
        }, 16);

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress(); // Initial call
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

        this.observeElements();
    }

    observeElements() {
        const elements = document.querySelectorAll([
            '.article-card', // Os cartões de artigo
            '.section-title',
            '.hero-content', // Conteúdo do Hero
            '.social-proof', // Prova social
            '.newsletter-box', // Caixa da newsletter
            '.proof-number' // Números da prova social
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

            if (element.classList.contains('proof-number')) {
                const targetNumber = parseInt(element.getAttribute('data-count') || element.textContent.replace(/\D/g, ''));
                if (!isNaN(targetNumber)) {
                    Utils.animateNumber(element, 0, targetNumber, 2000);
                }
            }
        }, delay);

        this.observer.unobserve(element);
    }
}

// Advanced Search
class BlogSearch {
    constructor() {
        this.searchInput = document.getElementById('search-articles');
        this.searchBtn = document.querySelector('.search-btn'); // Se você tiver um botão de busca explícito
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
                       (article.description && article.description.toLowerCase().includes(trimmedQuery)) ||
                       article.category.toLowerCase().includes(trimmedQuery);
            });
        }

        window.dispatchEvent(new CustomEvent('searchComplete', {
            detail: { 
                query: trimmedQuery, 
                results: this.filteredArticles,
                total: this.articles.length 
            }
        }));

        if (trimmedQuery) {
            Utils.trackEvent('blog_search', {
                query: trimmedQuery,
                results_count: this.filteredArticles.length
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
        this.pillsContainer = document.getElementById('category-pills');
        this.currentCategory = 'Todos'; // Categoria padrão
        this.init();
    }

    init() {
        if (!this.pillsContainer) return;

        // As pills são adicionadas dinamicamente pelo BlogManager,
        // então o listener é no container.
        this.pillsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-pill') || e.target.closest('.category-pill')) {
                const pill = e.target.closest('.category-pill');
                this.handleCategoryChange(pill);
            }
        });
        
        this.pillsContainer.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && (e.target.classList.contains('category-pill') || e.target.closest('.category-pill'))) {
                e.preventDefault();
                const pill = e.target.closest('.category-pill');
                this.handleCategoryChange(pill);
            }
        });
    }
    
    // Método para renderizar as pills, chamado pelo BlogManager
    renderPills(categories) {
        if (!this.pillsContainer) return;
        // Adiciona "Todos" se não estiver presente e define como padrão
        const allCategories = ['Todos', ...new Set(categories)];
        
        this.pillsContainer.innerHTML = allCategories.map(category => `
            <button 
                class="category-pill category-btn ${this.currentCategory === category ? 'active' : ''}" 
                data-category="${category}"
                role="tab"
                aria-selected="${this.currentCategory === category}"
                tabindex="${this.currentCategory === category ? '0' : '-1'}">
                ${category}
            </button>
        `).join('');
    }


    handleCategoryChange(pill) {
        if (!pill) return;
        
        this.pillsContainer.querySelectorAll('.category-pill').forEach(p => {
            p.classList.remove('active');
            p.setAttribute('aria-selected', 'false');
            p.setAttribute('tabindex', '-1');
        });
        
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');
        pill.setAttribute('tabindex', '0');
        
        const category = pill.getAttribute('data-category') || pill.textContent.trim();
        const previousCategory = this.currentCategory;
        this.currentCategory = category;

        window.dispatchEvent(new CustomEvent('categoryChanged', {
            detail: { category }
        }));

        Utils.trackEvent('category_filter', {
            category: category,
            previous_category: previousCategory
        });

        this.announceToScreenReader(`Filtrando por categoria: ${category}`);
    }

    announceToScreenReader(message) {
        let announcement = document.querySelector('.sr-announcement');
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.className = 'sr-only sr-announcement'; // sr-only para ser lido apenas por leitores de tela
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            document.body.appendChild(announcement);
        }
        announcement.textContent = message;
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
        this.cacheExpiry = 10 * 60 * 1000; // 10 minutos
        this.lastFetch = null;
        
        this.search = new BlogSearch();
        this.categoryFilter = new CategoryFilter();
        
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadArticles(); // Isso vai popular this.articles
            
            // Extrai categorias dos artigos carregados e renderiza as pills
            const articleCategories = [...new Set(this.articles.map(article => article.category))];
            this.categoryFilter.renderPills(articleCategories);

            this.initializeComponents(); // Isso inclui o search.setArticles
            this.setupLazyLoading();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar blog manager:', error);
            this.showError();
        }
    }

    setupEventListeners() {
        window.addEventListener('searchComplete', (e) => {
            this.handleSearchResults(e.detail);
        });

        window.addEventListener('categoryChanged', (e) => {
            this.handleCategoryFilter(e.detail.category);
        });

        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreArticles();
            });
        }

        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                this.handleNewsletterSubmit(e);
            });
        }
        this.setupExitIntent();
    }

    async loadArticles() {
        try {
            this.setLoading(true);
            const sitemapContent = await this.getSitemapContent();
            const articles = this.parseSitemap(sitemapContent);
            
            this.articles = articles;
            this.filteredArticles = articles; // Inicialmente, todos os artigos são filtrados
            
            // IMPORTANTE: Passa os artigos para o componente de busca APÓS o carregamento
            this.search.setArticles(articles); 
            
            this.renderArticles(); // Renderiza os artigos iniciais
            
        } catch (error) {
            console.error('❌ Erro ao carregar artigos:', error);
            this.showError(); // Mostra erro na UI
            throw error; // Propaga o erro para o init saber
        } finally {
            this.setLoading(false);
        }
    }

    async getSitemapContent() {
        const now = Date.now();
        if (this.sitemapCache && this.lastFetch && (now - this.lastFetch) < this.cacheExpiry) {
            return this.sitemapCache;
        }
        
        try {
            // Usar GitHub raw content - não precisa de CORS
            const response = await fetch('https://raw.githubusercontent.com/IAutomatize/site/main/sitemap.xml', { // Certifique-se que este é o caminho CORRETO e PÚBLICO do seu sitemap
                cache: 'no-cache' 
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText} ao buscar sitemap.xml. Verifique a URL e se o arquivo é público.`);
            }
            
            const text = await response.text();
            this.sitemapCache = text;
            this.lastFetch = now;
            return text;
            
        } catch (error) {
            console.error('Falha ao carregar sitemap.xml:', error);
            throw new Error(`Falha ao carregar sitemap: ${error.message}`);
        }
    }

    parseSitemap(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                console.error('Erro de Parse XML:', parseError.textContent);
                throw new Error('Erro ao parsear XML do sitemap. Verifique o console para detalhes.');
            }
            
            const urls = xmlDoc.getElementsByTagName("url");
            const articles = [];
            
            for (let i = 0; i < urls.length; i++) {
                const urlNode = urls[i];
                const locElement = urlNode.getElementsByTagName("loc")[0];
                const lastmodElement = urlNode.getElementsByTagName("lastmod")[0];
                // Adicione outros campos que você possa ter no sitemap, como <image:loc>, <news:publication_date> etc.
                
                if (locElement) {
                    const urlStr = locElement.textContent.trim();
                    // Defina uma data padrão se lastmod não existir
                    const lastmod = lastmodElement ? lastmodElement.textContent.trim() : new Date().toISOString().split('T')[0];
                    
                    if (this.isBlogArticle(urlStr)) {
                        const pathParts = urlStr.split('/');
                        const filenameWithExtension = pathParts[pathParts.length - 1];
                        const filename = filenameWithExtension.replace('.html', ''); // Remove .html
                        // const relativeUrl = urlStr.startsWith('https://iautomatize.com/') ? urlStr.substring('https://iautomatize.com/'.length) : urlStr;
                        const relativeUrl = urlStr; // Use a URL completa do sitemap


                        // Tenta extrair título e descrição de forma mais inteligente se possível
                        // Por enquanto, usando a lógica original
                        const article = {
                            url: relativeUrl,
                            title: this.formatTitle(filename),
                            date: lastmod,
                            category: this.extractCategory(filename), // Ou de uma tag específica no sitemap se houver
                            description: this.generateDescription(filename), // Ou de uma tag específica no sitemap
                            readTime: Utils.generateReadingTime(),
                            filename: filenameWithExtension // Mantém a extensão para IDs únicos se necessário
                        };
                        articles.push(article);
                    }
                }
            }
            return articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Erro ao processar sitemap:', error);
            throw new Error(`Erro ao processar sitemap: ${error.message}`);
        }
    }

    isBlogArticle(url) {
        // Ajuste esta lógica conforme a estrutura das URLs dos seus artigos no sitemap
        return url.includes('/blog/') && url.endsWith('.html') && !url.endsWith('/blog.html') && !url.includes('index.html');
    }

    formatTitle(filename) {
        let title = filename.replace('.html', '');
        title = title.replace(/[-_]/g, ' ');
        title = title.replace(/\b\w/g, l => l.toUpperCase());
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
            'ia-': 'Inteligência Artificial', 'automacao': 'Automação', 'automação': 'Automação',
            'digital': 'Transformação Digital', 'case-': 'Cases de Sucesso', 'tutorial': 'Tutoriais',
            'guia': 'Tutoriais', 'ai-': 'Inteligência Artificial', 'artificial': 'Inteligência Artificial',
            'automation': 'Automação', 'chatbot': 'Inteligência Artificial', 'ml-': 'Inteligência Artificial',
            'machine-learning': 'Inteligência Artificial'
        };
        for (const [key, value] of Object.entries(categories)) {
            if (title.includes(key)) return value;
        }
        return 'Tecnologia'; // Categoria padrão
    }

    generateDescription(filename) {
        const title = this.formatTitle(filename);
        const templates = [
            `Descubra como ${title.toLowerCase()} pode revolucionar seu negócio.`,
            `Guia completo sobre ${title.toLowerCase()} para empresas modernas.`,
            `Tudo o que você precisa saber sobre ${title.toLowerCase()}.`,
            `${title}: conceitos, aplicações e benefícios práticos.`,
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    handleSearchResults(data) {
        this.filteredArticles = data.results;
        this.currentPage = 1;
        this.displayedArticles = []; // Limpa os artigos exibidos para renderizar apenas os resultados da busca
        this.renderArticles();

        const resultsText = data.results.length === 1 ? '1 artigo encontrado' : `${data.results.length} artigos encontrados`;
        if (data.query) {
            Utils.showToast(`${resultsText} para "${data.query}"`, 'info');
        }
    }

    handleCategoryFilter(category) {
        if (category === 'Todos') {
            this.filteredArticles = this.articles;
        } else {
            this.filteredArticles = this.articles.filter(article => article.category === category);
        }
        this.currentPage = 1;
        this.displayedArticles = [];
        this.renderArticles();
    }

    renderArticles() {
        // Pega apenas a próxima página de artigos para adicionar
        const startIndex = (this.currentPage - 1) * this.articlesPerPage;
        const endIndex = startIndex + this.articlesPerPage;
        const articlesToRenderNow = this.filteredArticles.slice(startIndex, endIndex);

        // Se for a primeira página, limpa os containers
        if (this.currentPage === 1) {
            this.displayedArticles = [];
            const featuredContainer = document.getElementById('featured-articles');
            const allArticlesContainer = document.getElementById('all-articles-grid');
            if (featuredContainer) featuredContainer.innerHTML = '';
            if (allArticlesContainer) allArticlesContainer.innerHTML = '';
        }
        
        this.displayedArticles.push(...articlesToRenderNow);

        // Renderiza artigos em destaque (primeiros X da lista filtrada, se for a primeira página)
        if (this.currentPage === 1) {
            this.renderFeaturedArticles(this.filteredArticles.slice(0, 3)); // Pega os 3 primeiros da lista filtrada atual
        }
        
        // Renderiza todos os artigos carregados até agora (incremental)
        this.renderAllArticles(articlesToRenderNow); // Passa apenas os novos artigos para adicionar
        
        this.updateLoadMoreButton();
        this.updateResultsCount();
        this.setupLazyLoading(); // Re-configura lazy loading para novas imagens
        // Re-inicializa animações para novos cards, se necessário e se AnimationObserver não pegar automaticamente
        if (window.animationObserver && typeof window.animationObserver.observeElements === 'function') {
             // Idealmente, AnimationObserver deveria ser capaz de observar novos elementos dinamicamente
             // ou ter um método para re-observar.
             // Por simplicidade, podemos recriar ou re-chamar observeElements se os cards são totalmente substituídos.
             // Se os cards são apenas adicionados, o IntersectionObserver deveria continuar funcionando para os novos.
             // Se AnimationObserver não pegar novos elementos, você pode precisar de:
             // window.animationObserver.observer.disconnect(); // Parar de observar os antigos
             // window.animationObserver.observeElements(); // Re-observar tudo, incluindo os novos
        }
    }

    renderFeaturedArticles(articles) {
        const container = document.getElementById('featured-articles');
        if (!container) return;

        if (articles.length === 0 && this.currentPage === 1) { // Só mostra "nenhum encontrado" se for a primeira página e não houver destaques
            container.innerHTML = '<p class="no-results" style="text-align:center; padding: 2rem;">Nenhum artigo em destaque encontrado.</p>';
            return;
        }
        
        // Só renderiza se for a primeira página, para não duplicar
        if (this.currentPage === 1) {
            const html = articles.map(article => this.createArticleCard(article, true)).join('');
            container.innerHTML = html; // Substitui o conteúdo
        }
    }

    renderAllArticles(newArticlesToAppend) { // Modificado para APENAS adicionar novos artigos
        const container = document.getElementById('all-articles-grid');
        if (!container) return;
    
        if (this.filteredArticles.length === 0 && this.currentPage === 1) {
            container.innerHTML = '<p class="no-results" style="text-align:center; padding: 2rem;">Nenhum artigo encontrado com os filtros atuais.</p>';
            return;
        }
    
        // Se for a primeira página e não houver resultados, a mensagem acima já foi mostrada.
        // Se não for a primeira página, mas não houver mais artigos para adicionar, não faz nada.
        if (newArticlesToAppend.length === 0 && this.currentPage > 1) {
            return;
        }

        const html = newArticlesToAppend.map(article => this.createArticleCard(article)).join('');
        
        // Adiciona os novos artigos ao invés de substituir
        container.insertAdjacentHTML('beforeend', html);
    }

    // ▼▼▼ FUNÇÃO MODIFICADA ▼▼▼
    createArticleCard(article, isFeatured = false) {
        const formattedDate = Utils.formatDate(article.date);
        // Usar uma imagem de placeholder ou uma lógica mais sofisticada para imagens de artigos
        const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(article.category)},${article.title.split(" ")[0]},technology`; 

        // Aplicando classes de produtos.css (ex: product-card) e mantendo as do blog para funcionalidade
        return `
            <article class="product-card article-card" 
                     data-category="${article.category}"
                     role="article"
                     aria-labelledby="title-${article.filename}"
                     tabindex="0">
                <div class="product-image article-image"> 
                    <img 
                        src="${imageUrl}" 
                        alt="Ilustração sobre ${article.title}"
                        class="lazy-image" 
                        loading="lazy"
                        width="400" 
                        height="250" 
                    />
                </div>
                <div class="product-content article-content"> 
                    <div class="product-category article-category" style="margin-bottom: var(--space-xs); text-transform: uppercase; font-size: 0.8rem; font-weight: 600;">${article.category}</div>
                    <h3 id="title-${article.filename}" class="product-title article-title">${article.title}</h3>
                    <p class="product-description article-excerpt">${article.description}</p>
                    
                    <div class="article-meta" style="font-size: 0.8rem; color: var(--text-muted, #8A8AA0); margin-top: var(--space-sm, 1rem); margin-bottom: var(--space-md, 1.5rem);">
                        <span aria-label="Data de publicação" style="margin-right:1rem;">
                            <i class="far fa-calendar" aria-hidden="true"></i> 
                            <time datetime="${article.date}">${formattedDate}</time>
                        </span>
                        <span aria-label="Tempo de leitura">
                            <i class="far fa-clock" aria-hidden="true"></i> 
                            ${article.readTime || Utils.generateReadingTime()} min
                        </span>
                    </div>
                    
                    <div class="product-footer" style="margin-top:auto;"> 
                        <a href="${article.url}" 
                           class="view-details-btn article-link" 
                           aria-label="Ler artigo: ${article.title}"
                           style="text-decoration: none; display: inline-flex; align-items: center; gap: var(--space-xs, 0.5rem); width: 100%; justify-content: center;">
                            <span>Ler artigo</span> <i class="fas fa-arrow-right" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }
    // ▲▲▲ FIM DA FUNÇÃO MODIFICADA ▲▲▲

    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.lazy-image').forEach(img => {
                this.loadImage(img);
            });
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '50px 0px' });

        document.querySelectorAll('.lazy-image:not(.loaded)').forEach(img => { // Observa apenas as não carregadas
            imageObserver.observe(img);
        });
    }

    loadImage(img) {
        const src = img.getAttribute('data-src') || img.src; // Usa src diretamente se data-src não estiver mais sendo usado
        if (src && img.src !== src) { // Evita recarregar se src já estiver correto
            img.src = src;
        }
        img.onload = () => {
            img.classList.add('loaded');
        };
        img.onerror = () => {
            // Fallback para imagem de placeholder se o original falhar
            img.src = 'https://via.placeholder.com/800x600/1A1A2E/A78BFA?text=Imagem+Indisponivel';
            img.classList.add('loaded', 'error');
        };
        if (img.complete && src) { // Se a imagem já estiver carregada (cache)
             img.classList.add('loaded');
        }
    }

    loadMoreArticles() {
        this.currentPage++;
        Utils.trackEvent('load_more_articles', { page: this.currentPage });
        this.renderArticles(); // Vai adicionar a próxima página de artigos
    }

    updateLoadMoreButton() {
        const button = document.getElementById('load-more-btn');
        if (!button) return;

        const hasMore = this.displayedArticles.length < this.filteredArticles.length;
        
        if (hasMore) {
            button.style.display = 'inline-flex'; // Ou o display original do botão
            const remaining = this.filteredArticles.length - this.displayedArticles.length;
            button.innerHTML = `
                Carregar mais artigos (${remaining})
                <i class="fas fa-chevron-down" aria-hidden="true" style="margin-left: 8px;"></i>
            `;
        } else {
            button.style.display = 'none';
        }
    }

    updateResultsCount() {
        const total = this.filteredArticles.length;
        const displayed = this.displayedArticles.length;
        const announcement = `Mostrando ${displayed} de ${total} artigos.`;
        this.announceToScreenReader(announcement); // Reutiliza a função do CategoryFilter
    }
    
    announceToScreenReader(message) { // Duplicado de CategoryFilter para uso aqui também
        let announcement = document.querySelector('.sr-announcement');
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.className = 'sr-only sr-announcement';
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            document.body.appendChild(announcement);
        }
        announcement.textContent = message;
         setTimeout(() => {
            if (announcement) announcement.textContent = '';
        }, 3000);
    }


    async handleNewsletterSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const emailInput = form.querySelector('#newsletter-email');
        const button = form.querySelector('.newsletter-button');
        const errorDiv = form.querySelector('#email-error');
        const email = emailInput.value.trim();
        
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.classList.remove('show');
        }
        emailInput.classList.remove('error');
        
        if (!this.validateEmail(email)) {
            this.showFieldError(emailInput, errorDiv, 'Por favor, insira um email válido.');
            return;
        }
        
        const originalText = button.querySelector('span') ? button.querySelector('span').textContent : button.textContent;
        if (button.querySelector('span')) button.querySelector('span').textContent = 'Inscrevendo...'; else button.textContent = 'Inscrevendo...';
        button.disabled = true;
        
        try {
            await this.subscribeNewsletter(email); // Simula API
            
            if (button.querySelector('span')) button.querySelector('span').textContent = '✓ Inscrito!'; else button.textContent = '✓ Inscrito!';
            button.style.background = 'rgba(16, 185, 129, 0.3)'; // Verde sucesso
            form.reset();
            Utils.showToast('🎉 Inscrição realizada com sucesso!', 'success');
            Utils.trackEvent('newsletter_signup', { email: email, source: 'blog_newsletter' });
            
            setTimeout(() => {
                if (button.querySelector('span')) button.querySelector('span').textContent = originalText; else button.textContent = originalText;
                button.style.background = '';
                button.disabled = false;
            }, 3000);
            
        } catch (error) {
            if (button.querySelector('span')) button.querySelector('span').textContent = 'Erro'; else button.textContent = 'Erro';
            button.style.background = 'rgba(239, 68, 68, 0.3)'; // Vermelho erro
            Utils.showToast('❌ Erro ao realizar inscrição. Tente novamente.', 'error');
            
            setTimeout(() => {
                if (button.querySelector('span')) button.querySelector('span').textContent = originalText; else button.textContent = originalText;
                button.style.background = '';
                button.disabled = false;
            }, 3000);
        }
    }

    validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    showFieldError(input, errorDiv, message) {
        input.classList.add('error'); // Adicione uma classe .error no CSS para destacar o campo
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show'); // Adicione .show para exibir a mensagem
        }
        input.focus();
        input.addEventListener('input', () => {
            input.classList.remove('error');
            if (errorDiv) errorDiv.classList.remove('show');
        }, { once: true });
    }

    async subscribeNewsletter(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% de sucesso
                    resolve({ success: true });
                } else {
                    reject(new Error('Erro simulado do servidor'));
                }
            }, 1500);
        });
    }

    setupExitIntent() {
        let exitShown = false;
        const modal = document.getElementById('exit-intent-modal');
        if (!modal) return;
        const closeBtn = modal.querySelector('.modal-close');
        const exitForm = document.getElementById('exit-form');

        const handleMouseLeave = (e) => {
            if (e.clientY <= 0 && !exitShown && (window.scrollY > 1000 || document.body.scrollHeight > window.innerHeight * 2)) { // Mostra se scrollou um pouco
                this.showExitModal();
                exitShown = true;
            }
        };
        document.addEventListener('mouseleave', Utils.throttle(handleMouseLeave, 500));

        if (closeBtn) closeBtn.addEventListener('click', () => this.hideExitModal());
        modal.addEventListener('click', (e) => { if (e.target === modal) this.hideExitModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) this.hideExitModal(); });

        if (exitForm) {
            exitForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailInput = exitForm.querySelector('input[type="email"]');
                const email = emailInput.value;
                try {
                    await this.subscribeNewsletter(email); // Reusa a função
                    Utils.showToast('🎁 Guia enviado para seu email!', 'success');
                    Utils.trackEvent('exit_intent_conversion', { email });
                    this.hideExitModal();
                    emailInput.value = ''; // Limpa o campo
                } catch (error) {
                    Utils.showToast('❌ Erro ao enviar guia. Tente novamente.', 'error');
                }
            });
        }
    }

    showExitModal() {
        const modal = document.getElementById('exit-intent-modal');
        if (modal) {
            modal.classList.add('active'); // Supondo que produtos.css tem .modal-overlay.active
            modal.setAttribute('aria-hidden', 'false');
            const firstInput = modal.querySelector('input[type="email"]');
            if (firstInput) setTimeout(() => firstInput.focus(), 100);
            Utils.trackEvent('exit_intent_shown');
        }
    }

    hideExitModal() {
        const modal = document.getElementById('exit-intent-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }
    
    initializeComponents() {
        this.initSpline3D();
        this.setupArticleClickHandlers();
        this.setupKeyboardNavigation();
    }

    initSpline3D() {
        const splineContainer = document.getElementById('spline-robot');
        if (!splineContainer) return;

        if (typeof window.customElements !== 'undefined' && customElements.get('spline-viewer')) {
            // URL do Spline do seu HTML original
            splineContainer.innerHTML = `
                <spline-viewer 
                    url="https://prod.spline.design/your-robot-scene-url" 
                    loading-anim-type="spinner-small-light">
                </spline-viewer>
            `;
             // Substitua "https://prod.spline.design/your-robot-scene-url" pela URL correta se diferente
        } else {
            splineContainer.innerHTML = `
                <div class="spline-placeholder" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; background:rgba(0,0,0,0.1); border-radius:8px;">
                    <i class="fas fa-robot" style="font-size:3rem; margin-bottom:0.5rem; color:var(--primary, #8B5CF6);"></i>
                    <p style="color:var(--text-secondary, #A1A1AA);">Robô 3D Interativo</p>
                </div>
            `;
        }
    }

    setupArticleClickHandlers() {
        // Event delegation no container dos artigos para performance
        const articlesContainer = document.getElementById('all-articles-grid'); // Ou o container pai se os destaques também devem ser clicáveis assim
        if (articlesContainer) {
            articlesContainer.addEventListener('click', (e) => {
                const articleCard = e.target.closest('.article-card');
                if (articleCard && !e.target.closest('.article-link, button, a')) { // Não interfere com links/botões dentro do card
                    const link = articleCard.querySelector('.article-link'); // O link principal do card
                    if (link && link.href) {
                        Utils.trackEvent('article_card_click', {
                            url: link.href,
                            title: articleCard.querySelector('.article-title')?.textContent || 'N/A'
                        });
                        window.location.href = link.href;
                    }
                }
            });
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const activeElement = document.activeElement;
                if (activeElement && activeElement.classList.contains('article-card')) {
                    const link = activeElement.querySelector('.article-link');
                    if (link && link.href) {
                        link.click();
                    }
                }
            }
        });
    }

    setLoading(isLoading) {
        this.isLoading = isLoading;
        const skeletons = document.querySelectorAll('.skeleton');
        // Adicione um loader geral se necessário
        const generalLoader = document.getElementById('page-loader'); // Exemplo
        
        if (isLoading) {
            skeletons.forEach(skeleton => skeleton.style.display = 'block');
            if(generalLoader) generalLoader.style.display = 'flex';
        } else {
            skeletons.forEach(skeleton => skeleton.style.display = 'none');
            if(generalLoader) generalLoader.style.display = 'none';
        }
    }

    showError() {
        const containersToClear = ['featured-articles', 'all-articles-grid'];
        containersToClear.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div class="error-message" role="alert" style="text-align:center; padding: 2rem; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: var(--text-primary, white);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #EF4444;"></i>
                        <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Ops! Algo deu errado</h3>
                        <p style="margin-bottom: 1rem;">Não foi possível carregar os artigos. Verifique sua conexão e se o arquivo sitemap.xml está acessível em raw.githubusercontent.com.</p>
                        <button onclick="location.reload()" class="submit-btn" style="background: #EF4444; color:white;">
                            <i class="fas fa-redo" style="margin-right: 0.5rem;"></i>
                            Tentar novamente
                        </button>
                    </div>
                `;
            }
        });
        this.setLoading(false); // Esconde skeletons se houver erro
    }
}

// Header and Navigation
class HeaderManager {
    constructor() {
        this.header = document.getElementById('header');
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.navLinks = document.querySelector('.nav-links'); // O container dos links de navegação
        this.lastScroll = 0;
        this.init();
    }

    init() {
        if (!this.header) return; // Sai se não houver header
        this.setupScrollEffect();
        this.setupMobileMenu();
        this.setupSmoothScroll();
    }

    setupScrollEffect() {
        const handleScroll = Utils.throttle(() => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 50) {
                this.header.classList.add('scrolled'); // Supondo que produtos.css tem estilo para .header.scrolled
            } else {
                this.header.classList.remove('scrolled');
            }
            this.lastScroll = currentScroll;
        }, 16);
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    setupMobileMenu() {
        if (!this.mobileMenuBtn || !this.navLinks) return;

        this.mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = this.mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            this.mobileMenuBtn.setAttribute('aria-expanded', String(!isExpanded));
            this.navLinks.classList.toggle('show'); // Supondo que produtos.css estiliza .nav-links.show
            
            const icon = this.mobileMenuBtn.querySelector('i');
            if (icon) icon.className = isExpanded ? 'fas fa-bars' : 'fas fa-times';
            
            // Para evitar scroll da página quando o menu mobile estiver aberto
            document.body.style.overflow = this.navLinks.classList.contains('show') ? 'hidden' : '';
        });

        this.navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && this.navLinks.classList.contains('show')) {
                this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
                this.navLinks.classList.remove('show');
                const icon = this.mobileMenuBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
                document.body.style.overflow = '';
            }
        });
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId.length > 1) { // Garante que não é apenas "#"
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        const headerHeight = this.header ? this.header.offsetHeight : 0;
                        const targetPosition = targetElement.offsetTop - headerHeight - 20; // 20px de offset
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                        // history.pushState(null, null, targetId); // Opcional: atualiza URL
                    }
                }
            });
        });
    }
}

// Mouse Effects (se produtos.css/js tiver algo similar, pode ser adaptado ou removido se não desejado)
class MouseEffects {
    constructor() {
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.speed = 0.05; // Mais suave
        this.init();
    }

    init() {
        // Verifica se o dispositivo não é touch para aplicar efeitos de mouse
        if (!('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)) {
            this.setupMouseTracking();
            this.startAnimation();
            this.setupHoverEffects();
        }
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
            
            // Essas variáveis CSS precisam ser usadas no seu produtos.css para ter efeito
            // Ex: .depth-layer { transform: translate(calc(var(--mouse-x) / 20), calc(var(--mouse-y) / 20)); }
            document.documentElement.style.setProperty('--mouse-x-percent', this.currentX + '%');
            document.documentElement.style.setProperty('--mouse-y-percent', this.currentY + '%');
            
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    setupHoverEffects() {
        // Efeito de "levantar" para cards e botões, se desejado e estilizado em produtos.css
        document.querySelectorAll('button, .article-card, .category-pill, .cta-button').forEach(element => {
            element.addEventListener('mouseenter', () => {
                // Exemplo: element.style.transform = 'translateY(-3px) scale(1.02)';
                // Isso deve ser preferencialmente tratado com classes CSS :hover para melhor performance
                // e para ser consistente com produtos.css
            });
            element.addEventListener('mouseleave', () => {
                // Exemplo: element.style.transform = '';
            });
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.performanceMonitor = new PerformanceMonitor();
        window.readingProgress = new ReadingProgress();
        window.animationObserver = new AnimationObserver(); // Este vai animar os elementos na entrada
        window.blogManager = new BlogManager(); // Este carrega os artigos e inicializa a busca/filtros
        window.headerManager = new HeaderManager();
        window.mouseEffects = new MouseEffects(); 
        
        console.log('✨ Blog IAutomatize inicializado com sucesso!');
        
        Utils.trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
            event_category: 'engagement',
            event_label: 'Blog Page View'
        });
        
    } catch (error) {
        console.error('❌ Erro Crítico ao inicializar o blog:', error);
        // Mostra uma mensagem de erro mais genérica se o BlogManager falhar completamente
        const body = document.querySelector('body');
        if (body) {
            body.innerHTML = `
                <div style="text-align:center; padding:50px; font-family:sans-serif; color:#333;">
                    <h1>Ops! Algo deu muito errado.</h1>
                    <p>Não foi possível carregar o conteúdo do blog. Por favor, tente recarregar a página.</p>
                    <p>Se o problema persistir, o sitemap.xml pode estar inacessível ou mal formatado.</p>
                    <button onclick="location.reload()" style="padding:10px 20px; font-size:1rem; cursor:pointer;">Recarregar</button>
                </div>
            `;
        }
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            // Certifique-se que o sw.js está na raiz ou ajuste o caminho
            const registration = await navigator.serviceWorker.register('/sw.js'); 
            console.log('✅ ServiceWorker registrado:', registration.scope);
            Utils.trackEvent('service_worker_registered');
        } catch (error) {
            console.log('❌ Falha no registro do ServiceWorker:', error);
            Utils.trackEvent('service_worker_failed', { error_message: error.message });
        }
    });
}

// Export for testing (se você usar CommonJS/Node para testes)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Utils,
        BlogManager,
        // ...outras classes se necessário para teste
    };
}

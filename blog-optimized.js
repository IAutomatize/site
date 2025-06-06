/**
 * Blog IAutomatize - JavaScript Otimizado
 * Performance + Acessibilidade + UX + Conversão
 * Versão 3.2 - 2025 (Revertida compactação, Spline Removido, Correção URL Sitemap)
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
        try {
            const date = new Date(dateString);
            // Verifica se a data é válida
            if (isNaN(date.getTime())) {
                // Tenta analisar formatos comuns se a data não for ISO e inválida
                const parts = dateString.split(/[-/]/);
                let day, month, year;

                if (parts.length === 3) {
                    // Tenta DD/MM/YYYY ou MM/DD/YYYY
                    if (parseInt(parts[1]) > 12 && parseInt(parts[0]) <= 12) { // Provavelmente MM/DD/YYYY com MM > 12 (improvável, mas cobre)
                        month = parseInt(parts[0]); day = parseInt(parts[1]); year = parseInt(parts[2]);
                    } else { // Assume DD/MM/YYYY ou YYYY/MM/DD
                         // Se o primeiro for > 31, é provável que seja ano
                        if (parseInt(parts[0]) > 31) { // YYYY/MM/DD
                            year = parseInt(parts[0]); month = parseInt(parts[1]); day = parseInt(parts[2]);
                        } else { // DD/MM/YYYY
                            day = parseInt(parts[0]); month = parseInt(parts[1]); year = parseInt(parts[2]);
                        }
                    }
                    const correctedDate = new Date(year, month - 1, day);
                    if (!isNaN(correctedDate.getTime())) {
                        return correctedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
                    }
                }
                console.warn(`Data inválida ou formato não reconhecido: "${dateString}". Usando data atual como fallback.`);
                return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
            }
            return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            console.warn(`Erro ao formatar data "${dateString}": ${e}. Usando data atual como fallback.`);
            return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
        }
    },

    // Generate reading time
    generateReadingTime() {
        return Math.floor(Math.random() * 8) + 3; // Retorna um tempo de leitura entre 3 e 10 minutos
    },

    // Animate number
    animateNumber(element, start, end, duration = 2000) {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(start + (end - start) * progress);
            element.textContent = value.toLocaleString('pt-BR'); // Formata para o padrão brasileiro
            
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
            console.warn('Toast container (toast-container) não encontrado no DOM.');
            return;
        }

        const toast = document.createElement('div');
        // As classes 'toast' e 'success'/'error'/'info' devem ser estilizadas no seu CSS
        toast.className = `toast ${type}`; 
        
        // Estilos inline básicos para garantir visibilidade (idealmente, isso viria do CSS)
        let bgColor = '#8B5CF6'; // Padrão info (roxo IAutomatize)
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
        
        // Força reflow para a animação de entrada funcionar
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        // Remove toast
        setTimeout(() => {
            toast.style.transform = 'translateX(110%)';
            toast.style.opacity = '0';
            // Espera a animação de saída terminar antes de remover o elemento
            setTimeout(() => {
                if (container.contains(toast)) { // Verifica se o toast ainda está no container
                    container.removeChild(toast);
                }
            }, 300); // Tempo da transição
        }, duration);
    },

    // Track analytics event
    trackEvent(eventName, eventData = {}) {
        // Google Analytics 4 (gtag.js)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                // Mapeie eventData para os parâmetros esperados pelo GA4
                custom_parameter_1: eventData.category || 'blog', // Exemplo
                custom_parameter_2: eventData.action || eventName, // Exemplo
                custom_parameter_3: eventData.label || '', // Exemplo
                value: eventData.value || 0 // Exemplo
                // ... outros parâmetros customizados ou padrões do GA4
            });
        }

        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            // Para eventos padrão do FB, use o nome do evento padrão. Para customizados, use 'trackCustom'.
            // Consulte a documentação do FB Pixel para mapear eventName e eventData.
            fbq('track', eventName, eventData);
        }

        // Log para debug
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
            // Largest Contentful Paint (LCP)
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
                Utils.trackEvent('performance_lcp', { value: Math.round(lastEntry.startTime) });
            });
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

            // First Input Delay (FID) - ou Interaction to Next Paint (INP) se disponível
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                    Utils.trackEvent('performance_fid', { value: Math.round(entry.processingStart - entry.startTime) });
                });
            });
            fidObserver.observe({ type: 'first-input', buffered: true });

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) { // Ignora shifts causados por interação do usuário
                        clsValue += entry.value;
                    }
                });
                this.metrics.cls = clsValue;
                // Multiplicar por 1000 para melhor granularidade se estiver enviando para analytics
                Utils.trackEvent('performance_cls', { value: Math.round(clsValue * 1000) }); 
            });
            clsObserver.observe({ type: 'layout-shift', buffered: true });
        }
    }

    observeCustomMetrics() {
        // Time to Interactive (TTI) - Aproximação
        window.addEventListener('load', () => {
            if (performance.getEntriesByType('navigation').length > 0) {
                const navTiming = performance.getEntriesByType('navigation')[0];
                // TTI é complexo, aqui uma aproximação: domInteractive
                const tti = navTiming.domInteractive - navTiming.fetchStart;
                this.metrics.tti = tti;
                Utils.trackEvent('performance_tti', { value: Math.round(tti) });
            }
        });

        // First Contentful Paint (FCP)
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
                    // Identificar recursos lentos
                    if (entry.duration > 1000) { // Exemplo: recurso que levou mais de 1 segundo para carregar
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
                
                if (pageLoadTime > 3000) { // Exemplo: página levou mais de 3 segundos para carregar
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
            // Calcula a altura total do conteúdo rolável de forma mais robusta
            const docHeight = Math.max(
                document.body.scrollHeight, document.documentElement.scrollHeight,
                document.body.offsetHeight, document.documentElement.offsetHeight,
                document.body.clientHeight, document.documentElement.clientHeight
            ) - window.innerHeight; // Subtrai a altura da viewport
            
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            
            // Garante que o valor está entre 0 e 100
            this.progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
            this.progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
        }, 16); // Atualiza a cada ~60fps

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress(); // Chama uma vez para definir o estado inicial
    }
}

// Intersection Observer for animations
class AnimationObserver {
    constructor() {
        this.init();
    }

    init() {
        const observerOptions = {
            threshold: [0.1, 0.3, 0.5], // Diferentes limiares para diferentes efeitos se necessário
            rootMargin: '0px 0px -50px 0px' // Começa a animar um pouco antes de entrar totalmente na tela
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target, entry.intersectionRatio);
                }
                // else { // Opcional: reverter animação quando sai da tela
                //     entry.target.style.opacity = '0';
                //     entry.target.style.transform = 'translateY(20px)';
                // }
            });
        }, observerOptions);

        this.observeElements();
    }

    observeElements() {
        // Seleciona todos os elementos que devem ser animados
        const elements = document.querySelectorAll([
            '.article-card', // Os cartões de artigo
            '.section-title',
            '.hero-content', // Conteúdo do Hero
            '.social-proof', // Prova social
            '.newsletter-box', // Caixa da newsletter
            '.proof-number' // Números da prova social
            // Adicione outras classes/seletores conforme necessário
        ].join(', '));

        elements.forEach(el => {
            // Define estado inicial para animação de entrada
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'; // Transição suave
            this.observer.observe(el);
        });
    }

    animateElement(element, ratio) {
        // Adiciona um pequeno delay baseado na ordem do elemento para um efeito cascata
        const delay = Array.from(element.parentElement?.children || []).indexOf(element) * 100; // ms
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';

            // Anima números se for um .proof-number
            if (element.classList.contains('proof-number')) {
                const targetNumber = parseInt(element.getAttribute('data-count') || element.textContent.replace(/\D/g, ''));
                if (!isNaN(targetNumber)) {
                    Utils.animateNumber(element, 0, targetNumber, 2000);
                }
            }
        }, delay);

        // Para de observar o elemento após a animação para economizar recursos
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

        // Debounce para evitar buscas a cada tecla pressionada
        const debouncedSearch = Utils.debounce((query) => {
            this.performSearch(query);
        }, 300); // 300ms de delay

        this.searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });

        // Permite busca com Enter
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Evita submit de formulário se houver
                this.performSearch(e.target.value);
            }
        });

        // Se houver um botão de busca explícito
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => {
                this.performSearch(this.searchInput.value);
            });
        }
    }

    setArticles(articles) {
        this.articles = articles;
        this.filteredArticles = articles; // Inicialmente, todos os artigos são "filtrados"
    }

    performSearch(query) {
        const trimmedQuery = query.trim().toLowerCase();
        
        if (!trimmedQuery) {
            this.filteredArticles = this.articles; // Se a busca estiver vazia, mostra todos
        } else {
            this.filteredArticles = this.articles.filter(article => {
                // Busca no título, descrição (se existir) e categoria
                return article.title.toLowerCase().includes(trimmedQuery) ||
                       (article.description && article.description.toLowerCase().includes(trimmedQuery)) ||
                       article.category.toLowerCase().includes(trimmedQuery);
            });
        }

        // Dispara um evento customizado para o BlogManager tratar os resultados
        window.dispatchEvent(new CustomEvent('searchComplete', {
            detail: { 
                query: trimmedQuery, 
                results: this.filteredArticles,
                total: this.articles.length // Para mostrar "X de Y resultados"
            }
        }));

        // Track search event
        if (trimmedQuery) { // Só rastreia se houver uma query
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

        // Delegação de eventos no container, já que as pills são dinâmicas
        this.pillsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-pill') || e.target.closest('.category-pill')) {
                const pill = e.target.closest('.category-pill');
                this.handleCategoryChange(pill);
            }
        });
        
        // Acessibilidade: permitir navegação e ativação com teclado
        this.pillsContainer.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && (e.target.classList.contains('category-pill') || e.target.closest('.category-pill'))) {
                e.preventDefault(); // Evita scroll da página com espaço
                const pill = e.target.closest('.category-pill');
                this.handleCategoryChange(pill);
            }
            // Adicionar navegação com setas (ArrowLeft, ArrowRight) seria um plus aqui
        });
    }
    
    // Este método será chamado pelo BlogManager após carregar os artigos e extrair as categorias
    renderPills(categories) {
        if (!this.pillsContainer) return;
        // Adiciona "Todos" se não estiver presente e define como padrão
        const allCategories = ['Todos', ...new Set(categories)]; // Garante categorias únicas
        
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
        if (!pill || pill.classList.contains('active')) return; // Não faz nada se já estiver ativo
        
        // Remove 'active' de todas as pills e ajusta tabindex e aria-selected
        this.pillsContainer.querySelectorAll('.category-pill').forEach(p => {
            p.classList.remove('active');
            p.setAttribute('aria-selected', 'false');
            p.setAttribute('tabindex', '-1'); // Torna não focável por Tab
        });
        
        // Ativa a pill clicada
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');
        pill.setAttribute('tabindex', '0'); // Torna focável por Tab
        
        const category = pill.getAttribute('data-category') || pill.textContent.trim();
        const previousCategory = this.currentCategory;
        this.currentCategory = category;

        // Dispara evento para o BlogManager tratar a filtragem
        window.dispatchEvent(new CustomEvent('categoryChanged', {
            detail: { category }
        }));

        // Track category filter event
        Utils.trackEvent('category_filter', {
            category: category,
            previous_category: previousCategory
        });

        this.announceToScreenReader(`Filtrando por categoria: ${category}`);
    }

    // Anuncia mudanças para leitores de tela
    announceToScreenReader(message) {
        let announcement = document.querySelector('.sr-announcement');
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.className = 'sr-only sr-announcement'; // sr-only para ser lido apenas por leitores de tela
            announcement.setAttribute('aria-live', 'polite'); // Anuncia mudanças quando ocorrem
            announcement.setAttribute('aria-atomic', 'true'); // Lê toda a mensagem
            document.body.appendChild(announcement);
        }
        announcement.textContent = message;
        // Limpa a mensagem após um tempo para não ficar "presa"
         setTimeout(() => {
            if (announcement) announcement.textContent = '';
        }, 3000);
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
        this.displayedArticles = []; // Artigos atualmente visíveis na página
        this.articlesPerPage = 6; // Quantos artigos carregar por vez
        this.currentPage = 1;
        this.isLoading = false;
        this.sitemapCache = null;
        this.cacheExpiry = 10 * 60 * 1000; // 10 minutos de cache para o sitemap
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

            // Inicializa componentes que dependem dos artigos ou da estrutura do DOM pós-renderização inicial
            // Removido initSpline3D()
            this.setupArticleClickHandlers();
            this.setupKeyboardNavigation();
            
            // IMPORTANTE: Passa os artigos para o componente de busca APÓS o carregamento e renderização inicial das categorias
            this.search.setArticles(this.articles); 
            
            this.renderArticles(); // Renderiza os artigos iniciais
            
            this.setupLazyLoading(); // Configura lazy loading para imagens
            
        } catch (error) {
            console.error('❌ Erro ao inicializar blog manager:', error);
            this.showError(); // Mostra uma mensagem de erro na UI
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
            
            // Não chama renderArticles ou search.setArticles aqui, pois isso será feito no init()
            
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
            console.log('Retornando sitemap do cache.');
            return this.sitemapCache;
        }
        
        try {
            // URL CORRIGIDA E PÚBLICA DO SITEMAP
            const sitemapURL = 'https://iautomatize.com/sitemap.xml';
            console.log(`Buscando sitemap de: ${sitemapURL}`);
            
            const response = await fetch(sitemapURL, {
                cache: 'no-cache' // Evita cache do navegador para esta requisição específica, o cache da classe controla
            });
            
            if (!response.ok) {
                throw new Error(`Sitemap fetch HTTP ${response.status}: ${response.statusText}. URL: ${response.url}`);
            }
            
            const text = await response.text();
            this.sitemapCache = text;
            this.lastFetch = now;
            console.log('Sitemap carregado com sucesso.');
            return text;
            
        } catch (error) {
            console.error('Falha ao carregar sitemap.xml:', error);
            // Não lança erro aqui para permitir que a página renderize com uma mensagem de erro
            // this.showError() será chamado pelo вызывающий.
            throw new Error(`Falha ao carregar sitemap: ${error.message}`);
        }
    }

    parseSitemap(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            
            // Verifica se houve erro de parse do XML
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
                    // Defina uma data padrão se lastmod não existir ou for inválida
                    const lastmod = lastmodElement ? lastmodElement.textContent.trim() : new Date().toISOString().split('T')[0];
                    
                    // Verifica se a URL é de um artigo de blog e não a própria página do blog ou index
                    if (this.isBlogArticle(urlStr)) {
                        const pathParts = urlStr.split('/');
                        const filenameWithExtension = pathParts[pathParts.length - 1];
                        const filename = filenameWithExtension.replace('.html', ''); // Remove .html
                        
                        // A URL do sitemap já deve ser a URL canônica completa
                        const article = {
                            url: urlStr, // URL completa do sitemap
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
            // Ordena os artigos pela data mais recente
            return articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Erro ao processar sitemap:', error);
            throw new Error(`Erro ao processar sitemap: ${error.message}`);
        }
    }

    // Verifica se a URL é de um artigo de blog
    isBlogArticle(url) {
        // Ajuste esta lógica conforme a estrutura das URLs dos seus artigos no sitemap
        // Ex: todos os artigos estão em /blog/artigo.html
        return url.includes('/blog/') && url.endsWith('.html') && !url.endsWith('/blog.html') && !url.includes('index.html');
    }

    // Formata o nome do arquivo para um título legível
    formatTitle(filename) {
        let title = filename.replace('.html', ''); // Remove extensão
        title = title.replace(/[-_]/g, ' '); // Substitui hífens e underscores por espaços
        title = title.replace(/\b\w/g, l => l.toUpperCase()); // Capitaliza a primeira letra de cada palavra
        // Opcional: colocar palavras de ligação em minúsculo (exceto a primeira)
        const lowercaseWords = ['De', 'Da', 'Do', 'E', 'Ou', 'A', 'O', 'Para', 'Com', 'Em', 'No', 'Na'];
        title = title.split(' ').map((word, index) => {
            if (index !== 0 && lowercaseWords.includes(word)) {
                return word.toLowerCase();
            }
            return word;
        }).join(' ');
        return title;
    }

    // Extrai categoria do nome do arquivo (lógica simples, pode ser melhorada)
    extractCategory(filename) {
        const title = filename.toLowerCase();
        // Mapeamento de palavras-chave para categorias
        const categories = {
            'ia-': 'Inteligência Artificial', 'automacao': 'Automação', 'automação': 'Automação',
            'digital': 'Transformação Digital', 'case-': 'Cases de Sucesso', 'tutorial': 'Tutoriais',
            'guia': 'Tutoriais', 'ai-': 'Inteligência Artificial', 'artificial': 'Inteligência Artificial',
            'automation': 'Automação', 'chatbot': 'Inteligência Artificial', 'ml-': 'Inteligência Artificial',
            'machine-learning': 'Inteligência Artificial'
            // Adicione mais mapeamentos conforme necessário
        };
        for (const [key, value] of Object.entries(categories)) {
            if (title.includes(key)) return value;
        }
        return 'Tecnologia'; // Categoria padrão
    }

    // Gera uma descrição placeholder (idealmente viria do sitemap ou do próprio artigo)
    generateDescription(filename) {
        const title = this.formatTitle(filename);
        const templates = [
            `Descubra como ${title.toLowerCase()} pode revolucionar seu negócio. Leia mais sobre as últimas tendências e insights.`,
            `Um guia completo sobre ${title.toLowerCase()} para empresas e profissionais que buscam inovação.`,
            `Tudo o que você precisa saber sobre ${title.toLowerCase()}. Aplicações práticas, estudos de caso e dicas.`,
            `${title}: explorando conceitos, aplicações e os benefícios práticos para o seu dia a dia.`,
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    handleSearchResults(data) {
        this.filteredArticles = data.results;
        this.currentPage = 1;
        this.displayedArticles = []; // Limpa os artigos exibidos para renderizar apenas os resultados da busca
        this.renderArticles(); // Re-renderiza a lista de artigos com os resultados

        // Feedback para o usuário
        const resultsText = data.results.length === 1 ? '1 artigo encontrado' : `${data.results.length} artigos encontrados`;
        if (data.query) { // Só mostra toast se houver uma query
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
        this.displayedArticles = []; // Limpa para nova filtragem
        this.renderArticles(); // Re-renderiza com a nova categoria
    }

    renderArticles() {
        // Pega apenas a próxima página de artigos para adicionar
        const startIndex = (this.currentPage - 1) * this.articlesPerPage;
        const endIndex = startIndex + this.articlesPerPage;
        const articlesToRenderNow = this.filteredArticles.slice(startIndex, endIndex);

        // Se for a primeira página, limpa os containers para evitar duplicatas
        if (this.currentPage === 1) {
            this.displayedArticles = []; // Reseta os artigos exibidos
            const featuredContainer = document.getElementById('featured-articles');
            const allArticlesContainer = document.getElementById('all-articles-grid');
            if (featuredContainer) featuredContainer.innerHTML = ''; // Limpa HTML
            if (allArticlesContainer) allArticlesContainer.innerHTML = ''; // Limpa HTML
            // Renderiza artigos em destaque (primeiros X da lista filtrada, se for a primeira página)
            this.renderFeaturedArticles(this.filteredArticles.slice(0, 3)); // Pega os 3 primeiros da lista filtrada atual
        }
        
        // Renderiza todos os artigos carregados até agora (incremental)
        this.renderAllArticles(articlesToRenderNow); // Passa apenas os novos artigos para adicionar
        
        // Atualiza a lista de artigos que estão de fato na tela
        // Isso precisa ser feito *depois* de renderAllArticles ter adicionado os novos
        // Se currentPage === 1, displayedArticles já foi resetado. Se > 1, adiciona os novos.
        if (this.currentPage > 1) {
            this.displayedArticles.push(...articlesToRenderNow);
        } else { // currentPage === 1
             this.displayedArticles = this.filteredArticles.slice(0, this.articlesPerPage); // Garante que displayedArticles tem os primeiros da página 1
        }
        
        this.updateLoadMoreButton();
        this.updateResultsCount();
        this.setupLazyLoading(); // Re-configura lazy loading para novas imagens
    }

    renderFeaturedArticles(articles) {
        const container = document.getElementById('featured-articles');
        if (!container) return;

        if (articles.length === 0 && this.currentPage === 1) { 
            container.innerHTML = '<p class="no-results" style="text-align:center; padding: 2rem;">Nenhum artigo em destaque encontrado.</p>';
            return;
        }
        
        // Só renderiza se for a primeira página, para não duplicar ao carregar mais
        if (this.currentPage === 1) {
            const html = articles.map(article => this.createArticleCard(article, true)).join('');
            container.innerHTML = html; // Substitui o conteúdo
        }
    }

    renderAllArticles(newArticlesToAppend) { 
        const container = document.getElementById('all-articles-grid');
        if (!container) return;
    
        // Se não houver artigos filtrados e for a primeira página, mostra mensagem
        if (this.filteredArticles.length === 0 && this.currentPage === 1) {
            container.innerHTML = '<p class="no-results" style="text-align:center; padding: 2rem;">Nenhum artigo encontrado com os filtros atuais.</p>';
            return;
        }
    
        // Se não for a primeira página, mas não houver mais artigos para adicionar, não faz nada.
        if (newArticlesToAppend.length === 0 && this.currentPage > 1) {
            return;
        }

        const html = newArticlesToAppend.map(article => this.createArticleCard(article)).join('');
        
        // Adiciona os novos artigos ao invés de substituir todo o conteúdo
        container.insertAdjacentHTML('beforeend', html);
    }

    createArticleCard(article, isFeatured = false) {
        const formattedDate = Utils.formatDate(article.date);
        const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(article.category)},${article.title.split(" ")[0]},technology`; 

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
                    <div class="product-category article-category" style="margin-bottom: var(--space-xs, 0.5rem); text-transform: uppercase; font-size: 0.8rem; font-weight: 600;">${article.category}</div>
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

    setupLazyLoading() {
        // Se IntersectionObserver não for suportado, carrega todas as imagens
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
                    observer.unobserve(entry.target); // Para de observar após carregar
                }
            });
        }, { rootMargin: '50px 0px' }); // Carrega um pouco antes de entrar na viewport

        // Seleciona apenas imagens que ainda não foram carregadas (sem a classe 'loaded')
        document.querySelectorAll('.lazy-image:not(.loaded)').forEach(img => {
            imageObserver.observe(img);
        });
    }

    loadImage(img) {
        const src = img.getAttribute('data-src') || img.src; // Usa src se data-src não estiver mais sendo usado
        if (src && img.src !== src) { // Evita recarregar se src já estiver correto (ex: cache)
            img.src = src;
        }
        img.onload = () => {
            img.classList.add('loaded');
        };
        img.onerror = () => {
            // Fallback para imagem de placeholder se o original falhar
            img.src = 'https://via.placeholder.com/400x250/1A1A2E/A78BFA?text=Erro+ao+carregar'; // Placeholder
            img.classList.add('loaded', 'error');
        };
        // Se a imagem já estiver carregada pelo navegador (cache), adiciona a classe
        if (img.complete && src) { 
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
                Carregar mais (${remaining})
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
        const errorDiv = form.querySelector('#email-error'); // Certifique-se que este div existe no HTML
        const email = emailInput.value.trim();
        
        // Limpa erros anteriores
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.classList.remove('show'); // Supondo uma classe .show para exibir
        }
        emailInput.classList.remove('error'); // Supondo uma classe .error para o input
        
        if (!this.validateEmail(email)) {
            this.showFieldError(emailInput, errorDiv, 'Por favor, insira um email válido.');
            return;
        }
        
        const originalText = button.querySelector('span') ? button.querySelector('span').textContent : button.textContent;
        if (button.querySelector('span')) button.querySelector('span').textContent = 'Inscrevendo...'; else button.textContent = 'Inscrevendo...';
        button.disabled = true;
        
        try {
            await this.subscribeNewsletter(email); // Simula chamada à API
            
            if (button.querySelector('span')) button.querySelector('span').textContent = '✓ Inscrito!'; else button.textContent = '✓ Inscrito!';
            button.style.background = 'rgba(16, 185, 129, 0.3)'; // Feedback visual de sucesso
            form.reset(); // Limpa o formulário
            Utils.showToast('🎉 Inscrição realizada com sucesso!', 'success');
            Utils.trackEvent('newsletter_signup', { email: email, source: 'blog_newsletter' });
            
            // Restaura o botão após um tempo
            setTimeout(() => {
                if (button.querySelector('span')) button.querySelector('span').textContent = originalText; else button.textContent = originalText;
                button.style.background = ''; // Restaura cor original (do CSS)
                button.disabled = false;
            }, 3000);
            
        } catch (error) {
            if (button.querySelector('span')) button.querySelector('span').textContent = 'Erro'; else button.textContent = 'Erro';
            button.style.background = 'rgba(239, 68, 68, 0.3)'; // Feedback visual de erro
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
        // Remove o erro ao digitar novamente
        input.addEventListener('input', () => {
            input.classList.remove('error');
            if (errorDiv) errorDiv.classList.remove('show');
        }, { once: true });
    }

    // Simula uma chamada de API para inscrever na newsletter
    async subscribeNewsletter(email) {
        // Substitua isso por uma chamada fetch real para sua API de newsletter
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% de chance de sucesso para simulação
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
            // Mostra o modal se o mouse sair pelo topo da janela e o usuário já tiver rolado um pouco
            if (e.clientY <= 0 && !exitShown && (window.scrollY > 1000 || document.body.scrollHeight > window.innerHeight * 2)) {
                this.showExitModal();
                exitShown = true; // Mostra apenas uma vez por sessão de página
            }
        };
        document.addEventListener('mouseleave', Utils.throttle(handleMouseLeave, 500));

        if (closeBtn) closeBtn.addEventListener('click', () => this.hideExitModal());
        // Fecha se clicar fora do conteúdo do modal
        modal.addEventListener('click', (e) => { if (e.target === modal) this.hideExitModal(); });
        // Fecha com a tecla Escape
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) this.hideExitModal(); });

        if (exitForm) {
            exitForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailInput = exitForm.querySelector('input[type="email"]');
                const email = emailInput.value;
                try {
                    await this.subscribeNewsletter(email); // Reusa a função de inscrição
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
            // Foco no primeiro campo do formulário para acessibilidade
            const firstInput = modal.querySelector('input[type="email"]');
            if (firstInput) setTimeout(() => firstInput.focus(), 100); // Pequeno delay para garantir que o modal está visível
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
    
    setupArticleClickHandlers() {
        // Event delegation no container dos artigos para performance
        // Isso permite que cliques em qualquer parte do card (exceto links/botões explícitos) levem ao artigo
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
        // Permite que cards de artigo focados sejam "clicados" com Enter
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const activeElement = document.activeElement;
                if (activeElement && activeElement.classList.contains('article-card')) {
                    const link = activeElement.querySelector('.article-link');
                    if (link && link.href) {
                        link.click(); // Simula clique no link principal do card
                    }
                }
            }
        });
    }

    setLoading(isLoading) {
        this.isLoading = isLoading;
        const skeletons = document.querySelectorAll('.skeleton');
        // Adicione um loader geral se necessário
        const generalLoader = document.getElementById('page-loader'); // Exemplo, se você tiver um
        
        if (isLoading) {
            skeletons.forEach(skeleton => skeleton.style.display = 'block');
            if(generalLoader) generalLoader.style.display = 'flex';
        } else {
            skeletons.forEach(skeleton => skeleton.style.display = 'none');
            if(generalLoader) generalLoader.style.display = 'none';
        }
    }

    showError() {
        // Limpa os containers de artigos e mostra uma mensagem de erro
        const containersToClear = ['featured-articles', 'all-articles-grid'];
        containersToClear.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = `
                    <div class="error-message" role="alert" style="text-align:center; padding: 2rem; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; color: var(--text-primary, white);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #EF4444;"></i>
                        <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Ops! Algo deu errado</h3>
                        <p style="margin-bottom: 1rem;">Não foi possível carregar os artigos. Verifique sua conexão e se o arquivo sitemap.xml está acessível e formatado corretamente.</p>
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
        // Adiciona/remove classe 'scrolled' ao header com base no scroll
        const handleScroll = Utils.throttle(() => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 50) { // Adiciona a classe após rolar 50px
                this.header.classList.add('scrolled'); // Supondo que produtos.css tem estilo para .header.scrolled
            } else {
                this.header.classList.remove('scrolled');
            }
            this.lastScroll = currentScroll;
        }, 16); // Otimizado para performance
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    setupMobileMenu() {
        if (!this.mobileMenuBtn || !this.navLinks) return;

        this.mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = this.mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            this.mobileMenuBtn.setAttribute('aria-expanded', String(!isExpanded));
            this.navLinks.classList.toggle('show'); // Supondo que produtos.css estiliza .nav-links.show
            
            // Alterna o ícone do botão
            const icon = this.mobileMenuBtn.querySelector('i');
            if (icon) icon.className = isExpanded ? 'fas fa-bars' : 'fas fa-times';
            
            // Para evitar scroll da página quando o menu mobile estiver aberto
            document.body.style.overflow = this.navLinks.classList.contains('show') ? 'hidden' : '';
        });

        // Fecha o menu mobile ao clicar em um link (para SPAs ou navegação na mesma página)
        this.navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && this.navLinks.classList.contains('show')) {
                this.mobileMenuBtn.setAttribute('aria-expanded', 'false');
                this.navLinks.classList.remove('show');
                const icon = this.mobileMenuBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
                document.body.style.overflow = ''; // Restaura scroll
            }
        });
    }

    setupSmoothScroll() {
        // Smooth scroll para links de âncora
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId.length > 1) { // Garante que não é apenas "#"
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        const headerHeight = this.header ? this.header.offsetHeight : 0;
                        const targetPosition = targetElement.offsetTop - headerHeight - 20; // 20px de offset adicional
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                        // Opcional: atualiza a URL com o hash sem recarregar a página
                        // history.pushState(null, null, targetId);
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
        this.currentX = 0; // Posição atual suavizada
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
            // Posição do mouse como porcentagem da janela
            this.mouseX = (e.clientX / window.innerWidth) * 100;
            this.mouseY = (e.clientY / window.innerHeight) * 100;
        }, 16); // Otimizado
        document.addEventListener('mousemove', updateMousePosition, { passive: true });
    }

    startAnimation() {
        // Animação contínua para suavizar o movimento e aplicar a variáveis CSS
        const animate = () => {
            // Interpolação linear para suavizar
            this.currentX += (this.mouseX - this.currentX) * this.speed;
            this.currentY += (this.mouseY - this.currentY) * this.speed;
            
            // Essas variáveis CSS precisam ser usadas no seu produtos.css para ter efeito
            // Ex: .depth-layer { transform: translate(calc(var(--mouse-x-percent) / 20 - 50%), calc(var(--mouse-y-percent) / 20 - 50%)); }
            // para que o centro da imagem seja o ponto de repouso.
            document.documentElement.style.setProperty('--mouse-x-percent', this.currentX + '%');
            document.documentElement.style.setProperty('--mouse-y-percent', this.currentY + '%');
            
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    setupHoverEffects() {
        // Efeito de "levantar" para cards e botões, se desejado e estilizado em produtos.css
        // É melhor tratar isso com CSS (:hover) para performance e consistência.
        // Exemplo JS (menos performático que CSS puro):
        document.querySelectorAll('button, .article-card, .category-pill, .cta-button').forEach(element => {
            element.addEventListener('mouseenter', () => {
                // element.style.transform = 'translateY(-3px) scale(1.02)';
                // element.style.boxShadow = '0 8px 15px rgba(0,0,0,0.1)';
            });
            element.addEventListener('mouseleave', () => {
                // element.style.transform = '';
                // element.style.boxShadow = '';
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
        window.headerManager = new HeaderManager(); // Inicializa o HeaderManager
        window.mouseEffects = new MouseEffects(); 
        
        // BlogManager é inicializado por último, pois pode depender de elementos do header/DOM
        // e também porque o carregamento dos artigos pode ser a parte mais "pesada"
        window.blogManager = new BlogManager(); 
        
        console.log('✨ Blog IAutomatize inicializado com sucesso!');
        
        // Track page view
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
                    <p>Se o problema persistir, verifique o console para detalhes do erro, especialmente sobre o sitemap.xml.</p>
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
            // Certifique-se que o sw.js está na raiz do seu site ou ajuste o caminho
            const registration = await navigator.serviceWorker.register('/sw.js'); 
            console.log('✅ ServiceWorker registrado com escopo:', registration.scope);
            Utils.trackEvent('service_worker_registered');
        } catch (error) {
            console.log('❌ Falha no registro do ServiceWorker:', error);
            Utils.trackEvent('service_worker_failed', { error_message: error.message });
        }
    });
}

// Export for testing (se você usar CommonJS/Node para testes, o que não é o caso aqui para um site estático)
// Mas pode ser útil se você decidir usar um bundler no futuro.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Utils,
        BlogManager,
        // ...outras classes se necessário para teste
    };
}

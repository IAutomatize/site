/**
 * blog.js - JavaScript específico do blog
 * IAutomatize - Blog
 */

// Configurações globais
const CONFIG = {
    articlesPerPage: 9,
    recentDaysThreshold: 7,
    defaultCategory: 'Inteligência Artificial',
    sitemapCache: null,
    lastFetch: null,
    cacheExpiry: 5 * 60 * 1000 // 5 minutos
};

// Gerenciador do Blog
class BlogManager {
    constructor() {
        this.init();
    }

    init() {
        // Carregar artigos
        this.loadBlogArticles();
        
        // Setup newsletter
        this.setupNewsletter();
        
        // Setup filtros
        this.setupFilters();
        
        // Lazy loading de imagens
        this.setupLazyLoading();
        
        // Chat manager do main.js
        if (typeof ChatManager !== 'undefined') {
            new ChatManager();
        }
    }

    // Newsletter form
    setupNewsletter() {
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const emailInput = e.target.querySelector('input[type="email"]');
                const submitButton = e.target.querySelector('button[type="submit"]');
                const email = emailInput.value;
                
                submitButton.textContent = 'Enviando...';
                submitButton.disabled = true;
                
                try {
                    // Integrar com API de newsletter
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    submitButton.textContent = 'Inscrito com sucesso!';
                    submitButton.style.background = '#28a745';
                    emailInput.value = '';
                    
                    // Resetar após 3 segundos
                    setTimeout(() => {
                        submitButton.textContent = 'Assinar';
                        submitButton.style.background = '';
                        submitButton.disabled = false;
                    }, 3000);
                    
                    // Track event
                    if (typeof trackEvent === 'function') {
                        trackEvent('newsletter_inscricao', { email: email });
                    }
                    
                } catch (error) {
                    submitButton.textContent = 'Erro ao inscrever';
                    submitButton.style.background = '#dc3545';
                    
                    setTimeout(() => {
                        submitButton.textContent = 'Assinar';
                        submitButton.style.background = '';
                        submitButton.disabled = false;
                    }, 3000);
                }
            });
        }
    }

    // Formatar título do artigo
    formatTitle(filename) {
        let title = filename.replace('.html', '');
        title = title.replace(/[-_]/g, ' ');
        title = title.replace(/\b\w/g, l => l.toUpperCase());
        
        // Palavras que devem ficar em minúsculas
        const lowercaseWords = ['de', 'da', 'do', 'e', 'ou', 'a', 'o', 'para', 'com', 'em'];
        title = title.split(' ').map((word, index) => {
            if (index !== 0 && lowercaseWords.includes(word.toLowerCase())) {
                return word.toLowerCase();
            }
            return word;
        }).join(' ');
            
        return title;
    }

    // Extrair categoria do título
    extractCategory(title) {
        const categories = {
            'ia': 'Inteligência Artificial',
            'automacao': 'Automação',
            'automação': 'Automação',
            'digital': 'Transformação Digital',
            'case': 'Cases de Sucesso',
            'tutorial': 'Tutoriais',
            'guia': 'Tutoriais'
        };
        
        const lowerTitle = title.toLowerCase();
        for (const [key, value] of Object.entries(categories)) {
            if (lowerTitle.includes(key)) {
                return value;
            }
        }
        
        return CONFIG.defaultCategory;
    }

    // Gerar descrição
    generateDescription(title) {
        const templates = [
            `Descubra como ${title.toLowerCase()} pode transformar seu negócio`,
            `Guia completo sobre ${title.toLowerCase()} para empresas`,
            `Tudo o que você precisa saber sobre ${title.toLowerCase()}`,
            `${title}: conceitos, aplicações e benefícios`,
            `Como implementar ${title.toLowerCase()} na sua empresa`
        ];
        
        return templates[Math.floor(Math.random() * templates.length)];
    }

    // Criar card do blog
    createBlogCard(url, title, date, showCategory = true) {
        const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        const category = this.extractCategory(title);
        const description = this.generateDescription(title);
        const readTime = Math.floor(Math.random() * 5) + 3;
        
        return `
            <article class="blog-card" onclick="window.location.href='${url}'">
                <div class="blog-image">
                    <img src="https://source.unsplash.com/800x600/?${encodeURIComponent(category)},technology" 
                         alt="${title}" 
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/800x600/5a2ca0/ffffff?text=IAutomatize'">
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                        <span><i class="far fa-clock"></i> ${readTime} min</span>
                    </div>
                    ${showCategory ? `<span class="card-category">${category}</span>` : ''}
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <a href="${url}" class="read-more">Ler artigo <i class="fas fa-arrow-right"></i></a>
                </div>
            </article>
        `;
    }

    // Criar card do carrossel
    createCarouselCard(url, title, date) {
        const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        const category = this.extractCategory(title);
        const description = this.generateDescription(title);
        
        return `
            <article class="carousel-card" onclick="window.location.href='${url}'">
                <div class="carousel-card-content">
                    <div class="card-meta">
                        <span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                        <span class="card-category">${category}</span>
                    </div>
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <a href="${url}" class="read-more">Ler artigo <i class="fas fa-arrow-right"></i></a>
                </div>
            </article>
        `;
    }

    // Verificar se é artigo recente
    isWithinLastDays(dateStr, days) {
        const date = new Date(dateStr);
        const now = new Date();
        
        // Definir hora para 0 para comparar apenas datas
        date.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        
        const diffTime = now - date;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        console.log(`Data ${dateStr}: ${diffDays} dias atrás`);
        
        return diffDays <= days;
    }

    // Cache do JSON de posts
    async getBlogPosts() {
        const now = Date.now();
        
        // Verificar cache
        if (CONFIG.sitemapCache && CONFIG.lastFetch && (now - CONFIG.lastFetch) < CONFIG.cacheExpiry) {
            return CONFIG.sitemapCache;
        }
        
        try {
            // Buscar JSON em vez de XML
            const response = await fetch('blog-posts.json');
            const data = await response.json();
            
            // Atualizar cache
            CONFIG.sitemapCache = data.posts;
            CONFIG.lastFetch = now;
            
            return data.posts;
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
            throw error;
        }
    }

    // Skeleton loading
    showSkeletonLoading(container) {
        let skeletonHtml = '';
        for (let i = 0; i < 3; i++) {
            skeletonHtml += '<div class="skeleton skeleton-card"></div>';
        }
        container.innerHTML = skeletonHtml;
    }

    // Carregar artigos do blog
    async loadBlogArticles() {
        const blogGrid = document.getElementById('blogGrid');
        const recentArticlesCarousel = document.getElementById('recentArticlesCarousel');
        const debugInfo = document.getElementById('debugInfo');
        
        try {
            // Mostrar skeleton loading
            this.showSkeletonLoading(blogGrid);
            this.showSkeletonLoading(recentArticlesCarousel);
            
            // Carregar o sitemap com cache
            const text = await this.getSitemapContent();
            
            // Debug info
            if (debugInfo) {
                debugInfo.textContent = `Sitemap carregado: ${text.length} caracteres
URLs encontradas: ${urls.length}
Artigos de blog: ${blogArticles.length}
Debug: ${JSON.stringify(blogArticles.slice(0, 2), null, 2)}`;
                debugInfo.style.display = 'block'; // Mostrar debug temporariamente
            }
            
            // Parse XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            
            // Verificar erros
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('Erro ao analisar o XML: ' + parserError.textContent);
            }
            
            // Obter URLs - Corrigido para trabalhar com namespace
            const namespace = "http://www.sitemaps.org/schemas/sitemap/0.9";
            const urls = xmlDoc.getElementsByTagName("url"); 
            const blogArticles = [];
            
            console.log(`Encontradas ${urls.length} URLs no sitemap`);
            
            // Processar URLs
            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                const locElement = url.getElementsByTagName("loc")[0];
                const lastmodElement = url.getElementsByTagName("lastmod")[0];
                
                if (locElement) {
                    const urlStr = locElement.textContent.trim();
                    const lastmod = lastmodElement ? lastmodElement.textContent.trim() : new Date().toISOString().split('T')[0];
                    
                    console.log(`Processando URL: ${urlStr}`);
                    
                    // Verificar se é artigo de blog - ajustado para o formato do sitemap
                    if (urlStr.includes('/blog/') && urlStr.endsWith('.html') && !urlStr.endsWith('/blog.html')) {
                        const pathParts = urlStr.split('/');
                        const filename = pathParts[pathParts.length - 1];
                        
                        // Fazer a URL relativa para o site
                        const relativeUrl = urlStr.replace('https://iautomatize.com/', '');
                        
                        blogArticles.push({
                            url: relativeUrl,
                            title: this.formatTitle(filename),
                            date: lastmod,
                            category: this.extractCategory(this.formatTitle(filename))
                        });
                        
                        console.log(`Artigo adicionado: ${this.formatTitle(filename)}`);
                    }
                }
            }
            
            console.log(`Total de artigos encontrados: ${blogArticles.length}`);
            
            // Ordenar por data
            blogArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Artigos recentes para carrossel
            const recentArticles = blogArticles.filter(article => 
                this.isWithinLastDays(article.date, CONFIG.recentDaysThreshold)
            );
            
            // Renderizar carrossel
            if (recentArticles.length > 0) {
                const duplicatedArticles = [...recentArticles, ...recentArticles];
                
                let carouselHtml = '<div class="auto-carousel-wrapper">';
                duplicatedArticles.forEach(article => {
                    carouselHtml += this.createCarouselCard(article.url, article.title, article.date);
                });
                carouselHtml += '</div>';
                
                recentArticlesCarousel.innerHTML = carouselHtml;
            } else {
                recentArticlesCarousel.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-star"></i>
                        <h3>Artigos em destaque em breve</h3>
                        <p>Estamos preparando novos conteúdos incríveis para você!</p>
                    </div>
                `;
            }
            
            // Renderizar todos os artigos
            if (blogArticles.length > 0) {
                let gridHtml = '';
                
                // Limitar número de artigos por página
                const articlesToShow = blogArticles.slice(0, CONFIG.articlesPerPage);
                
                articlesToShow.forEach(article => {
                    gridHtml += this.createBlogCard(article.url, article.title, article.date);
                });
                
                blogGrid.innerHTML = gridHtml;
                
                // Paginação
                if (blogArticles.length > CONFIG.articlesPerPage) {
                    blogGrid.innerHTML += `
                        <div style="grid-column: 1/-1; text-align: center; margin-top: 40px;">
                            <button class="newsletter-button" onclick="blogManager.loadMoreArticles()">
                                Carregar mais artigos
                            </button>
                        </div>
                    `;
                }
            } else {
                blogGrid.innerHTML = `
                    <div class="no-results" style="grid-column: 1/-1;">
                        <i class="fas fa-newspaper"></i>
                        <h3>Nenhum artigo encontrado</h3>
                        <p>Em breve publicaremos novos artigos sobre IA e automação!</p>
                    </div>
                `;
            }
            
            // Atualizar schema markup
            this.updateSchemaMarkup(blogArticles);
            
        } catch (error) {
            console.error("Erro ao carregar artigos:", error);
            
            // Mensagens de erro
            const errorMessage = `
                <div class="no-results">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Ops! Algo deu errado</h3>
                    <p>Não foi possível carregar os artigos no momento. Por favor, tente novamente.</p>
                    <button class="newsletter-button" onclick="location.reload()" style="margin-top: 20px;">
                        Tentar novamente
                    </button>
                </div>
            `;
            
            blogGrid.innerHTML = errorMessage;
            recentArticlesCarousel.innerHTML = errorMessage;
        }
    }

    // Carregar mais artigos
    loadMoreArticles() {
        // Implementar paginação futura
        console.log('Carregar mais artigos...');
    }

    // Update schema markup
    updateSchemaMarkup(articles) {
        const schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (schemaScript) {
            const schema = JSON.parse(schemaScript.textContent);
            
            schema.blogPost = articles.slice(0, 10).map(article => ({
                "@type": "BlogPosting",
                "headline": article.title,
                "datePublished": article.date,
                "dateModified": article.date,
                "url": article.url,
                "author": {
                    "@type": "Organization",
                    "name": "IAutomatize"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "IAutomatize",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://github.com/user-attachments/assets/8a9ba7b7-5085-42f3-a808-7bef3554fb1d"
                    }
                }
            }));
            
            schemaScript.textContent = JSON.stringify(schema);
        }
    }

    // Setup filtros
    setupFilters() {
        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', function() {
                // Remover active de todos
                document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
                
                // Adicionar active ao clicado
                this.classList.add('active');
                
                // Filtrar artigos
                const category = this.textContent;
                console.log('Filtrar por categoria:', category);
                
                // Track event
                if (typeof trackEvent === 'function') {
                    trackEvent('blog_filtro_categoria', { categoria: category });
                }
            });
        });
    }

    // Lazy loading de imagens
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('skeleton');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px'
            });

            // Observar imagens após carregar
            setTimeout(() => {
                document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                    imageObserver.observe(img);
                });
            }, 500);
        }
    }
}

// Mobile menu específico do blog (se necessário)
function setupBlogMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const menu = document.querySelector('.menu');

    if (mobileToggle && menu) {
        mobileToggle.addEventListener('click', function() {
            menu.classList.toggle('active');
            if (menu.classList.contains('active')) {
                mobileToggle.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
}

// Scroll suave para links internos
function setupSmoothScroll() {
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
}

// Analytics e tracking
function trackBlogEvent(eventName, eventData) {
    if (typeof trackEvent === 'function') {
        trackEvent(eventName, eventData);
    } else {
        console.log('Track event:', eventName, eventData);
    }
}

// Performance monitoring
function monitorBlogPerformance() {
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Blog carregado em ${pageLoadTime}ms`);
        
        trackBlogEvent('blog_performance', {
            tempo_carregamento_ms: pageLoadTime
        });
    });
}

// Função de debug para testes
window.debugBlog = function() {
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) {
        debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
    }
    
    console.log('Config:', CONFIG);
    console.log('BlogManager instance:', blogManager);
    
    // Tentar fazer o parse do XML novamente
    fetch('sitemap.xml')
        .then(response => response.text())
        .then(text => {
            console.log('Sitemap raw:', text.substring(0, 500));
            
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            
            // Testar com namespace
            const namespace = "http://www.sitemaps.org/schemas/sitemap/0.9";
            const urls = xmlDoc.getElementsByTagNameNS(namespace, "url");
            console.log('URLs com namespace:', urls.length);
            
            // Testar sem namespace
            const urlsNoNS = xmlDoc.getElementsByTagName("url");
            console.log('URLs sem namespace:', urlsNoNS.length);
            
            // Mostrar primeira URL
            if (urls.length > 0) {
                const firstUrl = urls[0];
                const loc = firstUrl.getElementsByTagNameNS(namespace, "loc")[0];
                console.log('Primeira URL:', loc ? loc.textContent : 'não encontrada');
            }
        })
        .catch(error => console.error('Erro ao debugar:', error));
};

// Instância global do BlogManager
let blogManager;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Criar instância do BlogManager
    blogManager = new BlogManager();
    
    // Setup adicional
    setupBlogMobileMenu();
    setupSmoothScroll();
    monitorBlogPerformance();
    registerServiceWorker();
    
    // Atualizar ano no footer
    const currentYear = new Date().getFullYear();
    document.querySelectorAll('.footer-bottom p').forEach(el => {
        el.textContent = el.textContent.replace('2025', currentYear);
    });
    
    console.log('Blog inicializado com sucesso!');
});

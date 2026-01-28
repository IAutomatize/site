/**
 * Structured Data & SEO Configuration
 * Schema.org implementation for better search visibility
 */

class StructuredDataManager {
    constructor() {
        this.organizationData = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "IAutomatize",
            "alternateName": "IAutomatize - Inteligência Artificial",
            "url": "https://iautomatize.pro",
            "logo": {
                "@type": "ImageObject",
                "url": "https://github.com/user-attachments/assets/8a9ba7b7-5085-42f3-a808-7bef3554fb1d",
                "width": 200,
                "height": 200
            },
            "description": "A maior empresa de IA para negócios digitais do Brasil, transformando empresas através da inteligência artificial.",
            "foundingDate": "2023",
            "founders": [{
                "@type": "Person",
                "name": "Fundador IAutomatize"
            }],
            "contactPoint": [{
                "@type": "ContactPoint",
                "telephone": "+55-15-99107-5698",
                "contactType": "customer service",
                "areaServed": "BR",
                "availableLanguage": ["Portuguese", "English"]
            }],
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "São Paulo",
                "addressRegion": "SP",
                "addressCountry": "BR"
            },
            "sameAs": [
                "https://www.linkedin.com/company/iautomatize",
                "https://www.instagram.com/iautomatize",
                "https://twitter.com/iautomatize"
            ],
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Serviços de IA e Automação",
                "itemListElement": [{
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Consultoria em Inteligência Artificial",
                        "description": "Consultoria especializada em implementação de IA para negócios"
                    }
                }, {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": "Automação de Processos",
                        "description": "Automação inteligente de processos empresariais"
                    }
                }]
            }
        };

        this.websiteData = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "IAutomatize",
            "url": "https://iautomatize.pro",
            "description": "Blog sobre inteligência artificial e automação para negócios",
            "publisher": {
                "@type": "Organization",
                "name": "IAutomatize",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://github.com/user-attachments/assets/8a9ba7b7-5085-42f3-a808-7bef3554fb1d"
                }
            },
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://iautomatize.pro/blog.html?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
            }
        };

        this.blogData = {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Blog IAutomatize",
            "description": "Insights sobre inteligência artificial e automação para transformar seu negócio",
            "url": "https://iautomatize.pro/blog.html",
            "publisher": {
                "@type": "Organization",
                "name": "IAutomatize",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://github.com/user-attachments/assets/8a9ba7b7-5085-42f3-a808-7bef3554fb1d"
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "https://iautomatize.pro/blog.html"
            },
            "inLanguage": "pt-BR",
            "keywords": [
                "inteligência artificial",
                "automação",
                "IA",
                "machine learning",
                "tecnologia",
                "negócios digitais",
                "transformação digital",
                "chatbots",
                "processos automatizados"
            ],
            "about": [{
                "@type": "Thing",
                "name": "Inteligência Artificial",
                "sameAs": "https://en.wikipedia.org/wiki/Artificial_intelligence"
            }, {
                "@type": "Thing",
                "name": "Automação",
                "sameAs": "https://en.wikipedia.org/wiki/Automation"
            }],
            "audience": {
                "@type": "Audience",
                "audienceType": "Business professionals, entrepreneurs, technology enthusiasts"
            }
        };
    }

    // Initialize all structured data
    init() {
        this.addOrganizationData();
        this.addWebsiteData();
        this.addBlogData();
        this.addBreadcrumbData();
        this.setupArticleGeneration();
    }

    // Add organization structured data
    addOrganizationData() {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(this.organizationData);
        document.head.appendChild(script);
    }

    // Add website structured data
    addWebsiteData() {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(this.websiteData);
        document.head.appendChild(script);
    }

    // Add blog structured data
    addBlogData() {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(this.blogData);
        document.head.appendChild(script);
    }

    // Add breadcrumb structured data
    addBreadcrumbData() {
        const breadcrumbData = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://iautomatize.pro"
            }, {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://iautomatize.pro/blog.html"
            }]
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(breadcrumbData);
        document.head.appendChild(script);
    }

    // Generate article structured data
    generateArticleData(article) {
        const articleData = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": article.title,
            "description": article.description,
            "image": {
                "@type": "ImageObject",
                "url": `https://source.unsplash.com/1200x630/?${encodeURIComponent(article.category)},technology,AI`,
                "width": 1200,
                "height": 630
            },
            "author": {
                "@type": "Organization",
                "name": "IAutomatize",
                "url": "https://iautomatize.pro"
            },
            "publisher": {
                "@type": "Organization",
                "name": "IAutomatize",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://github.com/user-attachments/assets/8a9ba7b7-5085-42f3-a808-7bef3554fb1d"
                }
            },
            "datePublished": article.date,
            "dateModified": article.date,
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://iautomatize.pro/${article.url}`
            },
            "url": `https://iautomatize.pro/${article.url}`,
            "articleSection": article.category,
            "keywords": this.generateKeywords(article),
            "wordCount": this.estimateWordCount(article),
            "timeRequired": `PT${article.readTime}M`,
            "inLanguage": "pt-BR",
            "isAccessibleForFree": true,
            "about": [{
                "@type": "Thing",
                "name": article.category,
                "sameAs": this.getCategoryWikipediaUrl(article.category)
            }]
        };

        return articleData;
    }

    // Generate FAQ structured data for articles
    generateFAQData(article) {
        const faqData = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
                "@type": "Question",
                "name": `O que é ${article.category.toLowerCase()}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `${article.category} é uma tecnologia fundamental para a transformação digital de empresas, permitindo maior eficiência e inovação nos processos de negócio.`
                }
            }, {
                "@type": "Question",
                "name": `Como implementar ${article.category.toLowerCase()} na minha empresa?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `A implementação de ${article.category.toLowerCase()} requer análise detalhada dos processos atuais, definição de objetivos claros e escolha das ferramentas adequadas. Recomendamos começar com um projeto piloto.`
                }
            }, {
                "@type": "Question",
                "name": `Quais são os benefícios de ${article.category.toLowerCase()}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Os principais benefícios incluem aumento de produtividade, redução de custos, melhoria na qualidade dos serviços e maior competitividade no mercado.`
                }
            }]
        };

        return faqData;
    }

    // Generate HowTo structured data
    generateHowToData(article) {
        const howToData = {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": `Como implementar ${article.category.toLowerCase()}`,
            "description": article.description,
            "image": {
                "@type": "ImageObject",
                "url": `https://source.unsplash.com/800x600/?${encodeURIComponent(article.category)},tutorial,guide`
            },
            "totalTime": `PT${article.readTime}M`,
            "estimatedCost": {
                "@type": "MonetaryAmount",
                "currency": "BRL",
                "value": "0"
            },
            "supply": [{
                "@type": "HowToSupply",
                "name": "Computador ou dispositivo móvel"
            }, {
                "@type": "HowToSupply",
                "name": "Conexão com internet"
            }],
            "tool": [{
                "@type": "HowToTool",
                "name": "Navegador web atualizado"
            }],
            "step": [{
                "@type": "HowToStep",
                "name": "Análise inicial",
                "text": "Identifique os processos que podem ser otimizados",
                "url": `https://iautomatize.pro/${article.url}#step-1`
            }, {
                "@type": "HowToStep",
                "name": "Planejamento",
                "text": "Defina objetivos e métricas de sucesso",
                "url": `https://iautomatize.pro/${article.url}#step-2`
            }, {
                "@type": "HowToStep",
                "name": "Implementação",
                "text": "Execute o projeto seguindo as melhores práticas",
                "url": `https://iautomatize.pro/${article.url}#step-3`
            }, {
                "@type": "HowToStep",
                "name": "Monitoramento",
                "text": "Acompanhe os resultados e faça ajustes necessários",
                "url": `https://iautomatize.pro/${article.url}#step-4`
            }]
        };

        return howToData;
    }

    // Setup article generation when articles are loaded
    setupArticleGeneration() {
        window.addEventListener('articlesLoaded', (event) => {
            const articles = event.detail.articles;
            this.addArticleListData(articles);
        });
    }

    // Add article list structured data
    addArticleListData(articles) {
        const itemListData = {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Artigos do Blog IAutomatize",
            "description": "Lista dos artigos mais recentes sobre IA e automação",
            "numberOfItems": articles.length,
            "itemListElement": articles.slice(0, 10).map((article, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://iautomatize.pro/${article.url}`,
                "name": article.title,
                "description": article.description,
                "image": `https://source.unsplash.com/400x200/?${encodeURIComponent(article.category)},AI`,
                "datePublished": article.date
            }))
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(itemListData);
        document.head.appendChild(script);
    }

    // Utility functions
    generateKeywords(article) {
        const baseKeywords = [
            'inteligência artificial',
            'automação',
            'IA',
            'tecnologia',
            'negócios digitais',
            'transformação digital'
        ];

        const categoryKeywords = {
            'Inteligência Artificial': ['machine learning', 'deep learning', 'AI', 'algoritmos', 'dados'],
            'Automação': ['processos', 'robôs', 'workflow', 'eficiência', 'produtividade'],
            'Transformação Digital': ['digitalização', 'inovação', 'tecnologia', 'mudança', 'modernização'],
            'Cases de Sucesso': ['casos', 'exemplos', 'resultados', 'experiência', 'implementação'],
            'Tutoriais': ['guia', 'passo a passo', 'como fazer', 'tutorial', 'aprender']
        };

        const specific = categoryKeywords[article.category] || [];
        return [...baseKeywords, ...specific];
    }

    estimateWordCount(article) {
        // Estimate based on description length and category
        const baseWords = article.description.split(' ').length * 20;
        const categoryMultiplier = {
            'Tutoriais': 1.5,
            'Cases de Sucesso': 1.3,
            'Inteligência Artificial': 1.2,
            'Automação': 1.1,
            'Transformação Digital': 1.0
        };

        return Math.round(baseWords * (categoryMultiplier[article.category] || 1));
    }

    getCategoryWikipediaUrl(category) {
        const urls = {
            'Inteligência Artificial': 'https://pt.wikipedia.org/wiki/Intelig%C3%AAncia_artificial',
            'Automação': 'https://pt.wikipedia.org/wiki/Automa%C3%A7%C3%A3o',
            'Transformação Digital': 'https://pt.wikipedia.org/wiki/Transforma%C3%A7%C3%A3o_digital',
            'Cases de Sucesso': 'https://pt.wikipedia.org/wiki/Estudo_de_caso',
            'Tutoriais': 'https://pt.wikipedia.org/wiki/Tutorial'
        };

        return urls[category] || 'https://pt.wikipedia.org/wiki/Tecnologia';
    }
}

// SEO Meta Tags Manager
class SEOManager {
    constructor() {
        this.defaultMeta = {
            title: 'Blog IAutomatize | Inteligência Artificial e Automação',
            description: 'Blog sobre inteligência artificial e automação para transformar seu negócio. Insights, tutoriais e cases de sucesso.',
            keywords: 'inteligência artificial, automação, IA, tecnologia, negócios digitais, transformação digital',
            image: 'https://github.com/user-attachments/assets/8a9ba7b7-5085-42f3-a808-7bef3554fb1d',
            url: 'https://iautomatize.pro/blog.html'
        };
    }

    // Update meta tags for specific article
    updateArticleMeta(article) {
        const meta = {
            title: `${article.title} | Blog IAutomatize`,
            description: article.description,
            keywords: this.generateKeywords(article).join(', '),
            image: `https://source.unsplash.com/1200x630/?${encodeURIComponent(article.category)},technology,AI`,
            url: `https://iautomatize.pro/${article.url}`,
            type: 'article',
            publishedTime: article.date,
            modifiedTime: article.date,
            section: article.category,
            tags: this.generateKeywords(article)
        };

        this.setMetaTags(meta);
    }

    // Set meta tags
    setMetaTags(meta) {
        // Title
        document.title = meta.title;
        this.updateMetaTag('meta[name="description"]', meta.description);
        this.updateMetaTag('meta[name="keywords"]', meta.keywords);

        // Open Graph
        this.updateMetaTag('meta[property="og:title"]', meta.title);
        this.updateMetaTag('meta[property="og:description"]', meta.description);
        this.updateMetaTag('meta[property="og:image"]', meta.image);
        this.updateMetaTag('meta[property="og:url"]', meta.url);
        this.updateMetaTag('meta[property="og:type"]', meta.type || 'website');

        if (meta.publishedTime) {
            this.updateMetaTag('meta[property="article:published_time"]', meta.publishedTime);
        }
        if (meta.modifiedTime) {
            this.updateMetaTag('meta[property="article:modified_time"]', meta.modifiedTime);
        }
        if (meta.section) {
            this.updateMetaTag('meta[property="article:section"]', meta.section);
        }

        // Twitter Cards
        this.updateMetaTag('meta[name="twitter:title"]', meta.title);
        this.updateMetaTag('meta[name="twitter:description"]', meta.description);
        this.updateMetaTag('meta[name="twitter:image"]', meta.image);
        this.updateMetaTag('meta[name="twitter:url"]', meta.url);

        // Canonical URL
        this.updateCanonicalUrl(meta.url);
    }

    // Update individual meta tag
    updateMetaTag(selector, content) {
        let tag = document.querySelector(selector);
        if (!tag) {
            tag = document.createElement('meta');
            if (selector.includes('property=')) {
                tag.setAttribute('property', selector.match(/property="([^"]+)"/)[1]);
            } else {
                tag.setAttribute('name', selector.match(/name="([^"]+)"/)[1]);
            }
            document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
    }

    // Update canonical URL
    updateCanonicalUrl(url) {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', url);
    }

    // Generate keywords for article
    generateKeywords(article) {
        return new StructuredDataManager().generateKeywords(article);
    }
}

// Performance Analytics
class PerformanceAnalytics {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        this.observeWebVitals();
        this.trackUserEngagement();
        this.trackConversionEvents();
        this.reportToAnalytics();
    }

    observeWebVitals() {
        // Already implemented in main JS file
        // This would integrate with existing performance monitoring
    }

    trackUserEngagement() {
        // Track scroll depth
        let maxScroll = 0;
        const trackScroll = Utils.throttle(() => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > maxScroll) {
                maxScroll = Math.round(scrollPercent);
                if (maxScroll % 25 === 0 && maxScroll > 0) {
                    this.trackEvent('scroll_depth', { depth: maxScroll });
                }
            }
        }, 1000);

        window.addEventListener('scroll', trackScroll, { passive: true });

        // Track time on page
        const startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            this.trackEvent('time_on_page', { duration: timeOnPage });
        });

        // Track clicks on articles
        document.addEventListener('click', (e) => {
            const articleCard = e.target.closest('.article-card');
            if (articleCard) {
                const title = articleCard.querySelector('.article-title')?.textContent;
                const category = articleCard.dataset.category;
                this.trackEvent('article_click', { title, category });
            }
        });
    }

    trackConversionEvents() {
        // Newsletter signup tracking
        window.addEventListener('newsletterSignup', (e) => {
            this.trackEvent('newsletter_conversion', {
                email: e.detail.email,
                source: e.detail.source || 'blog'
            });
        });

        // Exit intent tracking
        window.addEventListener('exitIntentShown', () => {
            this.trackEvent('exit_intent_shown');
        });

        window.addEventListener('exitIntentConversion', (e) => {
            this.trackEvent('exit_intent_conversion', {
                email: e.detail.email
            });
        });
    }

    trackEvent(eventName, eventData = {}) {
        // Send to Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                ...eventData,
                custom_parameter: 'blog_interaction'
            });
        }

        // Send to Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('trackCustom', eventName, eventData);
        }

        // Store in local analytics
        this.metrics[eventName] = this.metrics[eventName] || [];
        this.metrics[eventName].push({
            ...eventData,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });
    }

    reportToAnalytics() {
        // Report metrics to analytics service
        setInterval(() => {
            if (Object.keys(this.metrics).length > 0) {
                fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.metrics)
                }).then(() => {
                    this.metrics = {}; // Clear after sending
                }).catch(error => {
                    console.log('Analytics reporting failed:', error);
                });
            }
        }, 30000); // Report every 30 seconds
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.structuredDataManager = new StructuredDataManager();
    window.seoManager = new SEOManager();
    window.performanceAnalytics = new PerformanceAnalytics();
    
    // Initialize structured data
    window.structuredDataManager.init();
    
    console.log('📊 SEO and Analytics initialized');
});
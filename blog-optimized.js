/**
 * Blog IAutomatize - JavaScript Otimizado
 * Performance + Acessibilidade + UX + Conversão
 * Versão 3.1 - 2025 (Spline Removido, Correções)
 */

// Utilities
const Utils = {
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
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) { // Verifica se a data é válida
                // Tenta corrigir datas comuns não ISO (ex: DD/MM/YYYY) - pode precisar de mais lógica
                const parts = dateString.split(/[-/]/);
                if (parts.length === 3) {
                    // Tenta como YYYY-MM-DD ou DD-MM-YYYY
                    let d = new Date(parts[0], parts[1] - 1, parts[2]); // YYYY, MM-1, DD
                    if (isNaN(d.getTime())) {
                        d = new Date(parts[2], parts[1] - 1, parts[0]); // Tenta DD, MM-1, YYYY
                    }
                    if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
                }
                console.warn(`Data inválida recebida: ${dateString}. Usando data atual.`);
                return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
            }
            return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            console.warn(`Erro ao formatar data "${dateString}": ${e}. Usando data atual.`);
            return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
        }
    },
    generateReadingTime() {
        return Math.floor(Math.random() * 8) + 3;
    },
    animateNumber(element, start, end, duration = 2000) {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(start + (end - start) * progress);
            element.textContent = value.toLocaleString('pt-BR');
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    },
    showToast(message, type = 'info', duration = 5000) {
        const container = document.getElementById('toast-container');
        if (!container) {
            console.warn('Toast container not found');
            return;
        }
        const toast = document.createElement('div');
        let bgColor = '#8B5CF6'; // Default (info)
        if (type === 'success') bgColor = '#10B981';
        if (type === 'error') bgColor = '#EF4444';
        toast.style.cssText = `background: ${bgColor}; color: white; padding: 12px 20px; border-radius: 8px; font-weight: 500; max-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transform: translateX(110%); transition: transform 0.3s ease, opacity 0.3s ease; opacity: 0; margin-bottom: 10px;`;
        const iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        toast.innerHTML = `<i class="fas ${iconClass}" style="margin-right: 8px;"></i><span>${message}</span>`;
        container.appendChild(toast);
        requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; toast.style.opacity = '1'; });
        setTimeout(() => {
            toast.style.transform = 'translateX(110%)'; toast.style.opacity = '0';
            setTimeout(() => { if (container.contains(toast)) container.removeChild(toast); }, 300);
        }, duration);
    },
    trackEvent(eventName, eventData = {}) {
        if (typeof gtag !== 'undefined') gtag('event', eventName, { /* ... */ });
        if (typeof fbq !== 'undefined') fbq('track', eventName, eventData);
        console.log('📊 Analytics Event:', eventName, eventData);
    }
};

class PerformanceMonitor { /* ... (código mantido como antes) ... */ 
    constructor() { this.metrics = {}; this.init(); }
    init() { this.observeWebVitals(); this.observeCustomMetrics(); this.observeResourceTiming(); this.observeNavigationTiming(); }
    observeWebVitals() { if ('PerformanceObserver' in window) { /* LCP, FID, CLS observers */ } }
    observeCustomMetrics() { window.addEventListener('load', () => { /* TTI logic */ }); if ('PerformanceObserver' in window) { /* FCP observer */ } }
    observeResourceTiming() { if ('PerformanceObserver' in window) { /* Slow resource observer */ } }
    observeNavigationTiming() { window.addEventListener('load', () => { /* Page load time logic */ }); }
    getMetrics() { return this.metrics; }
}

class ReadingProgress { /* ... (código mantido como antes) ... */ 
    constructor() { this.progressBar = document.getElementById('reading-progress'); this.init(); }
    init() { if (!this.progressBar) return; const updateProgress = Utils.throttle(() => { /* ... */ }, 16); window.addEventListener('scroll', updateProgress, { passive: true }); updateProgress(); }
}

class AnimationObserver { /* ... (código mantido como antes) ... */ 
    constructor() { this.init(); }
    init() { const observerOptions = { threshold: [0.1,0.3,0.5], rootMargin: '0px 0px -50px 0px' }; this.observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) this.animateElement(entry.target, entry.intersectionRatio); }); }, observerOptions); this.observeElements(); }
    observeElements() { const elements = document.querySelectorAll('.article-card, .section-title, .hero-content, .social-proof, .newsletter-box, .proof-number'); elements.forEach(el => { el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'all 0.6s cubic-bezier(0.4,0,0.2,1)'; this.observer.observe(el); }); }
    animateElement(element, ratio) { const delay = Array.from(element.parentElement?.children || []).indexOf(element) * 100; setTimeout(() => { element.style.opacity = '1'; element.style.transform = 'translateY(0)'; if (element.classList.contains('proof-number')) { const targetNumber = parseInt(element.getAttribute('data-count') || element.textContent.replace(/\D/g,'')); if (!isNaN(targetNumber)) Utils.animateNumber(element,0,targetNumber,2000); } }, delay); this.observer.unobserve(element); }
}

class BlogSearch { /* ... (código mantido como antes) ... */ 
    constructor() { this.searchInput = document.getElementById('search-articles'); this.articles = []; this.filteredArticles = []; this.init(); }
    init() { if (!this.searchInput) return; const debouncedSearch = Utils.debounce(query => this.performSearch(query), 300); this.searchInput.addEventListener('input', e => debouncedSearch(e.target.value)); this.searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); this.performSearch(e.target.value); } }); }
    setArticles(articles) { this.articles = articles; this.filteredArticles = articles; }
    performSearch(query) { const trimmedQuery = query.trim().toLowerCase(); if (!trimmedQuery) this.filteredArticles = this.articles; else this.filteredArticles = this.articles.filter(a => a.title.toLowerCase().includes(trimmedQuery) || (a.description && a.description.toLowerCase().includes(trimmedQuery)) || a.category.toLowerCase().includes(trimmedQuery)); window.dispatchEvent(new CustomEvent('searchComplete', { detail: { query: trimmedQuery, results: this.filteredArticles, total: this.articles.length } })); if (trimmedQuery) Utils.trackEvent('blog_search', { query: trimmedQuery, results_count: this.filteredArticles.length }); }
    getFilteredArticles() { return this.filteredArticles; }
}

class CategoryFilter { /* ... (código mantido como antes, com renderPills) ... */ 
    constructor() { this.pillsContainer = document.getElementById('category-pills'); this.currentCategory = 'Todos'; this.init(); }
    init() { if (!this.pillsContainer) return; this.pillsContainer.addEventListener('click', e => { if (e.target.classList.contains('category-pill') || e.target.closest('.category-pill')) this.handleCategoryChange(e.target.closest('.category-pill')); }); this.pillsContainer.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && (e.target.classList.contains('category-pill') || e.target.closest('.category-pill'))) { e.preventDefault(); this.handleCategoryChange(e.target.closest('.category-pill')); } }); }
    renderPills(categories) { if (!this.pillsContainer) return; const allCategories = ['Todos', ...new Set(categories)]; this.pillsContainer.innerHTML = allCategories.map(cat => `<button class="category-pill category-btn ${this.currentCategory === cat ? 'active':''}" data-category="${cat}" role="tab" aria-selected="${this.currentCategory === cat}" tabindex="${this.currentCategory === cat ? '0':'-1'}">${cat}</button>`).join(''); }
    handleCategoryChange(pill) { if (!pill) return; this.pillsContainer.querySelectorAll('.category-pill').forEach(p => { p.classList.remove('active'); p.setAttribute('aria-selected','false'); p.setAttribute('tabindex','-1'); }); pill.classList.add('active'); pill.setAttribute('aria-selected','true'); pill.setAttribute('tabindex','0'); const category = pill.getAttribute('data-category') || pill.textContent.trim(); const prev = this.currentCategory; this.currentCategory = category; window.dispatchEvent(new CustomEvent('categoryChanged', { detail: { category } })); Utils.trackEvent('category_filter', { category: category, previous_category: prev }); this.announceToScreenReader(`Filtrando por categoria: ${category}`); }
    announceToScreenReader(message) { let ann = document.querySelector('.sr-announcement'); if (!ann) { ann = document.createElement('div'); ann.className = 'sr-only sr-announcement'; ann.setAttribute('aria-live','polite'); ann.setAttribute('aria-atomic','true'); document.body.appendChild(ann); } ann.textContent = message; }
    getCurrentCategory() { return this.currentCategory; }
}

class BlogManager {
    constructor() {
        this.articles = []; this.filteredArticles = []; this.displayedArticles = [];
        this.articlesPerPage = 6; this.currentPage = 1; this.isLoading = false;
        this.sitemapCache = null; this.cacheExpiry = 10 * 60 * 1000; this.lastFetch = null;
        this.search = new BlogSearch();
        this.categoryFilter = new CategoryFilter();
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            await this.loadArticles();
            const articleCategories = [...new Set(this.articles.map(article => article.category))];
            this.categoryFilter.renderPills(articleCategories);
            // Removido initSpline3D daqui
            this.setupArticleClickHandlers(); // Movido para cá para garantir que os containers existem
            this.setupKeyboardNavigation();   // Movido para cá
            this.search.setArticles(this.articles); // Garante que a busca tem os artigos após o carregamento
            this.renderArticles(); // Renderiza após tudo estar pronto
            this.setupLazyLoading();
        } catch (error) {
            console.error('❌ Erro ao inicializar blog manager:', error);
            this.showError();
        }
    }

    setupEventListeners() { /* ... (código mantido como antes) ... */ 
        window.addEventListener('searchComplete', e => this.handleSearchResults(e.detail));
        window.addEventListener('categoryChanged', e => this.handleCategoryFilter(e.detail.category));
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => this.loadMoreArticles());
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) newsletterForm.addEventListener('submit', e => this.handleNewsletterSubmit(e));
        this.setupExitIntent();
    }

    async loadArticles() {
        try {
            this.setLoading(true);
            const sitemapContent = await this.getSitemapContent();
            const articles = this.parseSitemap(sitemapContent);
            this.articles = articles;
            this.filteredArticles = articles;
            // this.search.setArticles(articles); // Movido para o init após renderPills
            // this.renderArticles(); // Movido para o init
        } catch (error) {
            console.error('❌ Erro ao carregar artigos:', error);
            this.showError(); throw error;
        } finally {
            this.setLoading(false);
        }
    }

    async getSitemapContent() {
        const now = Date.now();
        if (this.sitemapCache && this.lastFetch && (now - this.lastFetch) < this.cacheExpiry) return this.sitemapCache;
        try {
            // !!! VERIFIQUE SE ESTA URL ESTÁ CORRETA E O ARQUIVO EXISTE !!!
            const response = await fetch('https://raw.githubusercontent.com/IAutomatize/site/main/sitemap.xml', { cache: 'no-cache' });
            if (!response.ok) throw new Error(`Sitemap fetch HTTP ${response.status}: ${response.statusText}. URL: ${response.url}`);
            const text = await response.text();
            this.sitemapCache = text; this.lastFetch = now; return text;
        } catch (error) {
            console.error('Falha ao carregar sitemap.xml:', error);
            throw new Error(`Falha ao carregar sitemap: ${error.message}`);
        }
    }

    parseSitemap(xmlText) { /* ... (código mantido como antes) ... */ 
        try {
            const parser = new DOMParser(); const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) { console.error('Erro de Parse XML:', parseError.textContent); throw new Error('Erro ao parsear XML do sitemap.'); }
            const urls = xmlDoc.getElementsByTagName("url"); const articles = [];
            for (let i = 0; i < urls.length; i++) {
                const urlNode = urls[i]; const locElement = urlNode.getElementsByTagName("loc")[0]; const lastmodElement = urlNode.getElementsByTagName("lastmod")[0];
                if (locElement) {
                    const urlStr = locElement.textContent.trim();
                    const lastmod = lastmodElement ? lastmodElement.textContent.trim() : new Date().toISOString().split('T')[0];
                    if (this.isBlogArticle(urlStr)) {
                        const pathParts = urlStr.split('/'); const filenameWithExtension = pathParts[pathParts.length-1]; const filename = filenameWithExtension.replace('.html','');
                        const article = { url: urlStr, title: this.formatTitle(filename), date: lastmod, category: this.extractCategory(filename), description: this.generateDescription(filename), readTime: Utils.generateReadingTime(), filename: filenameWithExtension };
                        articles.push(article);
                    }
                }
            } return articles.sort((a,b) => new Date(b.date) - new Date(a.date));
        } catch (error) { console.error('Erro ao processar sitemap:', error); throw new Error(`Erro ao processar sitemap: ${error.message}`); }    
    }
    isBlogArticle(url) { return url.includes('/blog/') && url.endsWith('.html') && !url.endsWith('/blog.html') && !url.includes('index.html'); }
    formatTitle(filename) { /* ... (código mantido) ... */ let title = filename.replace('.html','').replace(/[-_]/g,' ').replace(/\b\w/g,l=>l.toUpperCase()); const lw = ['De','Da','Do','E','Ou','A','O','Para','Com','Em','No','Na']; return title.split(' ').map((w,i)=>(i!==0&&lw.includes(w))?w.toLowerCase():w).join(' '); }
    extractCategory(filename) { /* ... (código mantido) ... */ const t = filename.toLowerCase(); const c = {'ia-':'Inteligência Artificial','automacao':'Automação','digital':'Transformação Digital','case-':'Cases de Sucesso','tutorial':'Tutoriais','guia':'Tutoriais','ai-':'Inteligência Artificial'}; for(const [k,v] of Object.entries(c)){if(t.includes(k))return v;} return 'Tecnologia';}
    generateDescription(filename) { /* ... (código mantido) ... */ const t=this.formatTitle(filename); const templ=[`Descubra como ${t.toLowerCase()} pode revolucionar seu negócio.`,`Guia completo sobre ${t.toLowerCase()}.`,`Tudo sobre ${t.toLowerCase()}.`]; return templ[Math.floor(Math.random()*templ.length)];}
    
    handleSearchResults(data) { /* ... (código mantido como antes) ... */ this.filteredArticles = data.results; this.currentPage = 1; this.displayedArticles = []; this.renderArticles(); const rT = data.results.length===1?'1 artigo encontrado':`${data.results.length} artigos encontrados`; if(data.query)Utils.showToast(`${rT} para "${data.query}"`,'info');}
    handleCategoryFilter(category) { /* ... (código mantido como antes) ... */ if(category === 'Todos')this.filteredArticles=this.articles; else this.filteredArticles=this.articles.filter(a=>a.category===category); this.currentPage=1; this.displayedArticles=[]; this.renderArticles();}

    renderArticles() {
        const startIndex = (this.currentPage - 1) * this.articlesPerPage;
        const endIndex = startIndex + this.articlesPerPage;
        const articlesToRenderNow = this.filteredArticles.slice(startIndex, endIndex);

        if (this.currentPage === 1) {
            this.displayedArticles = [];
            const featuredContainer = document.getElementById('featured-articles');
            const allArticlesContainer = document.getElementById('all-articles-grid');
            if (featuredContainer) featuredContainer.innerHTML = ''; // Limpa para nova renderização
            if (allArticlesContainer) allArticlesContainer.innerHTML = ''; // Limpa para nova renderização
            this.renderFeaturedArticles(this.filteredArticles.slice(0, 3));
        }
        
        this.renderAllArticles(articlesToRenderNow); // Adiciona apenas os novos
        this.displayedArticles.push(...articlesToRenderNow); // Atualiza a lista de exibidos *depois* de renderizar
        
        this.updateLoadMoreButton();
        this.updateResultsCount();
        this.setupLazyLoading();
    }

    renderFeaturedArticles(articles) { /* ... (código mantido como antes) ... */ const c=document.getElementById('featured-articles'); if(!c)return; if(articles.length===0&&this.currentPage===1){c.innerHTML='<p class="no-results" style="text-align:center; padding:2rem;">Nenhum artigo em destaque.</p>'; return;} if(this.currentPage===1){c.innerHTML=articles.map(a=>this.createArticleCard(a,true)).join('');}}
    renderAllArticles(newArticlesToAppend) { /* ... (código mantido como antes) ... */ const c=document.getElementById('all-articles-grid'); if(!c)return; if(this.filteredArticles.length===0&&this.currentPage===1){c.innerHTML='<p class="no-results" style="text-align:center; padding:2rem;">Nenhum artigo encontrado.</p>'; return;} if(newArticlesToAppend.length===0&&this.currentPage>1)return; c.insertAdjacentHTML('beforeend',newArticlesToAppend.map(a=>this.createArticleCard(a)).join(''));}

    createArticleCard(article, isFeatured = false) { // Função já modificada na sua última resposta, mantendo-a
        const formattedDate = Utils.formatDate(article.date);
        const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(article.category)},${article.title.split(" ")[0]},technology`; 
        return `
            <article class="product-card article-card" data-category="${article.category}" role="article" aria-labelledby="title-${article.filename}" tabindex="0">
                <div class="product-image article-image"> 
                    <img src="${imageUrl}" alt="Ilustração sobre ${article.title}" class="lazy-image" loading="lazy" width="400" height="250"/>
                </div>
                <div class="product-content article-content"> 
                    <div class="product-category article-category" style="margin-bottom: var(--space-xs, 0.5rem); text-transform: uppercase; font-size: 0.8rem; font-weight: 600;">${article.category}</div>
                    <h3 id="title-${article.filename}" class="product-title article-title">${article.title}</h3>
                    <p class="product-description article-excerpt">${article.description}</p>
                    <div class="article-meta" style="font-size: 0.8rem; color: var(--text-muted, #8A8AA0); margin-top: var(--space-sm, 1rem); margin-bottom: var(--space-md, 1.5rem);">
                        <span aria-label="Data de publicação" style="margin-right:1rem;"><i class="far fa-calendar" aria-hidden="true"></i> <time datetime="${article.date}">${formattedDate}</time></span>
                        <span aria-label="Tempo de leitura"><i class="far fa-clock" aria-hidden="true"></i> ${article.readTime || Utils.generateReadingTime()} min</span>
                    </div>
                    <div class="product-footer" style="margin-top:auto;"> 
                        <a href="${article.url}" class="view-details-btn article-link" aria-label="Ler artigo: ${article.title}" style="text-decoration: none; display: inline-flex; align-items: center; gap: var(--space-xs, 0.5rem); width: 100%; justify-content: center;">
                            <span>Ler artigo</span> <i class="fas fa-arrow-right" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>
            </article>`;
    }

    setupLazyLoading() { /* ... (código mantido como antes) ... */ if(!('IntersectionObserver' in window)){document.querySelectorAll('.lazy-image').forEach(img=>this.loadImage(img));return;} const obs=new IntersectionObserver((entries,observer)=>{entries.forEach(entry=>{if(entry.isIntersecting){this.loadImage(entry.target);observer.unobserve(entry.target);}});},{rootMargin:'50px 0px'}); document.querySelectorAll('.lazy-image:not(.loaded)').forEach(img=>obs.observe(img));}
    loadImage(img) { /* ... (código mantido como antes) ... */ const src=img.getAttribute('data-src')||img.src; if(src&&img.src!==src)img.src=src; img.onload=()=>{img.classList.add('loaded');}; img.onerror=()=>{img.src='https://via.placeholder.com/400x250/1A1A2E/A78BFA?text=Erro';img.classList.add('loaded','error');}; if(img.complete&&src)img.classList.add('loaded');}
    loadMoreArticles() { /* ... (código mantido como antes) ... */ this.currentPage++; Utils.trackEvent('load_more_articles',{page:this.currentPage}); this.renderArticles();}
    updateLoadMoreButton() { /* ... (código mantido como antes) ... */ const btn=document.getElementById('load-more-btn'); if(!btn)return; const hasMore=this.displayedArticles.length<this.filteredArticles.length; if(hasMore){btn.style.display='inline-flex'; const rem=this.filteredArticles.length-this.displayedArticles.length; btn.innerHTML=`Carregar mais (${rem}) <i class="fas fa-chevron-down" aria-hidden="true" style="margin-left:8px;"></i>`;}else btn.style.display='none';}
    updateResultsCount() { /* ... (código mantido como antes) ... */ const total=this.filteredArticles.length; const disp=this.displayedArticles.length; this.announceToScreenReader(`Mostrando ${disp} de ${total} artigos.`);}
    announceToScreenReader(message) { /* ... (código mantido como antes) ... */ let ann=document.querySelector('.sr-announcement'); if(!ann){ann=document.createElement('div'); ann.className='sr-only sr-announcement'; ann.setAttribute('aria-live','polite'); ann.setAttribute('aria-atomic','true'); document.body.appendChild(ann);} ann.textContent=message; setTimeout(()=>{if(ann)ann.textContent='';},3000); }
    
    handleNewsletterSubmit(e) { /* ... (código mantido como antes) ... */ e.preventDefault(); const form=e.target, emailInput=form.querySelector('#newsletter-email'), btn=form.querySelector('.newsletter-button'), errDiv=form.querySelector('#email-error'), email=emailInput.value.trim(); if(errDiv){errDiv.textContent=''; errDiv.classList.remove('show');} emailInput.classList.remove('error'); if(!this.validateEmail(email)){this.showFieldError(emailInput,errDiv,'Email inválido.'); return;} const origTxt=btn.querySelector('span')?btn.querySelector('span').textContent:btn.textContent; if(btn.querySelector('span'))btn.querySelector('span').textContent='Inscrevendo...';else btn.textContent='Inscrevendo...'; btn.disabled=true; this.subscribeNewsletter(email).then(()=>{if(btn.querySelector('span'))btn.querySelector('span').textContent='✓ Inscrito!';else btn.textContent='✓ Inscrito!'; btn.style.background='rgba(16,185,129,0.3)';form.reset();Utils.showToast('🎉 Inscrição feita!','success');Utils.trackEvent('newsletter_signup',{email}); setTimeout(()=>{if(btn.querySelector('span'))btn.querySelector('span').textContent=origTxt;else btn.textContent=origTxt; btn.style.background='';btn.disabled=false;},3000);}).catch(()=>{if(btn.querySelector('span'))btn.querySelector('span').textContent='Erro';else btn.textContent='Erro'; btn.style.background='rgba(239,68,68,0.3)';Utils.showToast('❌ Erro. Tente novamente.','error'); setTimeout(()=>{if(btn.querySelector('span'))btn.querySelector('span').textContent=origTxt;else btn.textContent=origTxt; btn.style.background='';btn.disabled=false;},3000);});}
    validateEmail(email) { /* ... (código mantido como antes) ... */ const re=/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; return re.test(String(email).toLowerCase());}
    showFieldError(input,errorDiv,message) { /* ... (código mantido como antes) ... */ input.classList.add('error'); if(errorDiv){errorDiv.textContent=message; errorDiv.classList.add('show');} input.focus(); input.addEventListener('input',()=>{input.classList.remove('error'); if(errorDiv)errorDiv.classList.remove('show');},{once:true});}
    async subscribeNewsletter(email) { /* ... (código mantido como antes) ... */ return new Promise((res,rej)=>{setTimeout(()=>{if(Math.random()>0.1)res({success:true});else rej(new Error('Simulated server error'));},1500);});}
    
    setupExitIntent() { /* ... (código mantido como antes) ... */ let shown=false; const modal=document.getElementById('exit-intent-modal'); if(!modal)return; const closeBtn=modal.querySelector('.modal-close'), exitForm=document.getElementById('exit-form'); const handleLeave=(e)=>{if(e.clientY<=0&&!shown&&(window.scrollY>1000||document.body.scrollHeight>window.innerHeight*2)){this.showExitModal();shown=true;}}; document.addEventListener('mouseleave',Utils.throttle(handleLeave,500)); if(closeBtn)closeBtn.addEventListener('click',()=>this.hideExitModal()); modal.addEventListener('click',e=>{if(e.target===modal)this.hideExitModal();}); document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('active'))this.hideExitModal();}); if(exitForm)exitForm.addEventListener('submit',async e=>{e.preventDefault(); const emailInput=exitForm.querySelector('input[type="email"]'),email=emailInput.value; try{await this.subscribeNewsletter(email);Utils.showToast('🎁 Guia enviado!','success');Utils.trackEvent('exit_intent_conversion',{email});this.hideExitModal();emailInput.value='';}catch(err){Utils.showToast('❌ Erro. Tente de novo.','error');}}); }
    showExitModal() { /* ... (código mantido como antes) ... */ const modal=document.getElementById('exit-intent-modal'); if(modal){modal.classList.add('active');modal.setAttribute('aria-hidden','false'); const firstInput=modal.querySelector('input[type="email"]'); if(firstInput)setTimeout(()=>firstInput.focus(),100); Utils.trackEvent('exit_intent_shown');}}
    hideExitModal() { /* ... (código mantido como antes) ... */ const modal=document.getElementById('exit-intent-modal'); if(modal){modal.classList.remove('active');modal.setAttribute('aria-hidden','true');}}
    
    setupArticleClickHandlers() { /* ... (código mantido como antes) ... */ const articlesContainer=document.getElementById('all-articles-grid'); if(articlesContainer)articlesContainer.addEventListener('click',e=>{const card=e.target.closest('.article-card'); if(card&&!e.target.closest('.article-link, button, a')){const link=card.querySelector('.article-link'); if(link&&link.href){Utils.trackEvent('article_card_click',{url:link.href,title:card.querySelector('.article-title')?.textContent||'N/A'}); window.location.href=link.href;}}});}
    setupKeyboardNavigation() { /* ... (código mantido como antes) ... */ document.addEventListener('keydown',e=>{if(e.key==='Enter'){const activeEl=document.activeElement; if(activeEl&&activeEl.classList.contains('article-card')){const link=activeEl.querySelector('.article-link'); if(link&&link.href)link.click();}}});}
    setLoading(isLoading) { /* ... (código mantido como antes) ... */ this.isLoading=isLoading; const skeletons=document.querySelectorAll('.skeleton'); if(isLoading)skeletons.forEach(s=>s.style.display='block'); else skeletons.forEach(s=>s.style.display='none');}
    showError() { /* ... (código mantido como antes) ... */ const ids=['featured-articles','all-articles-grid']; ids.forEach(id=>{const c=document.getElementById(id); if(c)c.innerHTML=`<div class="error-message" role="alert" style="text-align:center;padding:2rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;color:var(--text-primary,white);"><i class="fas fa-exclamation-triangle" style="font-size:2rem;margin-bottom:1rem;color:#EF4444;"></i><h3 style="font-size:1.5rem;margin-bottom:0.5rem;">Ops! Algo deu errado</h3><p style="margin-bottom:1rem;">Não foi possível carregar os artigos. Verifique sua conexão e se o sitemap.xml está correto.</p><button onclick="location.reload()" class="submit-btn" style="background:#EF4444;color:white;"><i class="fas fa-redo" style="margin-right:0.5rem;"></i>Tentar novamente</button></div>`;}); this.setLoading(false);}
}

class HeaderManager { /* ... (código mantido como antes) ... */ 
    constructor(){this.header=document.getElementById('header');this.mobileMenuBtn=document.querySelector('.mobile-menu-btn');this.navLinks=document.querySelector('.nav-links');this.lastScroll=0;this.init();}
    init(){if(!this.header)return;this.setupScrollEffect();this.setupMobileMenu();this.setupSmoothScroll();}
    setupScrollEffect(){const handleScroll=Utils.throttle(()=>{const currentScroll=window.pageYOffset;if(currentScroll>50)this.header.classList.add('scrolled');else this.header.classList.remove('scrolled');this.lastScroll=currentScroll;},16);window.addEventListener('scroll',handleScroll,{passive:true});}
    setupMobileMenu(){if(!this.mobileMenuBtn||!this.navLinks)return;this.mobileMenuBtn.addEventListener('click',()=>{const isExpanded=this.mobileMenuBtn.getAttribute('aria-expanded')==='true';this.mobileMenuBtn.setAttribute('aria-expanded',String(!isExpanded));this.navLinks.classList.toggle('show');const icon=this.mobileMenuBtn.querySelector('i');if(icon)icon.className=isExpanded?'fas fa-bars':'fas fa-times';document.body.style.overflow=this.navLinks.classList.contains('show')?'hidden':'';});this.navLinks.addEventListener('click',e=>{if(e.target.tagName==='A'&&this.navLinks.classList.contains('show')){this.mobileMenuBtn.setAttribute('aria-expanded','false');this.navLinks.classList.remove('show');const icon=this.mobileMenuBtn.querySelector('i');if(icon)icon.className='fas fa-bars';document.body.style.overflow='';}});}
    setupSmoothScroll(){document.querySelectorAll('a[href^="#"]').forEach(anchor=>{anchor.addEventListener('click',e=>{const targetId=anchor.getAttribute('href');if(targetId.length>1){const targetElement=document.querySelector(targetId);if(targetElement){e.preventDefault();const headerHeight=this.header?this.header.offsetHeight:0;const targetPosition=targetElement.offsetTop-headerHeight-20;window.scrollTo({top:targetPosition,behavior:'smooth'});}}});});}
}

class MouseEffects { /* ... (código mantido como antes) ... */ 
    constructor(){this.mouseX=0;this.mouseY=0;this.currentX=0;this.currentY=0;this.speed=0.05;this.init();}
    init(){if(!('ontouchstart'in window||navigator.maxTouchPoints>0)){this.setupMouseTracking();this.startAnimation();this.setupHoverEffects();}}
    setupMouseTracking(){const updateMousePos=Utils.throttle(e=>{this.mouseX=(e.clientX/window.innerWidth)*100;this.mouseY=(e.clientY/window.innerHeight)*100;},16);document.addEventListener('mousemove',updateMousePos,{passive:true});}
    startAnimation(){const animate=()=>{this.currentX+=(this.mouseX-this.currentX)*this.speed;this.currentY+=(this.mouseY-this.currentY)*this.speed;document.documentElement.style.setProperty('--mouse-x-percent',this.currentX+'%');document.documentElement.style.setProperty('--mouse-y-percent',this.currentY+'%');requestAnimationFrame(animate);};requestAnimationFrame(animate);}
    setupHoverEffects(){document.querySelectorAll('button, .article-card, .category-pill, .cta-button').forEach(el=>{});}
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.performanceMonitor = new PerformanceMonitor();
        window.readingProgress = new ReadingProgress();
        window.animationObserver = new AnimationObserver();
        window.headerManager = new HeaderManager(); // Inicializa o HeaderManager
        window.mouseEffects = new MouseEffects();
        // BlogManager é inicializado por último, pois pode depender de elementos do header/DOM
        window.blogManager = new BlogManager(); 
        
        console.log('✨ Blog IAutomatize inicializado com sucesso!');
        Utils.trackEvent('page_view', { page_title: document.title, page_location: window.location.href });
    } catch (error) {
        console.error('❌ Erro Crítico ao inicializar o blog:', error);
        const body = document.querySelector('body');
        if (body) body.innerHTML = `<div style="text-align:center;padding:50px;font-family:sans-serif;color:#333;"><h1>Ops! Algo deu muito errado.</h1><p>Não foi possível carregar o blog. Tente recarregar.</p><p>Verifique o console para detalhes do erro, especialmente sobre o sitemap.xml.</p><button onclick="location.reload()" style="padding:10px 20px;font-size:1rem;cursor:pointer;">Recarregar</button></div>`;
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js'); // Ajuste o caminho se sw.js não estiver na raiz
            console.log('✅ ServiceWorker registrado:', registration.scope);
            Utils.trackEvent('service_worker_registered');
        } catch (error) {
            console.log('❌ Falha no registro do ServiceWorker:', error);
            Utils.trackEvent('service_worker_failed', { error_message: error.message });
        }
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Utils, BlogManager };
}

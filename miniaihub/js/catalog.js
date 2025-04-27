/**
 * catalog.js - Gerenciador do catálogo de Mini-IAs
 * Carrega, filtra e exibe Mini-IAs no catálogo
 */

(function() {
    // Configurações
    const CONFIG = {
        apiUrl: '/miniaihub/api/miniais',
        itemsPerPage: 8,
        maxRetries: 2,
        retryDelay: 1000, // ms
    };
    
    // Estado da aplicação
    const STATE = {
        miniais: [],
        filteredMiniais: [],
        currentPage: 1,
        loading: true,
        error: false,
        filters: {
            search: '',
            category: '',
            price: '',
            sort: 'popular',
            newOnly: false,
            tags: [] // Tags ativas como filtros
        }
    };
    
    /**
     * Inicializa o catálogo quando o DOM estiver pronto
     */
    document.addEventListener('DOMContentLoaded', () => {
        initCatalog();
    });
    
    /**
     * Inicializa componentes e carrega dados
     */
    async function initCatalog() {
        // Inicializar filtragem
        setupFilters();
        
        // Carregar dados das Mini-IAs
        await loadMiniIAs();
        
        // Inicializar eventos de reload/retry
        setupRetry();
    }
    
    /**
     * Configura listeners para os filtros
     */
    function setupFilters() {
        // Busca
        const searchInput = document.getElementById('miniai-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                STATE.filters.search = searchInput.value.trim().toLowerCase();
                STATE.currentPage = 1; // Reset paginação
                applyFilters();
            }, 300)); // Debounce para evitar muitas atualizações
        }
        
        // Categoria
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                STATE.filters.category = categoryFilter.value;
                STATE.currentPage = 1;
                
                // Adicionar tag de filtro se selecionado
                if (categoryFilter.value) {
                    addFilterTag('category', categoryFilter.options[categoryFilter.selectedIndex].text);
                } else {
                    removeFilterTag('category');
                }
                
                applyFilters();
            });
        }
        
        // Preço
        const priceFilter = document.getElementById('price-filter');
        if (priceFilter) {
            priceFilter.addEventListener('change', () => {
                STATE.filters.price = priceFilter.value;
                STATE.currentPage = 1;
                
                if (priceFilter.value) {
                    addFilterTag('price', priceFilter.options[priceFilter.selectedIndex].text);
                } else {
                    removeFilterTag('price');
                }
                
                applyFilters();
            });
        }
        
        // Ordenação
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
            sortFilter.addEventListener('change', () => {
                STATE.filters.sort = sortFilter.value;
                applyFilters();
            });
        }
        
        // Apenas novos
        const newFilter = document.getElementById('new-filter');
        if (newFilter) {
            newFilter.addEventListener('change', () => {
                STATE.filters.newOnly = newFilter.checked;
                STATE.currentPage = 1;
                
                if (newFilter.checked) {
                    addFilterTag('new', 'Apenas novos');
                } else {
                    removeFilterTag('new');
                }
                
                applyFilters();
            });
        }
        
        // Botão limpar filtros
        const clearFiltersButton = document.getElementById('clear-filters-button');
        if (clearFiltersButton) {
            clearFiltersButton.addEventListener('click', clearAllFilters);
        }
    }
    
    /**
     * Adiciona uma tag de filtro ativo
     */
    function addFilterTag(type, text) {
        const tagsContainer = document.getElementById('active-filters');
        if (!tagsContainer) return;
        
        // Remover tag existente do mesmo tipo
        removeFilterTag(type);
        
        // Criar nova tag
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.dataset.filterType = type;
        tag.innerHTML = `
            ${text}
            <button class="filter-tag-close" aria-label="Remover filtro">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;
        
        // Adicionar evento de remover
        const closeButton = tag.querySelector('.filter-tag-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                removeFilterTag(type);
                
                // Resetar o filtro correspondente na UI
                switch (type) {
                    case 'category':
                        document.getElementById('category-filter').value = '';
                        STATE.filters.category = '';
                        break;
                    case 'price':
                        document.getElementById('price-filter').value = '';
                        STATE.filters.price = '';
                        break;
                    case 'new':
                        document.getElementById('new-filter').checked = false;
                        STATE.filters.newOnly = false;
                        break;
                    // Caso seja uma tag, remover do array
                    case 'tag':
                        const tagValue = text.toLowerCase();
                        STATE.filters.tags = STATE.filters.tags.filter(tag => tag !== tagValue);
                        break;
                }
                
                STATE.currentPage = 1;
                applyFilters();
            });
        }
        
        // Adicionar ao container
        tagsContainer.appendChild(tag);
        
        // Se for tag, adicionar ao array de tags
        if (type === 'tag' && !STATE.filters.tags.includes(text.toLowerCase())) {
            STATE.filters.tags.push(text.toLowerCase());
        }
    }
    
    /**
     * Remove uma tag de filtro
     */
    function removeFilterTag(type) {
        const tagsContainer = document.getElementById('active-filters');
        if (!tagsContainer) return;
        
        const tag = tagsContainer.querySelector(`[data-filter-type="${type}"]`);
        if (tag) {
            tagsContainer.removeChild(tag);
        }
    }
    
    /**
     * Limpa todos os filtros
     */
    function clearAllFilters() {
        // Resetar UI
        document.getElementById('miniai-search').value = '';
        document.getElementById('category-filter').value = '';
        document.getElementById('price-filter').value = '';
        document.getElementById('new-filter').checked = false;
        
        // Limpar container de tags
        const tagsContainer = document.getElementById('active-filters');
        if (tagsContainer) {
            tagsContainer.innerHTML = '';
        }
        
        // Resetar estado
        STATE.filters = {
            search: '',
            category: '',
            price: '',
            sort: 'popular', // Manter ordenação
            newOnly: false,
            tags: []
        };
        
        STATE.currentPage = 1;
        applyFilters();
    }
    
    /**
     * Carrega dados das Mini-IAs
     */
    async function loadMiniIAs() {
        // Exibir loader
        STATE.loading = true;
        STATE.error = false;
        renderState();
        
        try {
            let attempts = 0;
            let success = false;
            
            while (attempts < CONFIG.maxRetries && !success) {
                try {
                    // Usar endpoint real ou mockado para desenvolvimento
                    const response = await fetch(CONFIG.apiUrl);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP Error: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    STATE.miniais = data;
                    success = true;
                    
                    // Log para analytics
                    trackEvent('Catalog Loaded', { 
                        items: data.length, 
                        userEmail: localStorage.getItem('miniai_user_email')
                    });
                } catch (error) {
                    attempts++;
                    console.warn(`Tentativa ${attempts} falhou: ${error.message}`);
                    
                    if (attempts < CONFIG.maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay * Math.pow(2, attempts - 1)));
                    } else {
                        throw error;
                    }
                }
            }
            
            // Preencher categorias no filtro
            populateCategoryFilter();
            
            // Aplicar filtros iniciais
            applyFilters();
        } catch (error) {
            console.error('Erro ao carregar Mini-IAs:', error);
            STATE.error = true;
            
            // Log de erro
            trackEvent('Catalog Error', { error: error.message });
            
            // Se estiver em ambiente de desenvolvimento, usar dados de exemplo
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.info('Usando dados de exemplo para desenvolvimento');
                STATE.miniais = getMockMiniIAs();
                populateCategoryFilter();
                applyFilters();
            }
        } finally {
            STATE.loading = false;
            renderState();
        }
    }
    
    /**
     * Preenche as opções do filtro de categoria
     */
    function populateCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter || !STATE.miniais.length) return;
        
        // Obter categorias únicas
        const categories = [...new Set(STATE.miniais.flatMap(item => item.categories || []))];
        
        // Ordenar alfabeticamente
        categories.sort();
        
        // Limpar opções existentes, exceto a primeira (Todas)
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }
        
        // Adicionar opções
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.toLowerCase();
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }
    
    /**
     * Aplica filtros e ordenação às Mini-IAs
     */
    function applyFilters() {
        if (!STATE.miniais.length) return;
        
        // Começar com todas as Mini-IAs
        let filtered = [...STATE.miniais];
        
        // Aplicar filtro de busca
        if (STATE.filters.search) {
            filtered = filtered.filter(item => {
                const searchTerm = STATE.filters.search.toLowerCase();
                return (
                    (item.name && item.name.toLowerCase().includes(searchTerm)) ||
                    (item.description && item.description.toLowerCase().includes(searchTerm)) ||
                    (item.categories && item.categories.some(cat => cat.toLowerCase().includes(searchTerm))) ||
                    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
                );
            });
        }
        
        // Aplicar filtro de categoria
        if (STATE.filters.category) {
            filtered = filtered.filter(item => 
                item.categories && item.categories.some(cat => 
                    cat.toLowerCase() === STATE.filters.category.toLowerCase()
                )
            );
        }
        
        // Aplicar filtro de preço
        if (STATE.filters.price) {
            filtered = filtered.filter(item => {
                if (STATE.filters.price === 'free') {
                    return item.price === 0 || item.price === '0' || item.isFree === true;
                } else if (STATE.filters.price === 'paid') {
                    return item.price > 0 || (typeof item.price === 'string' && item.price !== '0') || item.isFree === false;
                }
                return true;
            });
        }
        
        // Aplicar filtro de novos
        if (STATE.filters.newOnly) {
            filtered = filtered.filter(item => item.isNew === true);
        }
        
        // Aplicar filtro de tags
        if (STATE.filters.tags.length > 0) {
            filtered = filtered.filter(item => 
                item.tags && STATE.filters.tags.every(tag => 
                    item.tags.some(itemTag => itemTag.toLowerCase() === tag)
                )
            );
        }
        
        // Aplicar ordenação
        switch (STATE.filters.sort) {
            case 'popular':
                filtered.sort((a, b) => (b.stars || 0) - (a.stars || 0));
                break;
            case 'recent':
                filtered.sort((a, b) => {
                    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                    return dateB - dateA;
                });
                break;
            case 'price-asc':
                filtered.sort((a, b) => {
                    const priceA = typeof a.price === 'string' ? parseFloat(a.price) : (a.price || 0);
                    const priceB = typeof b.price === 'string' ? parseFloat(b.price) : (b.price || 0);
                    return priceA - priceB;
                });
                break;
            case 'price-desc':
                filtered.sort((a, b) => {
                    const priceA = typeof a.price === 'string' ? parseFloat(a.price) : (a.price || 0);
                    const priceB = typeof b.price === 'string' ? parseFloat(b.price) : (b.price || 0);
                    return priceB - priceA;
                });
                break;
        }
        
        // Atualizar estado
        STATE.filteredMiniais = filtered;
        
        // Log para analytics
        trackEvent('Filters Applied', { 
            resultsCount: filtered.length,
            filters: { ...STATE.filters }
        });
        
        // Renderizar resultados
        renderMiniIAs();
        renderPagination();
    }
    
    /**
     * Renderiza o grid de Mini-IAs com paginação
     */
    function renderMiniIAs() {
        const grid = document.getElementById('miniai-grid');
        if (!grid) return;
        
        // Limpar grid
        grid.innerHTML = '';
        
        // Verificar se há resultados
        if (STATE.filteredMiniais.length === 0) {
            document.getElementById('empty-container').style.display = 'block';
            document.getElementById('pagination').style.display = 'none';
            return;
        } else {
            document.getElementById('empty-container').style.display = 'none';
            document.getElementById('pagination').style.display = 'flex';
        }
        
        // Calcular itens da página atual
        const startIndex = (STATE.currentPage - 1) * CONFIG.itemsPerPage;
        const endIndex = startIndex + CONFIG.itemsPerPage;
        const pageItems = STATE.filteredMiniais.slice(startIndex, endIndex);
        
        // Renderizar cada Mini-IA
        pageItems.forEach(item => {
            const card = createMiniIACard(item);
            grid.appendChild(card);
        });
    }
    
    /**
     * Cria um card de Mini-IA
     */
    function createMiniIACard(item) {
        const card = document.createElement('div');
        card.className = 'miniai-card';
        card.setAttribute('data-id', item.id);
        
        // Formatação de preço
        let priceDisplay = '';
        if (item.isFree || item.price === 0 || item.price === '0') {
            priceDisplay = '<div class="miniai-price free">Grátis</div>';
        } else if (item.price) {
            // Formatar como moeda se for número
            const price = typeof item.price === 'number' 
                ? `R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : item.price;
            priceDisplay = `<div class="miniai-price">${price}</div>`;
        }
        
        // Renderizar estrelas
        const starsCount = Math.round(item.stars || 0);
        const starsHtml = Array(5).fill().map((_, i) => 
            `<svg width="16" height="16" viewBox="0 0 24 24" fill="${i < starsCount ? '#FFC107' : 'none'}" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#FFC107" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        ).join('');
        
        // Renderizar tags
        const tagsHtml = item.tags && item.tags.length > 0
            ? item.tags.map(tag => {
                // Determinar classe CSS baseado na tag
                let tagClass = 'miniai-tag';
                if (tag.toLowerCase().includes('crm')) tagClass += ' crm';
                else if (tag.toLowerCase().includes('email')) tagClass += ' email';
                else if (tag.toLowerCase().includes('pagamento')) tagClass += ' payments';
                
                return `<span class="${tagClass}">${tag}</span>`;
              }).join('')
            : '';
        
        // Montar HTML do card
        card.innerHTML = `
            <div class="miniai-image">
                <img src="${item.image || '/api/placeholder/400/220'}" alt="${item.name}">
                ${item.isNew ? '<div class="miniai-new-badge">Novo</div>' : ''}
            </div>
            <div class="miniai-content">
                <div class="miniai-tags">
                    ${tagsHtml}
                </div>
                <div class="miniai-stars">
                    ${starsHtml}
                    <span>(${item.reviews || 0})</span>
                </div>
                <h3>${item.name}</h3>
                <p>${item.description || ''}</p>
                <div class="miniai-footer">
                    ${priceDisplay}
                    <a href="/miniaihub/conector/${item.id}.html" class="btn btn-primary miniai-btn">Instalar</a>
                </div>
            </div>
        `;
        
        // Adicionar evento de click para ir para a página de detalhe
        card.addEventListener('click', (e) => {
            // Evitar navegação se o click foi no botão
            if (e.target.closest('.miniai-btn')) return;
            
            // Navegar para página de detalhe
            window.location.href = `/miniaihub/conector/${item.id}.html`;
        });
        
        return card;
    }
    
    /**
     * Renderiza a paginação
     */
    function renderPagination() {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;
        
        // Limpar container
        paginationContainer.innerHTML = '';
        
        // Calcular total de páginas
        const totalPages = Math.ceil(STATE.filteredMiniais.length / CONFIG.itemsPerPage);
        
        // Não mostrar paginação se só tem uma página
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        } else {
            paginationContainer.style.display = 'flex';
        }
        
        // Botão anterior
        const prevButton = document.createElement('button');
        prevButton.className = 'pagination-arrow';
        prevButton.disabled = STATE.currentPage === 1;
        prevButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        prevButton.addEventListener('click', () => {
            if (STATE.currentPage > 1) {
                STATE.currentPage--;
                renderMiniIAs();
                renderPagination();
                
                // Scroll para o topo do grid
                document.getElementById('miniai-grid').scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // Adicionar itens de paginação
        const maxVisiblePages = window.innerWidth < 768 ? 3 : 5;
        let startPage = Math.max(1, STATE.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Ajustar se estiver no final
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // Adicionar botão "anterior"
        paginationContainer.appendChild(prevButton);
        
        // Adicionar primeira página se necessário
        if (startPage > 1) {
            addPaginationItem(1);
            
            // Adicionar elipses se necessário
            if (startPage > 2) {
                const ellipsis = document.createElement('div');
                ellipsis.className = 'pagination-item ellipsis';
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            }
        }
        
        // Adicionar páginas visíveis
        for (let i = startPage; i <= endPage; i++) {
            addPaginationItem(i);
        }
        
        // Adicionar última página se necessário
        if (endPage < totalPages) {
            // Adicionar elipses se necessário
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('div');
                ellipsis.className = 'pagination-item ellipsis';
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            }
            
            addPaginationItem(totalPages);
        }
        
        // Botão próximo
        const nextButton = document.createElement('button');
        nextButton.className = 'pagination-arrow';
        nextButton.disabled = STATE.currentPage === totalPages;
        nextButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 5L19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        nextButton.addEventListener('click', () => {
            if (STATE.currentPage < totalPages) {
                STATE.currentPage++;
                renderMiniIAs();
                renderPagination();
                
                // Scroll para o topo do grid
                document.getElementById('miniai-grid').scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        paginationContainer.appendChild(nextButton);
        
        // Função auxiliar para adicionar item de paginação
        function addPaginationItem(pageNumber) {
            const item = document.createElement('div');
            item.className = `pagination-item${pageNumber === STATE.currentPage ? ' active' : ''}`;
            item.textContent = pageNumber;
            
            item.addEventListener('click', () => {
                if (pageNumber !== STATE.currentPage) {
                    STATE.currentPage = pageNumber;
                    renderMiniIAs();
                    renderPagination();
                    
                    // Scroll para o topo do grid
                    document.getElementById('miniai-grid').scrollIntoView({ behavior: 'smooth' });
                }
            });
            
            paginationContainer.appendChild(item);
        }
    }
    
    /**
     * Renderiza o estado atual da UI
     */
    function renderState() {
        const grid = document.getElementById('miniai-grid');
        const errorContainer = document.getElementById('error-container');
        const emptyContainer = document.getElementById('empty-container');
        const pagination = document.getElementById('pagination');
        
        if (!grid) return;
        
        // Estado de carregamento
        if (STATE.loading) {
            grid.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Carregando Mini-IAs...</p>
                </div>
            `;
            errorContainer.style.display = 'none';
            emptyContainer.style.display = 'none';
            pagination.style.display = 'none';
            return;
        }
        
        // Estado de erro
        if (STATE.error) {
            grid.innerHTML = '';
            errorContainer.style.display = 'block';
            emptyContainer.style.display = 'none';
            pagination.style.display = 'none';
            return;
        }
        
        // Estado vazio será tratado em renderMiniIAs()
    }
    
    /**
     * Configura eventos de retry
     */
    function setupRetry() {
        const retryButton = document.getElementById('retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', loadMiniIAs);
        }
    }
    
    /**
     * Função para registro de eventos de analytics
     */
    function trackEvent(eventName, eventData = {}) {
        if (typeof window.analytics !== 'undefined' && window.analytics.track) {
            window.analytics.track(eventName, eventData);
        } else {
            console.log(`[Analytics] ${eventName}:`, eventData);
        }
    }
    
    /**
     * Função utilitária para debounce
     */
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    /**
     * Dados mock para desenvolvimento
     */
    function getMockMiniIAs() {
        return [
            {
                id: 'lead-catcher',
                name: 'Lead Catcher',
                description: 'Captura leads de formulários web e os envia automaticamente para seu CRM, notificando a equipe de vendas',
                image: '/api/placeholder/400/220',
                categories: ['Automação', 'Marketing'],
                tags: ['CRM', 'E-mail'],
                stars: 5,
                reviews: 128,
                price: 0,
                isFree: true,
                isNew: true,
                createdAt: '2025-03-15'
            },
            {
                id: 'email-sorter',
                name: 'E-mail Sorter',
                description: 'Organiza seus e-mails automaticamente em categorias usando IA para entender o conteúdo',
                image: '/api/placeholder/400/220',
                categories: ['Produtividade', 'E-mail'],
                tags: ['E-mail', 'Organização'],
                stars: 4,
                reviews: 94,
                price: 'R$ 9/mês',
                isFree: false,
                createdAt: '2025-02-20'
            },
            {
                id: 'invoice-manager',
                name: 'Invoice Manager',
                description: 'Gera, envia e monitora faturas automaticamente com lembretes de pagamentos para clientes',
                image: '/api/placeholder/400/220',
                categories: ['Financeiro'],
                tags: ['Pagamentos', 'Faturas'],
                stars: 5,
                reviews: 76,
                price: 'R$ 19/mês',
                isFree: false,
                createdAt: '2025-01-10'
            },
            {
                id: 'social-scheduler',
                name: 'Social Scheduler',
                description: 'Agenda e publica automaticamente conteúdo nas redes sociais nos melhores horários para engajamento',
                image: '/api/placeholder/400/220',
                categories: ['Marketing', 'Redes Sociais'],
                tags: ['Social', 'Agendamento'],
                stars: 4,
                reviews: 52,
                price: 'R$ 15/mês',
                isFree: false,
                createdAt: '2024-12-05'
            },
            {
                id: 'analytics-reporter',
                name: 'Analytics Reporter',
                description: 'Gera relatórios automáticos de insights personalizados com base em seus dados de analytics',
                image: '/api/placeholder/400/220',
                categories: ['Analytics', 'Relatórios'],
                tags: ['Analytics', 'Relatórios'],
                stars: 4,
                reviews: 48,
                price: 'R$ 29/mês',
                isFree: false,
                createdAt: '2024-11-20'
            },
            {
                id: 'meeting-notes',
                name: 'Meeting Notes',
                description: 'Transcreve e resume automaticamente reuniões, enviando notas para todos os participantes',
                image: '/api/placeholder/400/220',
                categories: ['Produtividade', 'Comunicação'],
                tags: ['E-mail', 'CRM'],
                stars: 4,
                reviews: 37,
                price: 'R$ 12/mês',
                isFree: false,
                isNew: true,
                createdAt: '2025-04-01'
            },
            {
                id: 'customer-feedback',
                name: 'Customer Feedback',
                description: 'Coleta, analisa e categoriza feedback de clientes de múltiplos canais em um único dashboard',
                image: '/api/placeholder/400/220',
                categories: ['CRM', 'Analytics'],
                tags: ['CRM', 'Analytics'],
                stars: 4,
                reviews: 29,
                price: 'R$ 22/mês',
                isFree: false,
                createdAt: '2024-10-15'
            },
            {
                id: 'task-automator',
                name: 'Task Automator',
                description: 'Cria e atribui tarefas automaticamente com base em gatilhos de ações dos clientes',
                image: '/api/placeholder/400/220',
                categories: ['Produtividade', 'CRM'],
                tags: ['CRM', 'Tarefas'],
                stars: 5,
                reviews: 43,
                price: 0,
                isFree: true,
                createdAt: '2024-09-10'
            },
            {
                id: 'content-generator',
                name: 'Content Generator',
                description: 'Gera conteúdo de marketing personalizado baseado em seus produtos e público-alvo',
                image: '/api/placeholder/400/220',
                categories: ['Marketing', 'Conteúdo'],
                tags: ['Marketing', 'IA'],
                stars: 3,
                reviews: 18,
                price: 'R$ 39/mês',
                isFree: false,
                isNew: true,
                createdAt: '2025-03-25'
            },
            {
                id: 'data-cleaner',
                name: 'Data Cleaner',
                description: 'Limpa e organiza automaticamente dados de clientes em seu CRM',
                image: '/api/placeholder/400/220',
                categories: ['CRM', 'Dados'],
                tags: ['CRM', 'Dados'],
                stars: 4,
                reviews: 26,
                price: 'R$ 14/mês',
                isFree: false,
                createdAt: '2024-08-15'
            }
        ];
    }
})();

/**
 * PRODUTOS IAUTOMATIZE - JavaScript Mobile-First
 * Sistema 100% baseado em produtos.json
 * Otimizado para SEO e performance
 */

// Global state
let appState = {
    products: [],
    filteredProducts: [],
    selectedCategory: 'Todas',
    searchTerm: '',
    categories: [],
    loading: true,
    error: null
};

// DOM elements cache
let elements = {};

// WhatsApp number
const WHATSAPP_NUMBER = '5515991716525'; // Considere mover para produtos.json em configuracoes

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Sistema de Produtos IAutomatize...');
    console.log('📱 Otimizado para Mobile-First');
    console.log('📋 Sistema 100% baseado no arquivo produtos.json');
    console.log('🔍 Procurando produtos.json na mesma pasta...');
    
    initializeElements();
    initializeThreeBackground();
    setupEventListeners();
    loadProducts();
    animateNumbers();
});

/**
 * Initialize DOM elements cache
 */
function initializeElements() {
    elements.app = document.getElementById('products-app');
    elements.initialLoading = document.getElementById('initial-loading');
    elements.modal = document.getElementById('product-modal');
    elements.header = document.getElementById('header');
    
    // Create initial structure
    elements.app.innerHTML = `
        <section class="filters-section">
            <div class="filters-container">
                <div class="search-container">
                    <i class="fas fa-search search-icon" aria-hidden="true"></i>
                    <input
                        type="text"
                        id="search-input"
                        class="search-input"
                        placeholder="Buscar produtos..."
                        aria-label="Buscar produtos"
                    />
                </div>
                
                <div class="category-filters" id="category-filters" role="tablist" aria-label="Filtros por categoria">
                    <!-- Categories will be loaded here -->
                </div>
            </div>
        </section>
        
        <section class="products-section">
            <div id="error-message" style="display: none;" role="alert"></div>
            
            <div class="loading" id="loading-container" aria-live="polite">
                <div class="spinner" aria-hidden="true"></div>
                <p>Carregando produtos incríveis...</p>
            </div>
            
            <div class="products-grid" id="products-grid" style="display: none;" role="main" aria-label="Lista de produtos">
                <!-- Products will be loaded here -->
            </div>
            
            <div id="no-results" style="display: none;" role="status" aria-live="polite">
                <div style="text-align: center; padding: 4rem 2rem; color: var(--text-secondary);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;" aria-hidden="true"></i>
                    <h3>Nenhum produto encontrado</h3>
                    <p>Tente ajustar os filtros ou termo de busca</p>
                </div>
            </div>
        </section>
    `;

    // Get references to created elements
    elements.searchInput = document.getElementById('search-input');
    elements.categoryFilters = document.getElementById('category-filters');
    elements.productsGrid = document.getElementById('products-grid');
    elements.loadingContainer = document.getElementById('loading-container');
    elements.errorMessage = document.getElementById('error-message');
    elements.noResults = document.getElementById('no-results');
}

/**
 * Initialize Three.js animated background
 */
function initializeThreeBackground() {
    try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        const container = document.getElementById('three-background');
        if (container) {
            container.appendChild(renderer.domElement);
        }

        // Create floating particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = window.innerWidth < 768 ? 500 : 1000; // Less particles on mobile
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 20;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            color: 0x8B5CF6,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Add geometric shapes (fewer on mobile)
        const shapesCount = window.innerWidth < 768 ? 8 : 15;
        const geometries = [
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.SphereGeometry(0.3, 16, 16), // Less segments on mobile
            new THREE.ConeGeometry(0.3, 0.8, 8)
        ];

        const materials = [
            new THREE.MeshBasicMaterial({ 
                color: 0x8B5CF6, 
                transparent: true, 
                opacity: 0.3,
                wireframe: true 
            }),
            new THREE.MeshBasicMaterial({ 
                color: 0x6D28D9, 
                transparent: true, 
                opacity: 0.2,
                wireframe: true 
            }),
            new THREE.MeshBasicMaterial({ 
                color: 0xA78BFA, 
                transparent: true, 
                opacity: 0.25,
                wireframe: true 
            })
        ];

        const meshes = [];
        for (let i = 0; i < shapesCount; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = materials[Math.floor(Math.random() * materials.length)];
            const mesh = new THREE.Mesh(geometry, material);
            
            mesh.position.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
            
            mesh.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            
            scene.add(mesh);
            meshes.push(mesh);
        }

        camera.position.z = 5;

        // Mouse interaction (desktop only)
        let mouseX = 0;
        let mouseY = 0;
        
        if (window.innerWidth >= 1024) {
            document.addEventListener('mousemove', (event) => {
                mouseX = (event.clientX / window.innerWidth) * 2 - 1;
                mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
            }, { passive: true });
        }

        // Animation loop with performance optimization
        let lastTime = 0;
        function animate(currentTime) {
            if (currentTime - lastTime >= 16) { // 60fps cap
                requestAnimationFrame(animate);

                // Rotate particles
                particlesMesh.rotation.y += 0.001;
                particlesMesh.rotation.x += 0.0005;

                // Animate geometric shapes
                meshes.forEach((mesh, index) => {
                    mesh.rotation.x += 0.01 + index * 0.001;
                    mesh.rotation.y += 0.01 + index * 0.001;
                    mesh.position.y += Math.sin(Date.now() * 0.001 + index) * 0.001;
                });

                // Camera movement based on mouse (desktop only)
                if (window.innerWidth >= 1024) {
                    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
                    camera.position.y += (mouseY * 2 - camera.position.y) * 0.05;
                    camera.lookAt(scene.position);
                }

                renderer.render(scene, camera);
                lastTime = currentTime;
            } else {
                requestAnimationFrame(animate);
            }
        }

        animate();

        // Handle resize
        function handleResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener('resize', handleResize, { passive: true });
        
        console.log('✨ Background 3D inicializado com sucesso!');
    } catch (error) {
        console.warn('⚠️ Erro ao inicializar background 3D:', error);
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Header scroll effect
    let lastScroll = 0;
    const throttledScroll = throttle(() => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            elements.header.classList.add('scrolled');
        } else {
            elements.header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, 16);

    window.addEventListener('scroll', throttledScroll, { passive: true });

    // Search input
    if (elements.searchInput) {
        const debouncedSearch = debounce((value) => {
            appState.searchTerm = value;
            filterProducts();
            trackEvent('product_search', { query: value });
        }, 300);

        elements.searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }

    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('show');
            
            // Update icon
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.className = isExpanded ? 'fas fa-bars' : 'fas fa-times';
            }
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isExpanded ? 'unset' : 'hidden';
        });

        // Close mobile menu on link click
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('show');
                document.body.style.overflow = 'unset';
                
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-bars';
                }
            }
        });
    }

    // Modal events
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal || e.target.classList.contains('modal-close')) {
            closeModal();
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Form submission
    setupFormHandlers();

    console.log('🎯 Event listeners configurados!');
}

/**
 * Load products from JSON
 */
async function loadProducts() {
    try {
        console.log('🔄 Carregando produtos.json...');
        
        const response = await fetch('produtos.json');
        console.log('📡 Status da resposta:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - Verifique se o arquivo produtos.json está na mesma pasta que produtos.html`);
        }
        
        const data = await response.json();
        console.log('✅ JSON carregado:', data);
        
        if (!data.produtos || !Array.isArray(data.produtos)) {
            throw new Error('Formato inválido: propriedade "produtos" não encontrada ou não é um array');
        }

        if (data.produtos.length === 0) {
            throw new Error('Nenhum produto encontrado no arquivo JSON');
        }
        
        appState.products = data.produtos;
        appState.filteredProducts = data.produtos;
        appState.categories = data.categorias || ['Todas'];
        appState.loading = false;
        
        console.log(`✨ ${data.produtos.length} produtos carregados com sucesso!`);
        
        // Generate structured data for SEO
        generateProductsSchema(data.produtos);
        
        renderApp();
        
    } catch (error) {
        console.error('❌ Erro ao carregar produtos:', error);
        appState.error = error.message;
        appState.loading = false;
        showError();
    }
}

/**
 * Generate structured data for SEO
 */
function generateProductsSchema(products) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": products.map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Product",
                "name": product.nome,
                "description": product.descricao,
                "image": product.imagem,
                "offers": {
                    "@type": "Offer",
                    "price": product.precoNumerico,
                    "priceCurrency": "BRL",
                    "availability": "https://schema.org/InStock",
                    "seller": {
                        "@type": "Organization",
                        "name": "IAutomatize"
                    }
                },
                "brand": {
                    "@type": "Brand",
                    "name": "IAutomatize"
                },
                "category": product.categoria
            }
        }))
    };

    const schemaScript = document.getElementById('products-schema');
    if (schemaScript) {
        schemaScript.textContent = JSON.stringify(schema);
    }
}

/**
 * Render the complete app
 */
function renderApp() {
    renderCategories();
    renderProducts();
    hideLoading();
}

/**
 * Render category filters
 */
function renderCategories() {
    const categoriesHtml = appState.categories.map(category => `
        <button
            class="category-btn ${appState.selectedCategory === category ? 'active' : ''}"
            data-category="${category}"
            role="tab"
            aria-selected="${appState.selectedCategory === category}"
            tabindex="${appState.selectedCategory === category ? '0' : '-1'}"
        >
            ${category}
        </button>
    `).join('');

    elements.categoryFilters.innerHTML = categoriesHtml;

    // Add event listeners to category buttons
    elements.categoryFilters.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.getAttribute('data-category');
            selectCategory(category);
        });

        // Keyboard navigation
        btn.addEventListener('keydown', (e) => {
            const buttons = Array.from(elements.categoryFilters.querySelectorAll('.category-btn'));
            const currentIndex = buttons.indexOf(e.target);
            
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % buttons.length;
                buttons[nextIndex].focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                buttons[prevIndex].focus();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.target.click();
            }
        });
    });
}

/**
 * Select category and update state
 */
function selectCategory(category) {
    appState.selectedCategory = category;
    
    // Update active state and accessibility
    elements.categoryFilters.querySelectorAll('.category-btn').forEach(btn => {
        const isActive = btn.getAttribute('data-category') === category;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
        btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
    
    filterProducts();
    trackEvent('category_filter', { category });
}

/**
 * Filter products based on category and search
 */
function filterProducts() {
    let filtered = appState.products;

    // Filter by category
    if (appState.selectedCategory !== 'Todas') {
        filtered = filtered.filter(product => product.categoria === appState.selectedCategory);
    }

    // Filter by search term
    if (appState.searchTerm) {
        const searchLower = appState.searchTerm.toLowerCase();
        filtered = filtered.filter(product =>
            product.nome.toLowerCase().includes(searchLower) ||
            product.descricao.toLowerCase().includes(searchLower) ||
            product.categoria.toLowerCase().includes(searchLower) ||
            (product.caracteristicas && product.caracteristicas.some(feature => 
                feature.toLowerCase().includes(searchLower)
            ))
        );
    }

    appState.filteredProducts = filtered;
    renderProducts();
}

/**
 * Render products grid
 */
function renderProducts() {
    if (appState.filteredProducts.length === 0) {
        elements.productsGrid.style.display = 'none';
        elements.noResults.style.display = 'block';
        return;
    }

    elements.noResults.style.display = 'none';
    elements.productsGrid.style.display = 'grid';

    const productsHtml = appState.filteredProducts.map((product, index) => `
        <article 
            class="product-card fade-in" 
            style="animation-delay: ${index * 0.1}s;" 
            data-product-id="${product.id}"
            itemscope 
            itemtype="https://schema.org/Product"
        >
            <div class="product-image">
                <img 
                    src="${product.imagem}" 
                    alt="${product.nome}" 
                    itemprop="image"
                    loading="lazy"
                    width="400"
                    height="250"
                />
                <div class="product-badges">
                    ${product.popular ? '<span class="badge popular">Popular</span>' : ''}
                    ${product.novo ? '<span class="badge new">Novo</span>' : ''}
                </div>
            </div>
            
            <div class="product-content">
                <div class="product-category" itemprop="category">${product.categoria}</div>
                <h3 class="product-title" itemprop="name">${product.nome}</h3>
                <p class="product-description" itemprop="description">${product.descricao}</p>
                
                <div class="product-features">
                    ${(product.caracteristicas || []).slice(0, 3).map(feature => `
                        <div class="feature-item">
                            <i class="fas fa-check" aria-hidden="true"></i>
                            <span>${feature}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="product-footer">
                    <div class="product-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                        <span itemprop="price">${product.preco}</span>
                        <meta itemprop="priceCurrency" content="BRL">
                        <meta itemprop="availability" content="https://schema.org/InStock">
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                        <button 
                            class="view-details-btn" 
                            data-product-id="${product.id}"
                            aria-label="Ver detalhes de ${product.nome}"
                        >
                            <i class="fas fa-info-circle" aria-hidden="true"></i>
                            <span>Detalhes</span>
                        </button>
                        <a 
                            href="${generateWhatsAppLink(product.nome)}" 
                            class="whatsapp-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Solicitar ${product.nome} via WhatsApp"
                        >
                            <i class="fab fa-whatsapp" aria-hidden="true"></i>
                            <span>WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>
        </article>
    `).join('');

    elements.productsGrid.innerHTML = productsHtml;

    // Add click events to product cards and buttons
    elements.productsGrid.querySelectorAll('.product-card').forEach(card => {
        // Card click (excluding buttons)
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.view-details-btn, .whatsapp-btn')) {
                const productId = card.getAttribute('data-product-id');
                openModal(productId);
            }
        });

        // Keyboard support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.target.closest('button, a')) {
                const productId = card.getAttribute('data-product-id');
                openModal(productId);
            }
        });
    });

    // View details buttons
    elements.productsGrid.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = btn.getAttribute('data-product-id');
            openModal(productId);
            trackEvent('product_details_view', { product_id: productId });
        });
    });

    // WhatsApp buttons tracking
    elements.productsGrid.querySelectorAll('.whatsapp-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productName = btn.getAttribute('aria-label').replace('Solicitar ', '').replace(' via WhatsApp', '');
            trackEvent('whatsapp_click', { product_name: productName });
        });
    });

    console.log(`📦 ${appState.filteredProducts.length} produtos renderizados!`);
}

/**
 * Generate WhatsApp link with pre-filled message
 */
function generateWhatsAppLink(productName) {
    const message = `Olá! Vim pelo site e estou interessado no produto: ${productName}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

/**
 * Open product modal
 */
function openModal(productId) {
    const product = appState.products.find(p => p.id === productId);
    if (!product) return;

    const modalHtml = `
        <div class="modal-content" itemscope itemtype="https://schema.org/Product">
            <div class="modal-header">
                <h2 id="modal-title" itemprop="name" style="color: var(--text-primary); margin-bottom: 0.5rem;">
                    ${product.nome}
                </h2>
                <p style="color: var(--primary); font-weight: 600;" itemprop="category">
                    ${product.categoria}
                </p>
                <button class="modal-close" aria-label="Fechar modal">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="modal-image">
                    <img 
                        src="${product.imagem}" 
                        alt="${product.nome}" 
                        itemprop="image"
                        loading="lazy"
                    />
                </div>
                
                ${product.video ? `
                    <div class="video-container">
                        <iframe 
                            src="${product.video}" 
                            title="Vídeo demonstrativo: ${product.nome}"
                            allowfullscreen
                            loading="lazy"
                        ></iframe>
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: var(--text-primary); margin-bottom: 1rem;">
                        Descrição Completa
                    </h3>
                    <p style="color: var(--text-secondary); line-height: 1.7;" itemprop="description">
                        ${product.descricaoCompleta || product.descricao}
                    </p>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: var(--text-primary); margin-bottom: 1rem;">
                        Características Principais
                    </h3>
                    <div style="display: grid; gap: 0.5rem;">
                        ${(product.caracteristicas || []).map(feature => `
                            <div class="feature-item">
                                <i class="fas fa-check-circle" aria-hidden="true"></i>
                                <span>${feature}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${(product.tecnologias && product.tecnologias.length > 0) ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: var(--text-primary); margin-bottom: 1rem;">
                        Tecnologias Utilizadas
                    </h3>
                    <div class="tech-tags">
                        ${product.tecnologias.map(tech => `
                            <span class="tech-tag">${tech}</span>
                        `).join('')}
                    </div>
                </div>` : ''}
                
                ${(product.casos && product.casos.length > 0) ? `
                <div class="cases-section">
                    <div class="cases-title">
                        <i class="fas fa-trophy" aria-hidden="true"></i>
                        Cases de Sucesso
                    </div>
                    ${product.casos.map(caso => `
                        <div class="case-item">
                            <i class="fas fa-quote-left" style="color: var(--primary); margin-right: 0.5rem;" aria-hidden="true"></i>
                            ${caso}
                        </div>
                    `).join('')}
                </div>` : ''}
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 2rem; padding: 1.5rem; background: rgba(139, 92, 246, 0.05); border-radius: 12px;">
                    <div>
                        <strong style="color: var(--primary);">Preço:</strong><br />
                        <span style="font-size: 1.2rem; font-weight: bold;" itemprop="price">${product.preco}</span>
                        <meta itemprop="priceCurrency" content="BRL">
                        <meta itemprop="availability" content="https://schema.org/InStock">
                    </div>
                    <div>
                        <strong style="color: var(--primary);">Implementação:</strong><br />
                        ${product.tempoImplementacao || 'N/A'}
                    </div>
                    <div>
                        <strong style="color: var(--primary);">Suporte:</strong><br />
                        ${product.suporte || 'N/A'}
                    </div>
                    <div>
                        <strong style="color: var(--primary);">Garantia:</strong><br />
                        ${product.garantia || 'N/A'}
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; flex-wrap: wrap;">
                    <button 
                        class="submit-btn" 
                        onclick="scrollToQuote()"
                        style="flex: 1; min-width: 200px;"
                    >
                        <i class="fas fa-handshake" style="margin-right: 0.5rem;" aria-hidden="true"></i>
                        <span>Solicitar Orçamento</span>
                    </button>
                    <a 
                        href="${generateWhatsAppLink(product.nome)}" 
                        class="whatsapp-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="flex: 1; min-width: 200px; text-decoration: none;"
                        onclick="trackEvent('whatsapp_modal_click', { product_name: '${product.nome}' })"
                    >
                        <i class="fab fa-whatsapp" style="margin-right: 0.5rem;" aria-hidden="true"></i>
                        <span>Falar no WhatsApp</span>
                    </a>
                </div>
            </div>
        </div>
    `;

    elements.modal.innerHTML = modalHtml;
    elements.modal.classList.add('active');
    elements.modal.setAttribute('aria-hidden', 'false');
    elements.modal.setAttribute('aria-labelledby', 'modal-title');
    
    // Focus management
    const firstFocusable = elements.modal.querySelector('.modal-close');
    if (firstFocusable) {
        firstFocusable.focus();
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    console.log(`📖 Modal aberto para: ${product.nome}`);
}

/**
 * Close modal
 */
function closeModal() {
    elements.modal.classList.remove('active');
    elements.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'unset';
}

/**
 * Scroll to quote section and close modal
 */
function scrollToQuote() {
    closeModal();
    setTimeout(() => {
        const quoteSection = document.querySelector('.quote-section');
        if (quoteSection) {
            quoteSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Focus on first form field for accessibility
            setTimeout(() => {
                const firstInput = quoteSection.querySelector('input[name="nome"]'); // Focus on name input
                if (firstInput) {
                    firstInput.focus();
                }
            }, 500);
        }
    }, 300);
}

/**
 * Show error message
 */
function showError() {
    elements.loadingContainer.style.display = 'none';
    elements.productsGrid.style.display = 'none';
    elements.noResults.style.display = 'none';
    elements.categoryFilters.innerHTML = '';
    
    elements.errorMessage.innerHTML = `
        <div style="
            text-align: center; 
            padding: 4rem 2rem;
            color: var(--text-secondary);
            max-width: 600px;
            margin: 0 auto;
        ">
            <i class="fas fa-exclamation-triangle" style="
                font-size: 4rem; 
                margin-bottom: 2rem;
                color: var(--primary);
                opacity: 0.7;
            " aria-hidden="true"></i>
            
            <h3 style="
                color: var(--text-primary); 
                margin-bottom: 1rem;
                font-size: 1.8rem;
            ">
                Erro ao Carregar Produtos
            </h3>
            
            <p style="
                margin-bottom: 2rem;
                line-height: 1.6;
                font-size: 1.1rem;
            ">
                <strong style="color: var(--primary);">Motivo:</strong><br>
                ${appState.error}
            </p>
            
            <div style="
                background: rgba(139, 92, 246, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                text-align: left;
            ">
                <h4 style="
                    color: var(--primary);
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                ">
                    <i class="fas fa-lightbulb" aria-hidden="true"></i>
                    Como resolver:
                </h4>
                <ol style="
                    color: var(--text-secondary);
                    line-height: 1.6;
                    padding-left: 1.5rem;
                ">
                    <li style="margin-bottom: 0.5rem;">
                        Certifique-se que o arquivo <code style="
                            background: rgba(139, 92, 246, 0.2);
                            padding: 0.2rem 0.5rem;
                            border-radius: 4px;
                            color: var(--primary);
                        ">produtos.json</code> está na mesma pasta que <code style="
                            background: rgba(139, 92, 246, 0.2);
                            padding: 0.2rem 0.5rem;
                            border-radius: 4px;
                            color: var(--primary);
                        ">produtos.html</code>
                    </li>
                    <li style="margin-bottom: 0.5rem;">
                        Verifique se o JSON está válido (sem erros de sintaxe)
                    </li>
                    <li style="margin-bottom: 0.5rem;">
                        Se testando localmente, use um servidor local como Live Server (VS Code)
                    </li>
                </ol>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button 
                    class="submit-btn"
                    onclick="window.location.reload()"
                    style="max-width: 200px;"
                >
                    <i class="fas fa-redo" style="margin-right: 0.5rem;" aria-hidden="true"></i>
                    <span>Tentar Novamente</span>
                </button>
                
                <button 
                    class="category-btn"
                    onclick="window.open('https://jsonlint.com/', '_blank')"
                    style="
                        background: var(--dark-hover);
                        color: var(--text-secondary);
                        padding: 0.75rem 1.5rem;
                        border: 2px solid var(--primary);
                        max-width: 200px;
                    "
                >
                    <i class="fas fa-external-link-alt" style="margin-right: 0.5rem;" aria-hidden="true"></i>
                    <span>Validar JSON</span>
                </button>
            </div>
        </div>
    `;
    elements.errorMessage.style.display = 'block';
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    elements.loadingContainer.style.display = 'none';
    if (elements.initialLoading) {
        elements.initialLoading.style.display = 'none';
    }
}

/**
 * Setup form handlers
 */
function setupFormHandlers() {
    const form = document.getElementById('quote-form');
    const budgetOptions = document.getElementById('budget-options');
    
    if (!form || !budgetOptions) return;
    
    let selectedBudget = '';

    // Budget selection with keyboard support
    budgetOptions.addEventListener('click', (e) => {
        if (e.target.classList.contains('budget-option')) {
            selectBudgetOption(e.target);
        }
    });

    budgetOptions.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('budget-option')) {
            const options = Array.from(budgetOptions.querySelectorAll('.budget-option'));
            const currentIndex = options.indexOf(e.target);
            
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectBudgetOption(e.target);
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % options.length;
                options[nextIndex].focus();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + options.length) % options.length;
                options[prevIndex].focus();
            }
        }
    });

    function selectBudgetOption(option) {
        // Remove previous selection
        budgetOptions.querySelectorAll('.budget-option').forEach(opt => {
            opt.classList.remove('selected');
            opt.setAttribute('aria-checked', 'false');
        });
        
        // Add selection to clicked option
        option.classList.add('selected');
        option.setAttribute('aria-checked', 'true');
        selectedBudget = option.getAttribute('data-budget');
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const originalHtml = submitBtn.innerHTML;
        
        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.orcamento = selectedBudget; // Adiciona o orçamento selecionado aos dados
        
        // Basic validation
        if (!data.nome || !data.email || !data.descricao) {
            showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        // Update button state
        submitBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin" style="margin-right: 0.5rem;" aria-hidden="true"></i>
            <span>Enviando...</span>
        `;
        submitBtn.disabled = true;

        try {
            const webhookUrl = 'https://requisicao.iautomatize.com/webhook/af00db0f-9dd0-4f31-9928-8296c7545e8e';
            
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data), // Envia os dados do formulário como JSON
            });

            if (response.ok) {
                // Sucesso no envio para o webhook
                showToast('Orçamento solicitado com sucesso! Entraremos em contato em breve.', 'success');
                form.reset();
                budgetOptions.querySelectorAll('.budget-option').forEach(opt => {
                    opt.classList.remove('selected');
                    opt.setAttribute('aria-checked', 'false');
                });
                selectedBudget = ''; // Reseta o orçamento selecionado
                
                // Track successful submission
                trackEvent('quote_submitted', {
                    product_type: data.produto,
                    budget: data.orcamento 
                });
            } else {
                // Erro ao enviar para o webhook
                const errorText = await response.text();
                console.error('Erro no webhook:', response.status, errorText);
                showToast(`Erro ao enviar: ${response.status}. Tente novamente.`, 'error');
            }
            
        } catch (error) {
            // Erro de rede ou outro erro durante o fetch
            console.error('Erro ao enviar formulário:', error);
            showToast('Erro de rede ao enviar orçamento. Verifique sua conexão e tente novamente.', 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalHtml;
            submitBtn.disabled = false;
        }
    });
}

/**
 * Animate hero numbers
 */
function animateNumbers() {
    const numbers = document.querySelectorAll('.stat-number');
    
    // Intersection Observer for animation trigger
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const number = entry.target;
                const target = parseInt(number.getAttribute('data-count'));
                animateNumber(number, 0, target, 2000);
                observer.unobserve(number);
            }
        });
    }, { threshold: 0.5 });

    numbers.forEach(number => {
        observer.observe(number);
    });
}

/**
 * Animate a single number
 */
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const value = Math.floor(start + (end - start) * easeOutQuart);
        
        element.textContent = value.toLocaleString('pt-BR');
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#8B5CF6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        pointer-events: auto;
        cursor: pointer;
    `;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span style="margin-right: 8px;">${icon}</span> ${message}`;
    
    container.appendChild(toast);
    
    // Show toast
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
    });
    
    // Auto remove
    const removeToast = () => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    };
    
    toast.addEventListener('click', removeToast);
    setTimeout(removeToast, 5000);
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
        fbq('trackCustom', eventName, eventData); // Use 'trackCustom' for custom events if needed
    }
    
    console.log('📊 Event tracked:', eventName, eventData);
}

/**
 * Utility functions
 */
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

/**
 * Service Worker registration for PWA capabilities
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            // Certifique-se que o caminho para sw.js está correto
            // Se produtos.html está na raiz, '/sw.js' está ok.
            // Se estiver em uma subpasta, ajuste o caminho ou use um caminho absoluto.
            const registration = await navigator.serviceWorker.register('sw.js'); // ou '/sw.js' se estiver na raiz
            console.log('✅ ServiceWorker registrado:', registration.scope);
        } catch (error) {
            console.log('❌ Falha no registro do ServiceWorker:', error);
        }
    });
}

// Global functions for HTML onclick handlers
window.scrollToQuote = scrollToQuote;
window.trackEvent = trackEvent; // Expondo globalmente se necessário para onclicks no HTML

console.log('🎉 Sistema de Produtos IAutomatize carregado com sucesso!');

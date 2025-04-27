/**
 * components.js - Componentes reutilizáveis para o MiniIA Hub
 * Carrega dinamicamente componentes como navbar e footer
 */

(function() {
    /**
     * Componentes HTML
     */
    const COMPONENTS = {
        // Navbar
        'main-navbar': `
            <div class="container navbar-container">
                <a href="index.html" class="navbar-logo">
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 3C9.716 3 3 9.716 3 18C3 26.284 9.716 33 18 33C26.284 33 33 26.284 33 18C33 9.716 26.284 3 18 3Z" fill="#2D9CDB"/>
                        <path d="M24 13L16 21L12 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 25L10 21L14 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M22 9L26 13L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>MiniIA Hub</span>
                </a>
                
                <ul class="navbar-menu" id="navbar-menu">
                    <li><a href="index.html#features">Recursos</a></li>
                    <li><a href="catalogo.html" class="active">Mini-IAs</a></li>
                    <li><a href="index.html#pricing">Preços</a></li>
                    <li><a href="index.html#contact">Contato</a></li>
                    <li id="nav-auth-item">
                        <!-- Será preenchido dinamicamente baseado no estado de autenticação -->
                    </li>
                </ul>
                
                <div class="navbar-actions">
                    <button class="theme-toggle" aria-label="Alternar modo escuro">
                        <!-- Ícone será inserido via theme.js -->
                    </button>
                    
                    <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Menu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `,
        
        // Footer
        'main-footer': `
            <div class="container">
                <div class="footer-container">
                    <div class="footer-about">
                        <a href="index.html" class="footer-logo">
                            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 3C9.716 3 3 9.716 3 18C3 26.284 9.716 33 18 33C26.284 33 33 26.284 33 18C33 9.716 26.284 3 18 3Z" fill="#2D9CDB"/>
                                <path d="M24 13L16 21L12 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M14 25L10 21L14 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M22 9L26 13L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            MiniIA Hub
                        </a>
                        <p>A sua loja de Mini-IAs para automatizar tudo, sem escrever uma linha de código</p>
                        
                        <div class="footer-social">
                            <a href="#" aria-label="Facebook">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </a>
                            <a href="#" aria-label="Twitter">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M23 3C22.0424 3.67548 20.9821 4.19211 19.86 4.53C19.2577 3.83751 18.4573 3.34669 17.567 3.12393C16.6767 2.90116 15.7395 2.9572 14.8821 3.28445C14.0247 3.6117 13.2884 4.19439 12.773 4.95372C12.2575 5.71305 11.9877 6.61234 12 7.53V8.53C10.2426 8.57557 8.50127 8.18581 6.93101 7.39545C5.36074 6.60508 4.01032 5.43864 3 4C3 4 -1 13 8 17C5.94053 18.398 3.48716 19.0989 1 19C10 24 21 19 21 7.5C20.9991 7.22145 20.9723 6.94359 20.92 6.67C21.9406 5.66349 22.6608 4.39271 23 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </a>
                            <a href="#" aria-label="Instagram">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61991 14.1902 8.22773 13.4229 8.09406 12.5922C7.9604 11.7615 8.09206 10.9099 8.47032 10.1584C8.84858 9.40685 9.45418 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87659 12.63 8C13.4789 8.12588 14.2648 8.52146 14.8717 9.12831C15.4785 9.73515 15.8741 10.5211 16 11.37Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M17.5 6.5H17.51" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </a>
                            <a href="#" aria-label="LinkedIn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M6 9H2V21H6V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                    
                    <div class="footer-links">
                        <h4>Produto</h4>
                        <ul>
                            <li><a href="#">Recursos</a></li>
                            <li><a href="#">Mini-IAs</a></li>
                            <li><a href="#">Integrações</a></li>
                            <li><a href="#">Preços</a></li>
                            <li><a href="#">Roadmap</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-links">
                        <h4>Empresa</h4>
                        <ul>
                            <li><a href="#">Sobre nós</a></li>
                            <li><a href="#">Blog</a></li>
                            <li><a href="#">Clientes</a></li>
                            <li><a href="#">Carreiras</a></li>
                            <li><a href="#">Contato</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-newsletter">
                        <h4>Fique por dentro</h4>
                        <p>Receba novidades sobre nossos lançamentos e dicas de automação</p>
                        <div class="footer-newsletter-form">
                            <input type="email" placeholder="Seu e-mail">
                            <button>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 2L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>&copy; 2025 MiniIA Hub. Todos os direitos reservados.</p>
                </div>
            </div>
        `
    };

    /**
     * Carrega os componentes quando o DOM estiver pronto
     */
    document.addEventListener('DOMContentLoaded', () => {
        // Carregar todos os componentes
        Object.keys(COMPONENTS).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = COMPONENTS[id];
            }
        });
        
        // Configurar menu mobile
        setupMobileMenu();
        
        // Verificar autenticação e atualizar menu
        updateAuthMenu();

        // Marcar link atual como ativo
        highlightActiveLink();
    });

    /**
     * Configura o menu mobile
     */
    function setupMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const navbarMenu = document.getElementById('navbar-menu');
        
        if (mobileMenuToggle && navbarMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                navbarMenu.classList.toggle('active');
            });
        }
    }

    /**
     * Atualiza o menu baseado no estado de autenticação
     */
    function updateAuthMenu() {
        const navAuthItem = document.getElementById('nav-auth-item');
        if (!navAuthItem) return;
        
        const isLoggedIn = !!localStorage.getItem('miniai_session_token');
        
        if (isLoggedIn) {
            const userEmail = localStorage.getItem('miniai_user_email');
            const displayName = userEmail ? userEmail.split('@')[0] : 'Usuário';
            
            navAuthItem.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline dropdown-toggle">
                        ${displayName}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <div class="dropdown-menu">
                        <a href="dashboard.html">Dashboard</a>
                        <a href="account.html">Minha Conta</a>
                        <div class="dropdown-divider"></div>
                        <a href="#" id="logout-link">Sair</a>
                    </div>
                </div>
            `;
            
            // Adicionar listener para logout
            const logoutLink = document.getElementById('logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    logout();
                });
            }
        } else {
            navAuthItem.innerHTML = `
                <a href="login.html" class="btn btn-outline">Login</a>
            `;
        }
    }

    /**
     * Destaca o link atual baseado na URL
     */
    function highlightActiveLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.navbar-menu a');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            const linkPath = link.getAttribute('href');
            if (currentPath.includes(linkPath) && linkPath !== 'index.html') {
                link.classList.add('active');
            }
            
            // Caso especial para a página inicial
            if (currentPath.endsWith('/') || currentPath.endsWith('index.html')) {
                if (linkPath === 'index.html' || linkPath === '/') {
                    link.classList.add('active');
                }
            }
        });
    }

    /**
     * Função de logout
     */
    function logout() {
        // Limpar tokens e dados de autenticação
        localStorage.removeItem('miniai_session_token');
        localStorage.removeItem('miniai_user_email');
        
        // Redirecionar para a página inicial
        window.location.href = 'index.html';
    }

    // Exportar funções úteis
    window.components = {
        updateAuthMenu,
        logout
    };
})();

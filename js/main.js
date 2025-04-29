/**
 * IAutomatize - Script principal
 * Versão otimizada para performance e SEO
 * 
 * Este arquivo contém todos os scripts não-críticos do site,
 * carregados de forma assíncrona para melhorar o desempenho.
 */

// Função de rastreamento de eventos unificada
function trackEvent(eventName, eventData) {
    // Complementa os dados do evento com informações do dispositivo/navegador
    const baseData = {
        site: "iautomatize.com",
        timestamp: new Date().toISOString(),
        pagina: window.location.href,
        referrer: document.referrer || "acesso direto",
        resolucao: `${window.screen.width}x${window.screen.height}`,
        plataforma: navigator.platform,
        userAgent: navigator.userAgent,
        idioma: navigator.language,
        dispositivo: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
        tempoSessao: Math.floor((new Date() - window.performance.timing.navigationStart) / 1000)
    };

    // Combina os dados base com os dados específicos do evento
    const fullData = { ...baseData, ...eventData };

    // Envia o webhook com os dados completos
    fetch(`https://requisicao.iautomatize.com/webhook/${eventName}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(fullData)
    })
    .catch(error => console.warn(`Erro no rastreamento de evento ${eventName}:`, error));

    // Log apenas em ambiente de desenvolvimento
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(`Evento: ${eventName}`, fullData);
    }
}

// Configuração de observadores de interseção
function setupIntersectionObservers() {
    // Animação de elementos na rolagem
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animateElements.length > 0) {
        const animateObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Desativa a observação após a animação
                    animateObserver.unobserve(entry.target);
                }
            });
        }, {
            root: null, // viewport
            threshold: 0.1, // 10% visível
            rootMargin: '0px 0px -100px 0px' // gatilho quando estiver 100px acima da parte inferior da viewport
        });
        
        animateElements.forEach(element => {
            animateObserver.observe(element);
        });
    }
    
    // Lazy loading de imagens (fallback para navegadores sem suporte nativo)
    const lazyImages = document.querySelectorAll('img[loading="lazy"]:not([src])');
    
    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                        }
                        img.removeAttribute('data-src');
                        img.removeAttribute('data-srcset');
                        imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: '200px' // Carrega quando estiver a 200px da viewport
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Gerenciador de Modais
class ModalManager {
    constructor() {
        this.modals = document.querySelectorAll('.modal');
        this.openButtons = document.querySelectorAll('[data-modal]');
        this.closeButtons = document.querySelectorAll('.close-modal');
        this.activeModal = null;
        
        this.init();
    }
    
    init() {
        // Configurar botões de abertura
        this.openButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = `modal-${button.dataset.modal}`;
                this.openModal(modalId);
                
                // Rastrear evento de abertura de modal
                trackEvent('modal_aberto', {
                    modal: modalId,
                    origem: button.textContent || 'Botão sem texto'
                });
            });
        });
        
        // Configurar botões de fechamento
        this.closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                this.closeModal(modal.id);
            });
        });
        
        // Fechamento ao clicar fora do modal
        window.addEventListener('click', (e) => {
            this.modals.forEach(modal => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Fechamento com tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal(this.activeModal.id);
            }
        });
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Fecha qualquer modal ativo
        if (this.activeModal) {
            this.closeModal(this.activeModal.id);
        }
        
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Previne rolagem
        
        // Foco no primeiro elemento focável
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length) {
            focusableElements[0].focus();
        }
        
        this.activeModal = modal;
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto'; // Restaura rolagem
        
        this.activeModal = null;
    }
}

// Gerenciador de Chat
class ChatManager {
    constructor() {
        this.bubble = document.querySelector('.floating-bubble');
        this.chatBox = document.querySelector('.chat-box');
        this.closeButton = document.querySelector('.chat-close');
        this.input = document.querySelector('.chat-input');
        this.sendButton = document.querySelector('.chat-send');
        this.chatBody = document.querySelector('.chat-body');
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        if (!this.bubble || !this.chatBox) return;
        
        // Abrir/fechar chat
        this.bubble.addEventListener('click', () => {
            this.toggleChat();
        });
        
        this.closeButton.addEventListener('click', () => {
            this.closeChat();
        });
        
        // Enviar mensagem
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
        
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Fecha o chat ao clicar fora
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.chatBox.contains(e.target) && 
                !this.bubble.contains(e.target)) {
                this.closeChat();
            }
        });
    }
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        this.chatBox.classList.add('active');
        this.chatBox.setAttribute('aria-hidden', 'false');
        this.isOpen = true;
        
        // Foca no input
        setTimeout(() => {
            this.input.focus();
        }, 300);
        
        // Rastreia evento
        trackEvent('chat_aberto', {
            mensagem: 'Chat aberto pelo usuário'
        });
    }
    
    closeChat() {
        this.chatBox.classList.remove('active');
        this.chatBox.setAttribute('aria-hidden', 'true');
        this.isOpen = false;
    }
    
    sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;
        
        // Adiciona mensagem do usuário
        this.addMessage('user', message);
        
        // Limpa input e foca de volta nele
        this.input.value = '';
        this.input.focus();
        
        // Rastreia evento
        trackEvent('chat_mensagem', {
            tipo: 'usuario',
            conteudo: message
        });
        
        // Simula resposta automática
        setTimeout(() => {
            this.addBotResponse(message);
        }, 1000);
    }
    
    addMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        
        const messageP = document.createElement('p');
        messageP.textContent = text;
        
        messageDiv.appendChild(messageP);
        this.chatBody.appendChild(messageDiv);
        
        // Rolagem para o final da conversa
        this.chatBody.scrollTop = this.chatBody.scrollHeight;
    }
    
    addBotResponse(userMessage) {
        // Respostas padrão simples baseadas em palavras-chave
        let botResponse = "Obrigado por entrar em contato com a IAutomatize! Um de nossos especialistas entrará em contato em breve para discutir soluções personalizadas para o seu negócio.";
        
        // Adiciona variação às respostas com base em palavras-chave simples
        if (userMessage.toLowerCase().includes('preço') || 
            userMessage.toLowerCase().includes('custo') || 
            userMessage.toLowerCase().includes('valor')) {
            botResponse = "Temos soluções personalizadas com preços que se adaptam ao tamanho e às necessidades do seu negócio. Um consultor entrará em contato para apresentar a melhor opção para você.";
        } 
        else if (userMessage.toLowerCase().includes('contato') || 
                 userMessage.toLowerCase().includes('falar') || 
                 userMessage.toLowerCase().includes('whatsapp')) {
            botResponse = "Você pode falar conosco pelo WhatsApp: +55 15 99107-5698 ou pelo e-mail: contato@iautomatize.com";
        }
        else if (userMessage.toLowerCase().includes('prazo') || 
                 userMessage.toLowerCase().includes('tempo') || 
                 userMessage.toLowerCase().includes('quando')) {
            botResponse = "Nossas soluções podem ser implementadas em prazos que variam de 2 a 8 semanas, dependendo da complexidade. Um consultor irá avaliar seu caso específico.";
        }
        
        this.addMessage('bot', botResponse);
        
        // Rastreia evento
        trackEvent('chat_mensagem', {
            tipo: 'bot',
            conteudo: botResponse.substring(0, 50) + '...' // Apenas os primeiros 50 caracteres
        });
    }
}

// Gerenciador de Menu Mobile
class MobileMenuManager {
    constructor() {
        this.menuToggle = document.querySelector('.mobile-toggle');
        this.menu = document.querySelector('.menu');
        this.menuLinks = document.querySelectorAll('.menu a');
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        if (!this.menuToggle || !this.menu) return;
        
        // Toggle do menu
        this.menuToggle.addEventListener('click', () => {
            this.toggleMenu();
        });
        
        // Fecha o menu ao clicar em links
        this.menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });
        
        // Fecha o menu ao redimensionar a tela para desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.closeMenu();
            }
        });
        
        // Fecha o menu ao clicar fora
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.menu.contains(e.target) && 
                !this.menuToggle.contains(e.target)) {
                this.closeMenu();
            }
        });
        
        // Fecha o menu com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
    }
    
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.menu.classList.add('active');
        this.menuToggle.innerHTML = '<i class="fas fa-times"></i>';
        this.menuToggle.setAttribute('aria-expanded', 'true');
        this.isOpen = true;
        
        // Previne rolagem do body quando menu está aberto
        document.body.style.overflow = 'hidden';
    }
    
    closeMenu() {
        this.menu.classList.remove('active');
        this.menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        this.menuToggle.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
        
        // Restaura rolagem
        document.body.style.overflow = 'auto';
    }
}

// Gerenciador de Rolagem Suave
class SmoothScrollManager {
    constructor() {
        this.links = document.querySelectorAll('a[href^="#"]');
        
        this.init();
    }
    
    init() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                // Verifica se a API de comportamento de rolagem suave é suportada
                if ('scrollBehavior' in document.documentElement.style) {
                    e.preventDefault();
                    
                    const targetId = link.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
                        const headerOffset = 80; // Altura do header fixo
                        
                        window.scrollTo({
                            top: offsetTop - headerOffset,
                            behavior: 'smooth'
                        });
                        
                        // Atualiza URL sem recarregar a página
                        history.pushState(null, null, targetId);
                        
                        // Rastreia evento
                        trackEvent('navegacao_interna', {
                            link: targetId,
                            texto: link.textContent || 'Link sem texto'
                        });
                    }
                }
            });
        });
    }
}

// Rastreador de Cliques em Produtos
class ProductTracker {
    constructor() {
        this.productLinks = document.querySelectorAll('[data-tracking]');
        
        this.init();
    }
    
    init() {
        this.productLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const productType = link.dataset.tracking;
                const productName = link.querySelector('h3')?.textContent || 'Produto sem nome';
                
                // Rastreia clique no produto
                trackEvent('interessadoemservico', {
                    produto: productType,
                    nome: productName,
                    url: link.href
                });
            });
        });
    }
}

// Inicialização geral
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se DOMContentLoaded é suportado
    // (este código será executado quando o HTML for totalmente carregado)
    
    // Gerenciadores de elementos da interface
    new MobileMenuManager();
    new ModalManager();
    new ChatManager();
    new SmoothScrollManager();
    new ProductTracker();
    
    // Configuração de observadores de interseção para lazy loading
    setupIntersectionObservers();
    
    // Rastreia tempo de carregamento da página inicial
    const loadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
    trackEvent('pagina_carregada', {
        tempo_ms: loadTime,
        url: window.location.pathname
    });
    
    // Verifica se o usuário está em modo escuro para futura implementação
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    trackEvent('preferencia_usuario', {
        modo_escuro: prefersDarkMode
    });
});

// Event listeners de performance para métricas de Web Vitals
window.addEventListener('load', () => {
    // Executado quando todos os recursos (CSS, imagens, etc) estiverem carregados
    setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        const renderTime = perfData.domComplete - perfData.domLoading;
        
        trackEvent('metricas_performance', {
            total_ms: pageLoadTime,
            dom_ready_ms: domReadyTime,
            render_ms: renderTime
        });
        
        // Exibe mensagem apenas em desenvolvimento
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log(`Página carregada em ${pageLoadTime}ms. DOM pronto em ${domReadyTime}ms.`);
        }
    }, 0);
});

// Interceptar links externos para rastreamento
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    
    if (link && link.href && link.hostname !== window.location.hostname && !link.hasAttribute('data-tracking')) {
        // É um link externo
        trackEvent('link_externo', {
            url: link.href,
            texto: link.textContent || 'Link sem texto'
        });
    }
});

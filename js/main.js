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
        this.bubble = document.querySelector('.fixed[aria-label="Abrir chat"]');
        this.chatBox = document.querySelector('.fixed[aria-hidden="true"]');
        this.closeButton = this.chatBox?.querySelector('button[aria-label="Fechar chat"]');
        this.formContainer = this.chatBox?.querySelector('.chat-form-container');
        this.messagesContainer = this.chatBox?.querySelector('.chat-messages-container');
        this.chatBody = this.chatBox?.querySelector('.chat-body');
        this.initialForm = this.chatBox?.querySelector('.chat-initial-form');
        this.input = this.messagesContainer?.querySelector('input');
        this.sendButton = this.messagesContainer?.querySelector('button[aria-label="Enviar mensagem"]');
        
        this.isOpen = false;
        this.userData = null;
        
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
        
        // Formulário inicial
        this.initialForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
        
        // Máscara de WhatsApp
        const whatsappInput = this.initialForm?.querySelector('#chat-whatsapp');
        if (whatsappInput) {
            whatsappInput.addEventListener('input', (e) => {
                this.formatWhatsApp(e);
            });
        }
        
        // Enviar mensagem
        this.sendButton?.addEventListener('click', () => {
            this.sendMessage();
        });
        
        this.input?.addEventListener('keypress', (e) => {
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
    
    formatWhatsApp(e) {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        
        // Remove caracteres a mais
        if (value.length > 11) {
            value = value.substring(0, 11);
        }
        
        // Formatação: (00) 00000-0000
        if (value.length > 0) {
            formattedValue = '(' + value.substring(0, 2);
        }
        if (value.length > 2) {
            formattedValue += ') ' + value.substring(2, 7);
        }
        if (value.length > 7) {
            formattedValue += '-' + value.substring(7, 11);
        }
        
        e.target.value = formattedValue;
    }
    
    validateWhatsApp(whatsapp) {
        // Remove todos os caracteres não numéricos
        const numbers = whatsapp.replace(/\D/g, '');
        
        // Verifica se tem 11 dígitos (2 DDD + 9 número)
        if (numbers.length !== 11) {
            return false;
        }
        
        // Verifica se o DDD é válido (11-99)
        const ddd = parseInt(numbers.substring(0, 2));
        if (ddd < 11 || ddd > 99) {
            return false;
        }
        
        // Verifica se o número começa com 9 (celular)
        if (numbers[2] !== '9') {
            return false;
        }
        
        return true;
    }
    
    handleFormSubmit() {
        const nameInput = this.initialForm.querySelector('#chat-name');
        const whatsappInput = this.initialForm.querySelector('#chat-whatsapp');
        
        const name = nameInput.value.trim();
        const whatsapp = whatsappInput.value.trim();
        
        // Validações
        if (!name || name.length < 3) {
            this.showFormError('Por favor, insira seu nome completo.');
            nameInput.focus();
            return;
        }
        
        if (!this.validateWhatsApp(whatsapp)) {
            this.showFormError('Por favor, insira um número de WhatsApp válido com DDD.');
            whatsappInput.focus();
            return;
        }
        
        // Salva dados do usuário
        this.userData = {
            name: name,
            whatsapp: whatsapp.replace(/\D/g, '') // Salva apenas números
        };
        
        // Rastreia evento
        trackEvent('chat_formulario_preenchido', {
            nome: name
        });
        
        // Mostra o chat
        this.formContainer.classList.add('hidden');
        this.messagesContainer.classList.remove('hidden');
        
        // Mensagem de boas-vindas
        this.addMessage('bot', `Olá ${name}! Sou o assistente virtual da IAutomatize. Como posso ajudar você hoje?`);
        
        // Foca no input
        setTimeout(() => {
            this.input.focus();
        }, 300);
    }
    
    showFormError(message) {
        // Remove erro anterior se existir
        const existingError = this.initialForm.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Cria nova mensagem de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message bg-red-50 text-red-600 text-sm p-3 rounded-lg mt-2';
        errorDiv.textContent = message;
        
        this.initialForm.appendChild(errorDiv);
        
        // Remove após 5 segundos
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        this.chatBox.classList.add('scale-100');
        this.chatBox.classList.remove('scale-0');
        this.chatBox.setAttribute('aria-hidden', 'false');
        this.isOpen = true;
        
        // Foca no primeiro input do formulário ou no input de mensagem
        setTimeout(() => {
            if (!this.userData) {
                this.initialForm?.querySelector('#chat-name')?.focus();
            } else {
                this.input?.focus();
            }
        }, 300);
        
        // Rastreia evento
        trackEvent('chat_aberto', {
            tela: this.userData ? 'conversa' : 'formulario'
        });
    }
    
    closeChat() {
        this.chatBox.classList.remove('scale-100');
        this.chatBox.classList.add('scale-0');
        this.chatBox.setAttribute('aria-hidden', 'true');
        this.isOpen = false;
    }
    
    async sendMessage() {
        const message = this.input.value.trim();
        if (!message || !this.userData) return;
        
        // Adiciona mensagem do usuário
        this.addMessage('user', message);
        
        // Limpa input e desabilita temporariamente
        this.input.value = '';
        this.input.disabled = true;
        this.sendButton.disabled = true;
        
        // Rastreia evento
        trackEvent('chat_mensagem', {
            tipo: 'usuario',
            conteudo: message.substring(0, 50)
        });
        
        // Indicador de digitação
        this.showTypingIndicator();
        
        try {
            // Faz a requisição para a API
            const response = await fetch('https://requisicao.iautomatize.com/webhook/328a2013-0cb9-4fe2-86c5-f7f890989792', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    whatsapp: this.userData.whatsapp,
                    message: message
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Remove indicador de digitação
            this.hideTypingIndicator();
            
            // Adiciona respostas da IA
            if (data.answer && Array.isArray(data.answer)) {
                data.answer.forEach((answer, index) => {
                    setTimeout(() => {
                        this.addMessage('bot', answer);
                    }, index * 300); // Delay entre mensagens
                });
            } else {
                throw new Error('Formato de resposta inválido');
            }
            
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            
            // Remove indicador de digitação
            this.hideTypingIndicator();
            
            // Mostra mensagem de erro
            this.addMessage('bot', 'Desculpe, tivemos um problema técnico. Por favor, tente novamente mais tarde.');
            
            // Rastreia erro
            trackEvent('chat_erro', {
                erro: error.message
            });
        } finally {
            // Reabilita input e botão
            this.input.disabled = false;
            this.sendButton.disabled = false;
            this.input.focus();
        }
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot typing-indicator';
        typingDiv.innerHTML = `
            <div class="inline-block bg-gray-200 p-3 rounded-2xl rounded-bl-none">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                    <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;
        this.chatBody.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typingIndicator = this.chatBody.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    addMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type} mb-4 ${type === 'user' ? 'text-right' : ''}`;
        
        const messageBubble = document.createElement('div');
        messageBubble.className = type === 'user' 
            ? 'inline-block bg-primary text-white p-3 rounded-2xl rounded-br-none max-w-[80%] text-left shadow-md'
            : 'inline-block bg-gray-200 text-gray-800 p-3 rounded-2xl rounded-bl-none max-w-[80%] shadow-md';
        
        messageBubble.textContent = text;
        
        messageDiv.appendChild(messageBubble);
        this.chatBody.appendChild(messageDiv);
        
        // Animação de entrada
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = type === 'user' ? 'translateX(20px)' : 'translateX(-20px)';
        
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateX(0)';
        }, 10);
        
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        this.chatBody.scrollTop = this.chatBody.scrollHeight;
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

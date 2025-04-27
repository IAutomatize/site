/**
 * toast.js - Sistema de notificações toast para o MiniIA Hub
 * Mostra alertas temporários com feedback ao usuário
 */

(function() {
    /**
     * Mostra uma notificação toast
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo de toast: 'success', 'error', 'info', 'warning'
     * @param {number} duration - Duração em ms (padrão: 5000ms)
     * @returns {HTMLElement} - Elemento do toast
     */
    function showToast(message, type = 'info', duration = 5000) {
        // Obter container de toasts
        const container = document.getElementById('toast-container');
        if (!container) {
            console.error('Container de toast não encontrado!');
            return null;
        }
        
        // Criar elemento toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Ícone baseado no tipo
        let icon = '';
        switch (type) {
            case 'success':
                icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
                break;
            case 'error':
                icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
                break;
            case 'warning':
                icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
                break;
            default: // info
                icon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
        }
        
        // Construir HTML do toast
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icon}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-progress"></div>
        `;
        
        // Adicionar ao container
        container.appendChild(toast);
        
        // Mostrar com animação
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Configurar duração da barra de progresso
        const progressBar = toast.querySelector('.toast-progress::after');
        if (progressBar) {
            progressBar.style.animationDuration = `${duration}ms`;
        }
        
        // Auto remover após duração
        const autoCloseTimeout = setTimeout(() => {
            closeToast(toast);
        }, duration);
        
        // Adicionar evento ao botão fechar
        const closeButton = toast.querySelector('.toast-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                clearTimeout(autoCloseTimeout);
                closeToast(toast);
            });
        }
        
        // Retornar elemento para referência
        return toast;
    }
    
    /**
     * Fecha um toast com animação
     * @param {HTMLElement} toast - Elemento toast a ser fechado
     */
    function closeToast(toast) {
        toast.classList.remove('show');
        
        // Remover após a animação
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300); // Corresponde à duração da animação
    }
    
    /**
     * Fecha todos os toasts
     */
    function closeAllToasts() {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toasts = container.querySelectorAll('.toast');
        toasts.forEach(closeToast);
    }
    
    // Exportar funções para uso global
    window.toastManager = {
        showToast,
        closeToast,
        closeAllToasts,
        // Atalhos para tipos comuns
        success: (msg, duration) => showToast(msg, 'success', duration),
        error: (msg, duration) => showToast(msg, 'error', duration),
        info: (msg, duration) => showToast(msg, 'info', duration),
        warning: (msg, duration) => showToast(msg, 'warning', duration)
    };
})();

/**
 * theme.js - Gerenciador de temas claro/escuro para o MiniIA Hub
 * Detecta preferência do sistema e permite alternar entre os temas
 */

(function() {
    // Verificar se o tema já está salvo no localStorage
    const savedTheme = localStorage.getItem('miniIATheme');
    
    // Verificar preferência do sistema
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Definir tema inicial
    let currentTheme = savedTheme || (prefersDarkMode ? 'dark' : 'light');
    
    // Aplicar tema inicial
    document.body.setAttribute('data-theme', currentTheme);
    
    // Função para alternar tema
    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', currentTheme);
        localStorage.setItem('miniIATheme', currentTheme);
        updateThemeIcon();
    }
    
    // Atualizar ícone do botão de tema
    function updateThemeIcon() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (!themeToggle) return;
        
        const isDarkMode = currentTheme === 'dark';
        themeToggle.innerHTML = isDarkMode ? 
            // Ícone do sol para modo escuro
            `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3C10.8065 4.19347 10.136 5.81217 10.136 7.5C10.136 9.18783 10.8065 10.8065 12 12C13.1935 13.1935 14.8122 13.864 16.5 13.864C18.1878 13.864 19.8065 13.1935 21 12C21 13.78 20.4722 15.5201 19.4832 17.0001C18.4943 18.4802 17.0887 19.6337 15.4442 20.3149C13.7996 20.9961 11.99 21.1743 10.2442 20.8271C8.49836 20.4798 6.89472 19.6226 5.63604 18.364C4.37737 17.1053 3.5202 15.5016 3.17294 13.7558C2.82567 12.01 3.0039 10.2004 3.68509 8.55585C4.36628 6.91131 5.51983 5.50571 6.99987 4.51677C8.47991 3.52784 10.22 3 12 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>` : 
            // Ícone da lua para modo claro
            `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 20V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.34 17.66L4.93 19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19.07 4.93L17.66 6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
    }
    
    // Listener para mudanças de preferência do sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        // Só mudar automaticamente se o usuário não tiver escolhido um tema
        if (!localStorage.getItem('miniIATheme')) {
            currentTheme = event.matches ? 'dark' : 'light';
            document.body.setAttribute('data-theme', currentTheme);
            updateThemeIcon();
        }
    });
    
    // Inicializar quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
            updateThemeIcon();
        }
    });
    
    // Exportar funções para uso global
    window.themeManager = {
        toggleTheme,
        getCurrentTheme: () => currentTheme,
        isDarkMode: () => currentTheme === 'dark'
    };
})();

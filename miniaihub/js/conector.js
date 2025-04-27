/**
 * conector.js - Gerenciador da página de conector de Mini-IA
 * Controla a instalação e integração de uma Mini-IA específica
 */

/**
 * Estado global da página
 */
const STATE = {
    miniai: null,
    services: [],
    connectedServices: [],
    currentStep: 'services',
    settings: {},
    installation: {
        inProgress: false,
        complete: false,
        error: null
    }
};

/**
 * Inicializa a página de conector
 * @param {Object} miniaiData - Dados da Mini-IA
 */
function initConector(miniaiData) {
    // Armazenar dados da Mini-IA
    STATE.miniai = miniaiData;
    
    // Aguardar carregamento do oauth-loader
    waitForOAuthLoader()
        .then(() => {
            // Inicializar abas
            initTabs();
            
            // Verificar usuário logado
            checkUserAuthentication();
            
            // Carregar serviços necessários
            loadRequiredServices();
            
            // Configurar botão de instalação
            setupInstallButton();
            
            // Configurar modal de instalação
            setupInstallationModal();
            
            // Log de visualização
            trackEvent('Conector View', { 
                miniaiId: STATE.miniai.id, 
                userEmail: localStorage.getItem('miniai_user_email')
            });
        })
        .catch(error => {
            console.error('Erro ao inicializar página de conector:', error);
            toastManager.error('Ocorreu um erro ao carregar a página. Por favor, recarregue.');
        });
}

/**
 * Aguarda o carregamento do oauth-loader
 */
function waitForOAuthLoader() {
    return new Promise((resolve, reject) => {
        if (typeof oauthLoader !== 'undefined') {
            resolve();
            return;
        }
        
        // Aguardar evento de carregamento
        document.addEventListener('oauth-loader-ready', () => {
            resolve();
        });
        
        // Timeout após 5 segundos
        setTimeout(() => {
            reject(new Error('Timeout aguardando oauth-loader'));
        }, 5000);
    });
}

/**
 * Verifica se o usuário está autenticado
 */
function checkUserAuthentication() {
    const isLoggedIn = !!localStorage.getItem('miniai_session_token');
    const installButton = document.getElementById('install-button');
    
    if (!isLoggedIn) {
        // Alterar botão para login
        installButton.textContent = 'Faça login para instalar';
        installButton.addEventListener('click', () => {
            // Salvar URL atual para redirecionamento após login
            localStorage.setItem('miniai_redirect_after_login', window.location.href);
            window.location.href = '/miniaihub/login.html';
        });
        
        return false;
    }
    
    return true;
}

/**
 * Carrega os serviços necessários para a Mini-IA
 */
async function loadRequiredServices() {
    try {
        if (!STATE.miniai || !STATE.miniai.requiredServices) {
            console.error('Dados de serviços necessários não encontrados');
            return;
        }
        
        // Carregar informações dos serviços
        const services = await Promise.all(
            STATE.miniai.requiredServices.map(async serviceId => {
                try {
                    // Carregar configuração do serviço
                    const config = await oauthLoader.loadConfig(serviceId);
                    
                    // Verificar status de autenticação
                    const isConnected = oauthLoader.isAuthenticated(serviceId);
                    
                    // Adicionar à lista de serviços conectados
                    if (isConnected) {
                        STATE.connectedServices.push(serviceId);
                    }
                    
                    return {
                        id: serviceId,
                        name: config.name || serviceId,
                        description: config.description || '',
                        icon: config.icon || '/miniaihub/assets/img/default-service.png',
                        isConnected
                    };
                } catch (error) {
                    console.error(`Erro ao carregar serviço ${serviceId}:`, error);
                    return {
                        id: serviceId,
                        name: serviceId,
                        description: 'Informações indisponíveis',
                        icon: '/miniaihub/assets/img/default-service.png',
                        isConnected: false,
                        error: true
                    };
                }
            })
        );
        
        // Atualizar estado
        STATE.services = services;
        
        // Renderizar serviços na sidebar
        renderRequiredServices();
        
        // Atualizar estado do botão de instalação
        updateInstallButton();
        
        return services;
    } catch (error) {
        console.error('Erro ao carregar serviços necessários:', error);
        toastManager.error('Erro ao carregar serviços necessários');
        return [];
    }
}

/**
 * Renderiza os serviços necessários na sidebar
 */
function renderRequiredServices() {
    const container = document.querySelector('.required-services');
    if (!container) return;
    
    // Limpar container
    container.innerHTML = '';
    
    // Renderizar cada serviço
    STATE.services.forEach(service => {
        const serviceElement = document.createElement('div');
        serviceElement.className = `required-service${service.isConnected ? ' connected' : ''}`;
        serviceElement.dataset.serviceId = service.id;
        
        serviceElement.innerHTML = `
            <div class="required-service-icon">
                <img src="${service.icon}" alt="${service.name}">
            </div>
            <div class="required-service-info">
                <div class="required-service-name">${service.name}</div>
                <div class="required-service-status">
                    ${service.isConnected ? 'Conectado' : 'Não conectado'}
                </div>
            </div>
            <div class="required-service-action">
                ${service.isConnected ? 
                    '<button class="btn btn-sm" disabled>✓</button>' : 
                    '<button class="btn btn-sm btn-primary connect-service-btn">Conectar</button>'}
            </div>
        `;
        
        // Adicionar evento de conexão
        const connectBtn = serviceElement.querySelector('.connect-service-btn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                connectService(service.id);
            });
        }
        
        container.appendChild(serviceElement);
    });
}

/**
 * Atualiza o estado do botão de instalação
 */
function updateInstallButton() {
    const installButton = document.getElementById('install-button');
    if (!installButton) return;
    
    // Verificar se todos os serviços estão conectados
    const allConnected = STATE.miniai.requiredServices.every(
        serviceId => STATE.connectedServices.includes(serviceId)
    );
    
    if (allConnected) {
        installButton.disabled = false;
        installButton.textContent = 'Instalar gratuitamente';
    } else {
        installButton.disabled = true;
        installButton.textContent = 'Conecte os serviços para instalar';
    }
}

/**
 * Configura o botão de instalação
 */
function setupInstallButton() {
    const installButton = document.getElementById('install-button');
    if (!installButton) return;
    
    installButton.addEventListener('click', () => {
        if (STATE.installation.complete) {
            // Se já instalou, redirecionar para dashboard
            window.location.href = '/miniaihub/dashboard.html';
            return;
        }
        
        // Verificar se está logado
        if (!checkUserAuthentication()) {
            return;
        }
        
        // Verificar se todos os serviços estão conectados
        const allConnected = STATE.miniai.requiredServices.every(
            serviceId => STATE.connectedServices.includes(serviceId)
        );
        
        if (!allConnected) {
            toastManager.warning('Conecte todos os serviços necessários antes de instalar');
            return;
        }
        
        // Abrir modal de instalação
        openInstallationModal();
    });
}

/**
 * Inicializa as abas da página
 */
function initTabs() {
    const tabs = document.querySelectorAll('.conector-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover classe ativa de todas as abas
            tabs.forEach(t => t.classList.remove('active'));
            
            // Adicionar classe ativa à aba clicada
            tab.classList.add('active');
            
            // Obter ID da aba
            const tabId = tab.dataset.tab;
            
            // Esconder todos os conteúdos
            document.querySelectorAll('.conector-tab-content').forEach(
                content => content.classList.remove('active')
            );
            
            // Mostrar conteúdo da aba selecionada
            document.getElementById(`${tabId}-content`).classList.add('active');
            
            // Log de mudança de aba
            trackEvent('Tab Change', { 
                tab: tabId, 
                miniaiId: STATE.miniai.id 
            });
        });
    });
}

/**
 * Inicia o processo de conexão de um serviço
 * @param {string} serviceId - ID do serviço a ser conectado
 */
async function connectService(serviceId) {
    try {
        // Verificar se usuário está logado
        if (!checkUserAuthentication()) {
            return;
        }
        
        // Verificar se o email do usuário está disponível
        const userEmail = localStorage.getItem('miniai_user_email');
        if (!userEmail) {
            console.warn('Email do usuário não encontrado. Autenticação pode não ser associada corretamente.');
            toastManager.warning('Recomendamos fazer login novamente para garantir a correta associação da sua conta.');
        }
        
        // Desabilitar botão durante a conexão
        const serviceElements = document.querySelectorAll(`[data-service-id="${serviceId}"]`);
        serviceElements.forEach(el => {
            const btn = el.querySelector('.connect-service-btn');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<span class="loading-spinner sm"></span> Conectando...';
            }
        });
        
        // Iniciar fluxo OAuth2
        const success = await oauthLoader.startOAuth2Flow(serviceId);
        
        if (success) {
            // Atualizar estado de serviços conectados
            if (!STATE.connectedServices.includes(serviceId)) {
                STATE.connectedServices.push(serviceId);
            }
            
            // Atualizar UI
            serviceElements.forEach(el => {
                el.classList.add('connected');
                el.querySelector('.required-service-info').innerHTML = `
                    <div class="required-service-name">${serviceId}</div>
                    <div class="required-service-status">Conectado</div>
                `;
                el.querySelector('.required-service-action').innerHTML = `
                    <button class="btn btn-sm" disabled>✓</button>
                `;
            });
            
            // Mostrar toast de sucesso
            toastManager.success(`${serviceId} conectado com sucesso`);
            
            // Atualizar botão de instalação
            updateInstallButton();
            
            // Log de conexão bem-sucedida
            trackEvent('Service Connected', { 
                serviceId, 
                miniaiId: STATE.miniai.id,
                userEmail
            });
            
            // Atualizar serviços no modal
            updateModalServices();
            
            return true;
        } else {
            // Reativar botão
            serviceElements.forEach(el => {
                const btn = el.querySelector('.connect-service-btn');
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Conectar';
                }
            });
            
            // Mostrar toast de erro
            toastManager.error(`Erro ao conectar ${serviceId}`);
            
            // Log de erro
            trackEvent('Service Connection Failed', { 
                serviceId, 
                miniaiId: STATE.miniai.id,
                userEmail
            });
            
            return false;
        }
    } catch (error) {
        console.error(`Erro ao conectar serviço ${serviceId}:`, error);
        toastManager.error(`Erro ao conectar ${serviceId}: ${error.message}`);
        
        // Reativar botões
        const serviceElements = document.querySelectorAll(`[data-service-id="${serviceId}"]`);
        serviceElements.forEach(el => {
            const btn = el.querySelector('.connect-service-btn');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Conectar';
            }
        });
        
        return false;
    }
}

/**
 * Configura o modal de instalação
 */
function setupInstallationModal() {
    const modal = document.getElementById('installation-modal');
    if (!modal) return;
    
    // Fechar modal ao clicar no backdrop
    const backdrop = modal.querySelector('.modal-backdrop');
    backdrop.addEventListener('click', closeInstallationModal);
    
    // Fechar modal ao clicar no botão de fechar
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', closeInstallationModal);
    
    // Adicionar eventos para todos os botões
    const buttons = modal.querySelectorAll('[data-action]');
    buttons.forEach(button => {
        const action = button.dataset.action;
        
        switch (action) {
            case 'cancel':
                button.addEventListener('click', closeInstallationModal);
                break;
            case 'prev-step':
                button.addEventListener('click', goToPreviousStep);
                break;
            case 'next-step':
                button.addEventListener('click', goToNextStep);
                break;
            case 'install':
                button.addEventListener('click', installMiniIA);
                break;
        }
    });
}

/**
 * Abre o modal de instalação
 */
function openInstallationModal() {
    const modal = document.getElementById('installation-modal');
    if (!modal) return;
    
    // Mostrar modal
    modal.classList.add('active');
    
    // Configurar conteúdo inicial
    goToStep('services');
    
    // Log de abertura
    trackEvent('Installation Modal Opened', { 
        miniaiId: STATE.miniai.id, 
        userEmail: localStorage.getItem('miniai_user_email')
    });
}

/**
 * Fecha o modal de instalação
 */
function closeInstallationModal() {
    const modal = document.getElementById('installation-modal');
    if (!modal) return;
    
    // Esconder modal
    modal.classList.remove('active');
    
    // Log de fechamento
    trackEvent('Installation Modal Closed', { 
        miniaiId: STATE.miniai.id, 
        step: STATE.currentStep
    });
}

/**
 * Atualiza os serviços no modal
 */
function updateModalServices() {
    const servicesList = document.querySelector('.installation-step[data-step="services"] .services-list');
    if (!servicesList) return;
    
    // Limpar lista
    servicesList.innerHTML = '';
    
    // Adicionar cada serviço
    STATE.services.forEach(service => {
        const serviceElement = document.createElement('div');
        serviceElement.className = `service-item${service.isConnected ? ' connected' : ''}`;
        serviceElement.dataset.serviceId = service.id;
        
        serviceElement.innerHTML = `
            <div class="service-icon">
                <img src="${service.icon}" alt="${service.name}">
            </div>
            <div class="service-info">
                <div class="service-name">${service.name}</div>
                <div class="service-description">
                    ${service.description || 'Necessário para a funcionalidade da Mini-IA'}
                </div>
            </div>
            <div class="service-action">
                ${service.isConnected ? 
                    '<span class="service-status">✓ Conectado</span>' : 
                    '<button class="btn btn-sm btn-primary connect-service-btn">Conectar</button>'}
            </div>
        `;
        
        // Adicionar evento de conexão
        const connectBtn = serviceElement.querySelector('.connect-service-btn');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                connectService(service.id);
            });
        }
        
        servicesList.appendChild(serviceElement);
    });
    
    // Atualizar botão de continuar
    const continueBtn = document.querySelector('.installation-step[data-step="services"] [data-action="next-step"]');
    if (continueBtn) {
        // Verificar se todos os serviços estão conectados
        const allConnected = STATE.miniai.requiredServices.every(
            serviceId => STATE.connectedServices.includes(serviceId)
        );
        
        continueBtn.disabled = !allConnected;
    }
}

/**
 * Navega para um passo específico
 * @param {string} step - Passo para navegar
 */
function goToStep(step) {
    // Validar passo
    const steps = ['services', 'settings', 'confirm', 'success'];
    if (!steps.includes(step)) {
        console.error(`Passo inválido: ${step}`);
        return;
    }
    
    // Atualizar estado
    STATE.currentStep = step;
    
    // Esconder todos os passos
    document.querySelectorAll('.installation-step').forEach(
        el => el.classList.remove('active')
    );
    
    // Mostrar passo atual
    document.querySelector(`.installation-step[data-step="${step}"]`).classList.add('active');
    
    // Ações específicas por passo
    switch (step) {
        case 'services':
            updateModalServices();
            break;
        case 'settings':
            renderSettingsForm();
            break;
        case 'confirm':
            renderConfirmationDetails();
            break;
    }
    
    // Log de mudança de passo
    trackEvent('Installation Step Change', { 
        step, 
        miniaiId: STATE.miniai.id 
    });
}

/**
 * Navega para o próximo passo
 */
function goToNextStep() {
    const steps = ['services', 'settings', 'confirm', 'success'];
    const currentIndex = steps.indexOf(STATE.currentStep);
    
    if (currentIndex < steps.length - 1) {
        goToStep(steps[currentIndex + 1]);
    }
}

/**
 * Navega para o passo anterior
 */
function goToPreviousStep() {
    const steps = ['services', 'settings', 'confirm', 'success'];
    const currentIndex = steps.indexOf(STATE.currentStep);
    
    if (currentIndex > 0) {
        goToStep(steps[currentIndex - 1]);
    }
}

/**
 * Renderiza o formulário de configurações
 */
function renderSettingsForm() {
    const settingsForm = document.querySelector('.installation-step[data-step="settings"] .settings-form');
    if (!settingsForm) return;
    
    // Limpar formulário
    settingsForm.innerHTML = '';
    
    // Verificar se há configurações
    if (!STATE.miniai.settings || Object.keys(STATE.miniai.settings).length === 0) {
        settingsForm.innerHTML = `
            <p>Esta Mini-IA não possui configurações adicionais.</p>
        `;
        return;
    }
    
    // Renderizar cada configuração
    Object.entries(STATE.miniai.settings).forEach(([key, setting]) => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        // Construir campo baseado no tipo
        let fieldHtml = '';
        const value = STATE.settings[key] || setting.default || '';
        
        switch (setting.type) {
            case 'text':
            case 'email':
            case 'number':
            case 'url':
                fieldHtml = `
                    <input type="${setting.type}" 
                           id="setting-${key}" 
                           name="${key}" 
                           class="form-control" 
                           value="${value}"
                           ${setting.required ? 'required' : ''}>
                `;
                break;
            case 'textarea':
                fieldHtml = `
                    <textarea id="setting-${key}" 
                              name="${key}" 
                              class="form-control" 
                              ${setting.required ? 'required' : ''}>${value}</textarea>
                `;
                break;
            case 'select':
                fieldHtml = `
                    <select id="setting-${key}" 
                            name="${key}" 
                            class="form-select" 
                            ${setting.required ? 'required' : ''}>
                        ${setting.options.map(option => `
                            <option value="${option.value}" ${option.value === value ? 'selected' : ''}>
                                ${option.label}
                            </option>
                        `).join('')}
                    </select>
                `;
                break;
            case 'checkbox':
                fieldHtml = `
                    <label class="form-check">
                        <input type="checkbox" 
                               id="setting-${key}" 
                               name="${key}" 
                               ${value ? 'checked' : ''}>
                        ${setting.label || key}
                    </label>
                `;
                break;
        }
        
        // Adicionar label (exceto para checkbox que já tem)
        if (setting.type !== 'checkbox') {
            formGroup.innerHTML = `
                <label for="setting-${key}">${setting.label || key}</label>
                ${fieldHtml}
                ${setting.help ? `<div class="form-text">${setting.help}</div>` : ''}
            `;
        } else {
            formGroup.innerHTML = fieldHtml;
        }
        
        // Adicionar ao formulário
        settingsForm.appendChild(formGroup);
        
        // Adicionar evento de change
        const input = formGroup.querySelector(`#setting-${key}`);
        if (input) {
            input.addEventListener('change', () => {
                if (input.type === 'checkbox') {
                    STATE.settings[key] = input.checked;
                } else {
                    STATE.settings[key] = input.value;
                }
            });
        }
    });
}

/**
 * Renderiza os detalhes de confirmação
 */
function renderConfirmationDetails() {
    const confirmationDetails = document.querySelector('.installation-step[data-step="confirm"] .confirmation-details');
    if (!confirmationDetails) return;
    
    // Construir HTML
    let html = '';
    
    // Seção de serviços
    html += `
        <div class="confirmation-section">
            <h4>Serviços conectados</h4>
            <ul class="confirmation-list">
                ${STATE.services.map(service => `
                    <li>
                        <span class="confirmation-list-label">${service.name}</span>
                        <span>${service.isConnected ? '✓ Conectado' : '❌ Não conectado'}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    
    // Seção de configurações (se houver)
    if (Object.keys(STATE.settings).length > 0) {
        html += `
            <div class="confirmation-section">
                <h4>Configurações</h4>
                <ul class="confirmation-list">
                    ${Object.entries(STATE.miniai.settings || {}).map(([key, setting]) => {
                        const value = STATE.settings[key];
                        let displayValue = value;
                        
                        // Formatar valor para exibição
                        if (setting.type === 'checkbox') {
                            displayValue = value ? 'Sim' : 'Não';
                        } else if (setting.type === 'select') {
                            const option = setting.options.find(o => o.value === value);
                            displayValue = option ? option.label : value;
                        } else if (setting.type === 'password') {
                            displayValue = '••••••••';
                        }
                        
                        return `
                            <li>
                                <span class="confirmation-list-label">${setting.label || key}</span>
                                <span>${displayValue || '(Não configurado)'}</span>
                            </li>
                        `;
                    }).join('')}
                </ul>
            </div>
        `;
    }
    
    // Seção de preço
    html += `
        <div class="confirmation-section">
            <h4>Detalhes de preço</h4>
            <ul class="confirmation-list">
                <li>
                    <span class="confirmation-list-label">Plano</span>
                    <span>Gratuito</span>
                </li>
                <li>
                    <span class="confirmation-list-label">Valor</span>
                    <span>R$ 0,00</span>
                </li>
            </ul>
        </div>
    `;
    
    // Atualizar conteúdo
    confirmationDetails.innerHTML = html;
}

/**
 * Instala a Mini-IA
 */
async function installMiniIA() {
    try {
        // Atualizar estado
        STATE.installation.inProgress = true;
        
        // Atualizar botão
        const installBtn = document.querySelector('.installation-step[data-step="confirm"] [data-action="install"]');
        if (installBtn) {
            installBtn.disabled = true;
            installBtn.innerHTML = `
                <span class="loading-spinner sm"></span>
                Instalando...
            `;
        }
        
        // Preparar dados da instalação
        const installationData = {
            miniaiId: STATE.miniai.id,
            userEmail: localStorage.getItem('miniai_user_email'),
            services: STATE.connectedServices,
            settings: STATE.settings
        };
        
        // Simular instalação (em produção, seria uma requisição real)
        // Em um projeto real, você enviaria os dados para o servidor
        await simulateInstallation(installationData);
        
        // Atualizar estado
        STATE.installation.inProgress = false;
        STATE.installation.complete = true;
        
        // Ir para passo de sucesso
        goToStep('success');
        
        // Atualizar botão principal
        const mainInstallBtn = document.getElementById('install-button');
        if (mainInstallBtn) {
            mainInstallBtn.textContent = 'Ir para o Dashboard';
            mainInstallBtn.disabled = false;
        }
        
        // Log de instalação bem-sucedida
        trackEvent('Mini-IA Installed', installationData);
        
        return true;
    } catch (error) {
        console.error('Erro ao instalar Mini-IA:', error);
        
        // Atualizar estado
        STATE.installation.inProgress = false;
        STATE.installation.error = error.message;
        
        // Reativar botão
        const installBtn = document.querySelector('.installation-step[data-step="confirm"] [data-action="install"]');
        if (installBtn) {
            installBtn.disabled = false;
            installBtn.textContent = 'Tentar novamente';
        }
        
        // Mostrar toast de erro
        toastManager.error(`Erro ao instalar: ${error.message}`);
        
        // Log de erro
        trackEvent('Installation Error', { 
            miniaiId: STATE.miniai.id, 
            error: error.message 
        });
        
        return false;
    }
}

/**
 * Simula instalação da Mini-IA (para desenvolvimento)
 */
function simulateInstallation(data) {
    return new Promise((resolve) => {
        // Simular tempo de processamento
        setTimeout(() => {
            // Salvar dados de instalação no localStorage
            const installedMiniais = JSON.parse(localStorage.getItem('miniai_installed') || '[]');
            
            // Verificar se já está instalado
            const alreadyInstalled = installedMiniais.some(item => item.id === data.miniaiId);
            
            if (!alreadyInstalled) {
                installedMiniais.push({
                    id: data.miniaiId,
                    installedAt: new Date().toISOString(),
                    services: data.services,
                    settings: data.settings
                });
                
                localStorage.setItem('miniai_installed', JSON.stringify(installedMiniais));
            }
            
            resolve(true);
        }, 2000);
    });
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

// Exportar funções para uso global
window.conectorManager = {
    connectService,
    installMiniIA
};

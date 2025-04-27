/**
 * Carregador universal de configurações OAuth2
 * Totalmente dinâmico para qualquer serviço
 */
class OAuthLoader {
  constructor() {
    this.configs = {};
    this.baseUrl = './'; // Pasta atual onde estão os arquivos JSON
    this.localStorageTokenKey = 'miniai_oauth_tokens';
    this.localStorageTokenPrefix = 'miniai_token_';
    console.log('OAuthLoader inicializado - Buscando configurações em:', this.baseUrl);
  }

  /**
   * Carrega um arquivo de configuração de autenticação
   * @param {string} serviceId - ID do serviço 
   */
  async loadConfig(serviceId) {
    if (this.configs[serviceId]) {
      return this.configs[serviceId];
    }

    try {
      console.log(`Carregando configuração: ${this.baseUrl}${serviceId}.json`);
      const response = await fetch(`${this.baseUrl}${serviceId}.json`, {
        headers: { 'Cache-Control': 'no-cache' },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        console.error(`Erro HTTP: ${response.status} ao carregar ${serviceId}.json`);
        throw new Error(`Erro ao carregar configuração: ${response.status}`);
      }
      
      const config = await response.json();
      this.configs[serviceId] = config;
      return config;
    } catch (error) {
      console.error(`Falha ao carregar configuração para ${serviceId}:`, error);
      document.dispatchEvent(new CustomEvent('oauth-error', { 
        detail: { serviceId, error: error.message } 
      }));
      throw error;
    }
  }

  /**
   * Inicia o fluxo OAuth2 para qualquer serviço
   */
  async startOAuth2Flow(serviceId) {
    try {
      const config = await this.loadConfig(serviceId);
      const state = this.generateState();
      
      localStorage.setItem('oauth2_state', state);
      localStorage.setItem('oauth2_service_id', serviceId);
      
      // Construir URL de autorização genérica
      const authUrl = new URL(config.auth.authUrl);
      authUrl.searchParams.append('client_id', config.auth.clientId);
      authUrl.searchParams.append('redirect_uri', config.auth.redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      
      // Escopos - funciona com qualquer serviço
      const scopes = config.auth.scopes.join(' ');
      authUrl.searchParams.append('scope', scopes);
      authUrl.searchParams.append('state', state);
      
      // Parâmetros adicionais - flexível para qualquer serviço
      if (config.auth.additionalParams) {
        Object.entries(config.auth.additionalParams).forEach(([key, value]) => {
          authUrl.searchParams.append(key, value);
        });
      }

      console.log('URL de autorização:', authUrl.toString());
      
      // Abrir janela de autorização
      const authWindow = window.open(authUrl.toString(), 'oauth2-auth', 'width=600,height=700');
      
      if (!authWindow) {
        throw new Error('Popup bloqueado pelo navegador. Permita popups para este site.');
      }
      
      // Verificar quando a janela for fechada
      return new Promise((resolve) => {
        const checkWindowClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkWindowClosed);
            const code = localStorage.getItem('oauth2_code');
            const returnedState = localStorage.getItem('oauth2_returned_state');
            
            if (code && returnedState === state) {
              this.exchangeCodeForToken(code, config)
                .then(() => {
                  document.dispatchEvent(new CustomEvent('oauth-success', { 
                    detail: { serviceId } 
                  }));
                  resolve(true);
                })
                .catch((err) => {
                  document.dispatchEvent(new CustomEvent('oauth-error', { 
                    detail: { serviceId, error: err.message } 
                  }));
                  resolve(false);
                });
            } else {
              document.dispatchEvent(new CustomEvent('oauth-canceled', { 
                detail: { serviceId } 
              }));
              resolve(false);
            }
          }
        }, 500);
      });
    } catch (error) {
      console.error(`Erro ao iniciar fluxo OAuth2 para ${serviceId}:`, error);
      document.dispatchEvent(new CustomEvent('oauth-error', { 
        detail: { serviceId, error: error.message } 
      }));
      return false;
    }
  }

  /**
   * Troca o código por token - genérico para qualquer serviço
   */
  async exchangeCodeForToken(code, config) {
    try {
      const response = await fetch(config.auth.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code,
          redirect_uri: config.auth.redirectUri,
          client_id: config.auth.clientId,
          service_id: config.id
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.tokens) {
        this.saveTokensToStorage(config.id, data.tokens);
        return data.tokens;
      } else {
        throw new Error('Falha ao obter tokens: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao trocar código por token:', error);
      throw error;
    } finally {
      localStorage.removeItem('oauth2_code');
      localStorage.removeItem('oauth2_state');
      localStorage.removeItem('oauth2_returned_state');
      localStorage.removeItem('oauth2_service_id');
    }
  }

  /**
   * Gera string aleatória para proteção CSRF
   */
  generateState() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
  }

  /**
   * Salva tokens no localStorage
   */
  saveTokensToStorage(serviceId, tokens) {
    try {
      // Salvar tokens individuais
      localStorage.setItem(`${this.localStorageTokenPrefix}${serviceId}`, JSON.stringify({
        ...tokens,
        timestamp: Date.now()
      }));
      
      // Manter registro de serviços autenticados
      const authenticatedServices = JSON.parse(localStorage.getItem('miniai_authenticated_services') || '[]');
      if (!authenticatedServices.includes(serviceId)) {
        authenticatedServices.push(serviceId);
        localStorage.setItem('miniai_authenticated_services', JSON.stringify(authenticatedServices));
      }
    } catch (error) {
      console.error('Erro ao salvar tokens no localStorage:', error);
    }
  }

  /**
   * Verifica se um serviço está autenticado
   */
  isAuthenticated(serviceId) {
    try {
      const tokenData = localStorage.getItem(`${this.localStorageTokenPrefix}${serviceId}`);
      return !!tokenData;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  /**
   * Obtém lista de serviços disponíveis
   */
  async getAvailableServices() {
    try {
      console.log(`Carregando serviços de: ${this.baseUrl}index.json`);
      const response = await fetch(`${this.baseUrl}index.json`, {
        headers: { 'Cache-Control': 'no-cache' },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar serviços: ${response.status}`);
      }
      
      const services = await response.json();
      console.log('Serviços carregados:', services.length);
      return services;
    } catch (error) {
      console.error('Falha ao carregar lista de serviços:', error);
      document.dispatchEvent(new CustomEvent('services-load-error', { 
        detail: { error: error.message } 
      }));
      
      // Retornar uma lista padrão de serviços em caso de erro
      return [
        { id: 'google-sheets', name: 'Google Sheets', icon: 'https://www.gstatic.com/images/branding/product/1x/sheets_48dp.png', description: 'Planilhas online' },
        { id: 'gmail', name: 'Gmail', icon: 'https://www.gstatic.com/images/branding/product/1x/gmail_48dp.png', description: 'Serviço de e-mail' },
        { id: 'google-drive', name: 'Google Drive', icon: 'https://www.gstatic.com/images/branding/product/1x/drive_48dp.png', description: 'Armazenamento em nuvem' },
        { id: 'google-calendar', name: 'Google Calendar', icon: 'https://www.gstatic.com/images/branding/product/1x/calendar_48dp.png', description: 'Agenda online' },
        { id: 'google-docs', name: 'Google Docs', icon: 'https://www.gstatic.com/images/branding/product/1x/docs_48dp.png', description: 'Editor de documentos' }
      ];
    }
  }
  
  /**
   * Obtém serviços já autenticados
   */
  getAuthenticatedServices() {
    try {
      return JSON.parse(localStorage.getItem('miniai_authenticated_services') || '[]');
    } catch (error) {
      console.error('Erro ao obter serviços autenticados:', error);
      return [];
    }
  }
  
  /**
   * Revoga autorização de um serviço
   */
  revokeAuthorization(serviceId) {
    try {
      // Remover token
      localStorage.removeItem(`${this.localStorageTokenPrefix}${serviceId}`);
      
      // Atualizar lista de serviços autenticados
      const authenticatedServices = JSON.parse(localStorage.getItem('miniai_authenticated_services') || '[]');
      const updatedServices = authenticatedServices.filter(id => id !== serviceId);
      localStorage.setItem('miniai_authenticated_services', JSON.stringify(updatedServices));
      
      return true;
    } catch (error) {
      console.error('Erro ao revogar autorização:', error);
      return false;
    }
  }
}

// Exportar instância singleton
const oauthLoader = new OAuthLoader();

// Ouvir eventos do callback OAuth2
window.addEventListener('message', function(event) {
  // Verificar origem da mensagem
  if (event.data && event.data.type === 'oauth2-callback') {
    localStorage.setItem('oauth2_code', event.data.code);
    localStorage.setItem('oauth2_returned_state', event.data.state);
    console.log('Callback OAuth2 recebido', event.data);
  }
});

// Avisar que o script foi carregado
document.dispatchEvent(new CustomEvent('oauth-loader-ready'));

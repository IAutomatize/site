/**
 * oauth-loader.js - Sistema de autenticação OAuth2 para o MiniIA Hub
 * Versão 2.0 - Inclui identificação de usuário no state
 */
class OAuthLoader {
  constructor() {
    this.configs = {};
    this.baseUrl = window.location.origin + '/miniaihub/conectores/';
    this.localStorageTokenPrefix = 'miniai_token_';
    this.localStorageUserKey = 'miniai_user_email';
    console.log('OAuthLoader inicializado em:', this.baseUrl);
  }

  /**
   * Armazena o email do usuário para uso no fluxo OAuth2
   * @param {string} email - Email do usuário 
   */
  setUserEmail(email) {
    if (email && typeof email === 'string') {
      localStorage.setItem(this.localStorageUserKey, email);
      console.log('Email do usuário armazenado para autenticações:', email);
      return true;
    }
    return false;
  }

  /**
   * Recupera o email do usuário armazenado
   * @returns {string|null} Email do usuário ou null
   */
  getUserEmail() {
    return localStorage.getItem(this.localStorageUserKey);
  }

  /**
   * Carrega configuração de autenticação para um serviço
   * @param {string} serviceId - ID do serviço
   */
  async loadConfig(serviceId) {
    if (this.configs[serviceId]) {
      return this.configs[serviceId];
    }
    
    try {
      console.log(`Carregando configuração: ${this.baseUrl}${serviceId}.json`);
      
      // Implementar retry com exponential backoff
      let attempts = 0;
      const maxAttempts = 2;
      let delay = 1000; // 1 segundo inicialmente
      
      while (attempts <= maxAttempts) {
        try {
          const response = await fetch(`${this.baseUrl}${serviceId}.json`, {
            headers: { 'Cache-Control': 'no-cache' },
            cache: 'no-store'
          });
          
          if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
          }
          
          const config = await response.json();
          this.configs[serviceId] = config;
          
          // Rastrear evento de sucesso
          this.trackEvent('Config Loaded', { serviceId });
          
          return config;
        } catch (error) {
          attempts++;
          if (attempts <= maxAttempts) {
            console.warn(`Tentativa ${attempts} falhou, aguardando ${delay}ms antes de tentar novamente`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          } else {
            throw error; // Relançar o erro após todas as tentativas
          }
        }
      }
    } catch (error) {
      console.error(`Falha ao carregar configuração de ${serviceId}:`, error);
      document.dispatchEvent(new CustomEvent('oauth-error', {
        detail: { serviceId, error: error.message }
      }));
      this.trackEvent('Config Error', { serviceId, error: error.message });
      throw error;
    }
  }

  /**
   * Inicia o fluxo OAuth2 incluindo email no state
   * @param {string} serviceId - ID do serviço para autenticar
   */
  async startOAuth2Flow(serviceId) {
    try {
      const config = await this.loadConfig(serviceId);
      
      // Recuperar email do usuário
      const userEmail = this.getUserEmail();
      if (!userEmail) {
        console.warn('Email do usuário não encontrado. Autenticação pode não ser associada corretamente.');
      }
      
      // Gerar state com identificação do usuário
      const randomState = this.generateRandomState();
      const state = userEmail 
        ? `${encodeURIComponent(userEmail)}:${randomState}` 
        : randomState;
      
      // Armazenar state e serviceId para callback
      localStorage.setItem('oauth2_state', state);
      localStorage.setItem('oauth2_service_id', serviceId);
      
      // Montar URL de autorização
      const authUrl = new URL(config.auth.authUrl);
      authUrl.searchParams.append('client_id', config.auth.clientId);
      authUrl.searchParams.append('redirect_uri', config.auth.redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', config.auth.scopes.join(' '));
      authUrl.searchParams.append('state', state);
      
      // Parâmetros adicionais (ex: offline, prompt)
      if (config.auth.additionalParams) {
        for (const [key, val] of Object.entries(config.auth.additionalParams)) {
          authUrl.searchParams.append(key, val);
        }
      }
      
      console.log('URL de autorização:', authUrl.toString());
      this.trackEvent('OAuth Started', { serviceId, hasUserEmail: !!userEmail });
      
      // Abrir popup de autorização
      const authWindow = window.open(authUrl.toString(), 'oauth2-auth', 'width=600,height=700');
      if (!authWindow) {
        throw new Error('Popup bloqueado. Permita popups para continuar.');
      }

      // Aguardar fechamento
      return new Promise(resolve => {
        const timer = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(timer);
            const code = localStorage.getItem('oauth2_code');
            const returnedState = localStorage.getItem('oauth2_returned_state');
            
            if (code && returnedState === state) {
              this.exchangeCodeForToken(code, config)
                .then(() => {
                  document.dispatchEvent(new CustomEvent('oauth-success', { 
                    detail: { serviceId, userEmail } 
                  }));
                  this.trackEvent('OAuth Success', { serviceId, userEmail });
                  resolve(true);
                })
                .catch(err => {
                  document.dispatchEvent(new CustomEvent('oauth-error', { 
                    detail: { serviceId, error: err.message } 
                  }));
                  this.trackEvent('OAuth Error', { 
                    serviceId, error: err.message 
                  });
                  resolve(false);
                });
            } else {
              document.dispatchEvent(new CustomEvent('oauth-canceled', { 
                detail: { serviceId } 
              }));
              this.trackEvent('OAuth Canceled', { serviceId });
              resolve(false);
            }
          }
        }, 500);
      });
    } catch (error) {
      console.error(`Erro no fluxo OAuth2 de ${serviceId}:`, error);
      document.dispatchEvent(new CustomEvent('oauth-error', { 
        detail: { serviceId, error: error.message } 
      }));
      this.trackEvent('OAuth Error', { serviceId, error: error.message });
      return false;
    }
  }

  /**
   * Troca o authorization code por tokens
   * @param {string} code - Código de autorização
   * @param {object} config - Configuração do serviço
   */
  async exchangeCodeForToken(code, config) {
    try {
      const userEmail = this.getUserEmail();
      
      const resp = await fetch(config.auth.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          redirect_uri: config.auth.redirectUri,
          client_id: config.auth.clientId,
          user_email: userEmail // Incluir email na request
        })
      });
      
      const data = await resp.json();
      if (!data.access_token) {
        throw new Error(data.error || 'Token inválido');
      }
      
      // Incluir email nos tokens salvos
      if (userEmail) {
        data.user_email = userEmail;
      }
      
      // Salvar tokens
      this.saveTokensToStorage(config.id, data);
      return data;
    } catch (error) {
      console.error('Erro ao trocar code por token:', error);
      throw error;
    } finally {
      localStorage.removeItem('oauth2_code');
      localStorage.removeItem('oauth2_state');
      localStorage.removeItem('oauth2_returned_state');
      localStorage.removeItem('oauth2_service_id');
    }
  }

  /**
   * Gera string aleatória para state
   */
  generateRandomState() {
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Salva tokens no localStorage com informação do usuário
   */
  saveTokensToStorage(serviceId, tokens) {
    try {
      localStorage.setItem(`${this.localStorageTokenPrefix}${serviceId}`, JSON.stringify(tokens));
      
      const list = JSON.parse(localStorage.getItem('miniai_authenticated_services') || '[]');
      if (!list.includes(serviceId)) {
        list.push(serviceId);
      }
      
      localStorage.setItem('miniai_authenticated_services', JSON.stringify(list));
      
      // Salvar mapeamento de serviço para usuário
      const userEmail = tokens.user_email || this.getUserEmail();
      if (userEmail) {
        const userServices = JSON.parse(localStorage.getItem(`miniai_user_services_${userEmail}`) || '[]');
        if (!userServices.includes(serviceId)) {
          userServices.push(serviceId);
          localStorage.setItem(`miniai_user_services_${userEmail}`, JSON.stringify(userServices));
        }
      }
    } catch (e) {
      console.error('Erro ao salvar tokens:', e);
    }
  }

  /**
   * Verifica autenticação de serviço
   */
  isAuthenticated(serviceId) {
    return !!localStorage.getItem(`${this.localStorageTokenPrefix}${serviceId}`);
  }

  /**
   * Retorna lista de serviços disponíveis 
   */
  async getAvailableServices() {
    try {
      const res = await fetch(`${this.baseUrl}index.json`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('Erro ao carregar serviços:', e);
      document.dispatchEvent(new CustomEvent('services-load-error', { 
        detail: { error: e.message } 
      }));
      return [];
    }
  }

  /**
   * Revoga autorização
   */
  revokeAuthorization(serviceId) {
    try {
      // Obter os tokens antes de remover
      const tokensJson = localStorage.getItem(`${this.localStorageTokenPrefix}${serviceId}`);
      if (tokensJson) {
        const tokens = JSON.parse(tokensJson);
        const userEmail = tokens.user_email || this.getUserEmail();
        
        // Remover o serviço da lista do usuário
        if (userEmail) {
          const userServices = JSON.parse(localStorage.getItem(`miniai_user_services_${userEmail}`) || '[]');
          const updatedServices = userServices.filter(id => id !== serviceId);
          localStorage.setItem(`miniai_user_services_${userEmail}`, JSON.stringify(updatedServices));
        }
      }
      
      // Remover os tokens
      localStorage.removeItem(`${this.localStorageTokenPrefix}${serviceId}`);
      
      // Atualizar lista de serviços autenticados
      const list = JSON.parse(localStorage.getItem('miniai_authenticated_services') || '[]')
        .filter(id => id !== serviceId);
      localStorage.setItem('miniai_authenticated_services', JSON.stringify(list));
      
      return true;
    } catch (e) {
      console.error('Erro ao revogar autorização:', e);
      return false;
    }
  }
  
  /**
   * Rastrear evento de analytics
   */
  trackEvent(eventName, eventData = {}) {
    if (typeof window.analytics !== 'undefined' && window.analytics.track) {
      window.analytics.track(eventName, eventData);
    } else {
      console.log('Evento:', eventName, eventData);
    }
  }
}

// Singleton Export
const oauthLoader = new OAuthLoader();

// Ouvir mensagem de callback do popup
window.addEventListener('message', event => {
  if (event.data?.type === 'oauth2-callback') {
    localStorage.setItem('oauth2_code', event.data.code);
    localStorage.setItem('oauth2_returned_state', event.data.state);
  }
});

// Sinalizar que está pronto
document.dispatchEvent(new CustomEvent('oauth-loader-ready'));

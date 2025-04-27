/**
 * Carregador universal de configurações OAuth2
 * Totalmente dinâmico para qualquer serviço
 */
class OAuthLoader {
  constructor() {
    this.configs = {};
    // Usar mesma origem e pasta 'conectores' relativa ao HTML
    this.baseUrl = window.location.origin + '/miniaihub/conectores/';
    this.localStorageTokenPrefix = 'miniai_token_';
    console.log('OAuthLoader inicializado em:', this.baseUrl);
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
        throw new Error(`Erro HTTP ${response.status} ao carregar ${serviceId}.json`);
      }
      const config = await response.json();
      this.configs[serviceId] = config;
      return config;
    } catch (error) {
      console.error(`Falha ao carregar configuração de ${serviceId}:`, error);
      document.dispatchEvent(new CustomEvent('oauth-error', {
        detail: { serviceId, error: error.message }
      }));
      throw error;
    }
  }

  /**
   * Inicia o fluxo OAuth2 genérico
   * @param {string} serviceId
   */
  async startOAuth2Flow(serviceId) {
    try {
      const config = await this.loadConfig(serviceId);
      const state = this.generateState();
      // Store state and serviceId for callback
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
      
      // Abrir popup de autorização
      const authWindow = window.open(authUrl.toString(), 'oauth2-auth', 'width=600,height=700');
      if (!authWindow) throw new Error('Popup bloqueado. Permita popups.');

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
                  document.dispatchEvent(new CustomEvent('oauth-success', { detail: { serviceId } }));
                  resolve(true);
                })
                .catch(err => {
                  document.dispatchEvent(new CustomEvent('oauth-error', { detail: { serviceId, error: err.message } }));
                  resolve(false);
                });
            } else {
              document.dispatchEvent(new CustomEvent('oauth-canceled', { detail: { serviceId } }));
              resolve(false);
            }
          }
        }, 500);
      });
    } catch (error) {
      console.error(`Erro no fluxo OAuth2 de ${serviceId}:`, error);
      document.dispatchEvent(new CustomEvent('oauth-error', { detail: { serviceId, error: error.message } }));
      return false;
    }
  }

  /**
   * Troca o authorization code por tokens
   * @param {string} code
   * @param {object} config
   */
  async exchangeCodeForToken(code, config) {
    try {
      const resp = await fetch(config.auth.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          redirect_uri: config.auth.redirectUri,
          client_id: config.auth.clientId
        })
      });
      const data = await resp.json();
      if (!data.access_token) throw new Error(data.error || 'Token inválido');
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
   * Gera state anti-CSRF
   */
  generateState() {
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Salva tokens no localStorage
   */
  saveTokensToStorage(serviceId, tokens) {
    try {
      localStorage.setItem(`${this.localStorageTokenPrefix}${serviceId}`, JSON.stringify(tokens));
      const list = JSON.parse(localStorage.getItem('miniai_authenticated_services')||'[]');
      if (!list.includes(serviceId)) list.push(serviceId);
      localStorage.setItem('miniai_authenticated_services', JSON.stringify(list));
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
   * Retorna lista de serviços disponíveis (index.json)
   */
  async getAvailableServices() {
    try {
      const res = await fetch(`${this.baseUrl}index.json`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('Erro ao carregar serviços:', e);
      document.dispatchEvent(new CustomEvent('services-load-error', { detail: { error: e.message } }));
      return [];
    }
  }

  /**
   * Revoga autorização
   */
  revokeAuthorization(serviceId) {
    try {
      localStorage.removeItem(`${this.localStorageTokenPrefix}${serviceId}`);
      const list = JSON.parse(localStorage.getItem('miniai_authenticated_services')||'[]')
        .filter(id => id!==serviceId);
      localStorage.setItem('miniai_authenticated_services', JSON.stringify(list));
      return true;
    } catch (e) {
      console.error('Erro ao revogar:', e);
      return false;
    }
  }
}

// Singleton Export
const oauthLoader = new OAuthLoader();

// Ouvir mensagem de callback do popup
window.addEventListener('message', event => {
  if (event.data?.type==='oauth2-callback') {
    localStorage.setItem('oauth2_code', event.data.code);
    localStorage.setItem('oauth2_returned_state', event.data.state);
  }
});

// Sinalizar que está pronto
document.dispatchEvent(new CustomEvent('oauth-loader-ready'));

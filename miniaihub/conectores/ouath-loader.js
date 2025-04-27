/**
 * Carregador dinâmico de configurações OAuth2
 * Este script carrega configurações de autenticação OAuth2 de arquivos JSON
 */

class OAuthLoader {
  constructor() {
    this.configs = {};
    this.baseUrl = './';
    this.localStorageTokenKey = 'miniai_oauth_tokens';
  }

  /**
   * Carrega um arquivo de configuração de autenticação
   * @param {string} serviceId - ID do serviço a ser carregado (ex: 'google-sheets')
   * @returns {Promise<Object>} - Objeto de configuração
   */
  async loadConfig(serviceId) {
    if (this.configs[serviceId]) {
      return this.configs[serviceId];
    }

    try {
      const response = await fetch(`${this.baseUrl}${serviceId}.json`);
      if (!response.ok) {
        throw new Error(`Erro ao carregar configuração: ${response.status}`);
      }
      
      const config = await response.json();
      this.configs[serviceId] = config;
      return config;
    } catch (error) {
      console.error(`Falha ao carregar configuração para ${serviceId}:`, error);
      throw error;
    }
  }

  /**
   * Inicia o fluxo OAuth2 para um serviço específico
   * @param {string} serviceId - ID do serviço 
   * @returns {Promise<boolean>} - Status de sucesso da autenticação
   */
  async startOAuth2Flow(serviceId) {
    try {
      const config = await this.loadConfig(serviceId);
      const state = this.generateState();
      
      // Armazenar o state para verificação posterior
      localStorage.setItem('oauth2_state', state);
      localStorage.setItem('oauth2_service_id', serviceId);
      
      // Construir URL de autorização
      const authUrl = new URL(config.auth.authUrl);
      authUrl.searchParams.append('client_id', config.auth.clientId);
      authUrl.searchParams.append('redirect_uri', config.auth.redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      
      // Adicionar escopos
      const scopes = config.auth.scopes.join(' ');
      authUrl.searchParams.append('scope', scopes);
      
      // Adicionar state para proteção CSRF
      authUrl.searchParams.append('state', state);
      
      // Adicionar parâmetros adicionais
      if (config.auth.additionalParams) {
        Object.entries(config.auth.additionalParams).forEach(([key, value]) => {
          authUrl.searchParams.append(key, value);
        });
      }
      
      // Abrir janela de autorização
      const authWindow = window.open(authUrl.toString(), 'oauth2-auth', 'width=600,height=600');
      
      // Verificar quando a janela for fechada
      return new Promise((resolve) => {
        const checkWindowClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkWindowClosed);
            const code = localStorage.getItem('oauth2_code');
            const returnedState = localStorage.getItem('oauth2_returned_state');
            
            if (code && returnedState === state) {
              this.exchangeCodeForToken(code, config)
                .then(() => resolve(true))
                .catch(() => resolve(false));
            } else {
              resolve(false);
            }
          }
        }, 500);
      });
    } catch (error) {
      console.error(`Erro ao iniciar fluxo OAuth2 para ${serviceId}:`, error);
      return false;
    }
  }

  /**
   * Troca o código de autorização por um token
   * @param {string} code - Código de autorização
   * @param {Object} config - Configuração OAuth2
   * @returns {Promise<Object>} - Tokens recebidos
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
        // Armazenar tokens no localStorage
        this.saveTokensToStorage(config.id, data.tokens);
        return data.tokens;
      } else {
        throw new Error('Falha ao obter tokens: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao trocar código por token:', error);
      throw error;
    } finally {
      // Limpar dados temporários do localStorage
      localStorage.removeItem('oauth2_code');
      localStorage.removeItem('oauth2_state');
      localStorage.removeItem('oauth2_returned_state');
      localStorage.removeItem('oauth2_service_id');
    }
  }

  /**
   * Gera string aleatória para proteção CSRF
   * @returns {string} - String aleatória
   */
  generateState() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
  }

  /**
   * Salva tokens no localStorage
   * @param {string} serviceId - ID do serviço
   * @param {Object} tokens - Tokens a serem salvos
   */
  saveTokensToStorage(serviceId, tokens) {
    try {
      // Obter tokens existentes ou inicializar objeto vazio
      const storedTokens = JSON.parse(localStorage.getItem(this.localStorageTokenKey) || '{}');
      
      // Adicionar/atualizar tokens para o serviço
      storedTokens[serviceId] = {
        ...tokens,
        timestamp: Date.now()
      };
      
      // Salvar tokens atualizados
      localStorage.setItem(this.localStorageTokenKey, JSON.stringify(storedTokens));
    } catch (error) {
      console.error('Erro ao salvar tokens no localStorage:', error);
    }
  }

  /**
   * Verifica se um serviço está autenticado
   * @param {string} serviceId - ID do serviço
   * @returns {boolean} - Status de autenticação
   */
  isAuthenticated(serviceId) {
    try {
      const storedTokens = JSON.parse(localStorage.getItem(this.localStorageTokenKey) || '{}');
      return !!storedTokens[serviceId]?.access_token;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  /**
   * Obtém lista de serviços Google disponíveis
   * @returns {Promise<Array>} - Lista de serviços
   */
  async getAvailableGoogleServices() {
    try {
      const response = await fetch(`${this.baseUrl}index.json`);
      if (!response.ok) {
        throw new Error(`Erro ao carregar serviços: ${response.status}`);
      }
      
      const services = await response.json();
      // Filtrar apenas serviços Google
      return services.filter(service => service.id.startsWith('google-'));
    } catch (error) {
      console.error('Falha ao carregar lista de serviços:', error);
      // Retornar lista padrão de serviços Google em caso de erro
      return [
        { id: 'google-sheets', name: 'Google Sheets' },
        { id: 'google-docs', name: 'Google Docs' },
        { id: 'google-drive', name: 'Google Drive' },
        { id: 'gmail', name: 'Gmail' },
        { id: 'google-calendar', name: 'Google Calendar' }
      ];
    }
  }
}

// Exportar instância singleton
const oauthLoader = new OAuthLoader();

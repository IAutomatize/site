/**
 * MiniIA Hub - Carregador Universal de OAuth2
 * Gerencia fluxo de autenticação para serviços conectados
 * Versão: 2.0.0
 */
class OAuthLoader {
  constructor() {
    this.configs = {};
    this.services = null;
    // Prefixo para chaves no localStorage
    this.tokenPrefix = 'miniai_token_';
    this.serviceCacheKey = 'miniai_service_cache';
    
    // O nome do arquivo que substitui index.json
    this.productFile = 'products.json';
    
    // Lista de caminhos possíveis para tentar
    this.basePaths = [
      '/miniaihub/conectores/',
      '/conectores/',
      '/../conectores/',
      '/site/miniaihub/conectores/'
    ];
    
    // Define URL base inicial
    this.baseUrl = window.location.origin + this.basePaths[0];
    
    console.log('[OAuthLoader] Inicializado');
    console.log('[OAuthLoader] URL Base inicial:', this.baseUrl);
    console.log('[OAuthLoader] Arquivo de produtos:', this.productFile);
  }

  /**
   * Carrega a lista de serviços disponíveis
   * @returns {Promise<Array>} Lista de serviços
   */
  async getAvailableServices() {
    // Tentar obter do cache primeiro
    const cachedServices = this.getCachedServices();
    if (cachedServices && cachedServices.length > 0) {
      console.log('[OAuthLoader] Serviços obtidos do cache:', cachedServices.length);
      return cachedServices;
    }
    
    let services = null;
    let error = null;
    
    // Tentar cada caminho possível
    for (const path of this.basePaths) {
      try {
        const url = window.location.origin + path + this.productFile;
        console.log(`[OAuthLoader] Tentando carregar de: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        
        services = await response.json();
        
        if (services && Array.isArray(services) && services.length > 0) {
          console.log(`[OAuthLoader] Serviços carregados com sucesso de ${url}:`, services.length);
          // Atualizar a URL base para este caminho que funcionou
          this.baseUrl = window.location.origin + path;
          // Armazenar em cache
          this.cacheServices(services);
          break;
        }
      } catch (err) {
        console.warn(`[OAuthLoader] Falha ao carregar de ${path}:`, err.message);
        error = err;
      }
    }
    
    // Se não conseguimos carregar de nenhum lugar, lançar erro
    if (!services || !Array.isArray(services) || services.length === 0) {
      console.error('[OAuthLoader] Todos os caminhos falharam.');
      throw error || new Error('Não foi possível carregar os serviços disponíveis.');
    }
    
    return services;
  }
  
  /**
   * Armazena serviços em cache
   * @param {Array} services Lista de serviços
   */
  cacheServices(services) {
    try {
      localStorage.setItem(this.serviceCacheKey, JSON.stringify({
        timestamp: Date.now(),
        services: services
      }));
    } catch (e) {
      console.warn('[OAuthLoader] Erro ao armazenar serviços em cache:', e);
    }
  }
  
  /**
   * Obtém serviços do cache
   * @returns {Array|null} Lista de serviços ou null
   */
  getCachedServices() {
    try {
      const cached = localStorage.getItem(this.serviceCacheKey);
      if (!cached) return null;
      
      const data = JSON.parse(cached);
      
      // Cache válido por 1 hora
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - data.timestamp > oneHour) {
        console.log('[OAuthLoader] Cache expirado');
        localStorage.removeItem(this.serviceCacheKey);
        return null;
      }
      
      return data.services;
    } catch (e) {
      console.warn('[OAuthLoader] Erro ao obter serviços do cache:', e);
      return null;
    }
  }

  /**
   * Carrega configuração específica de um serviço
   * @param {string} serviceId ID do serviço
   * @returns {Promise<Object>} Configuração do serviço
   */
  async loadConfig(serviceId) {
    if (this.configs[serviceId]) {
      return this.configs[serviceId];
    }
    
    try {
      const configUrl = `${this.baseUrl}${serviceId}.json`;
      console.log(`[OAuthLoader] Carregando configuração: ${configUrl}`);
      
      const response = await fetch(configUrl, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const config = await response.json();
      this.configs[serviceId] = config;
      
      console.log(`[OAuthLoader] Configuração carregada: ${serviceId}`);
      return config;
    } catch (error) {
      console.error(`[OAuthLoader] Falha ao carregar configuração de ${serviceId}:`, error);
      document.dispatchEvent(new CustomEvent('oauth-error', {
        detail: { serviceId, error: error.message }
      }));
      throw error;
    }
  }

  /**
   * Inicia o fluxo OAuth2 para um serviço
   * @param {string} serviceId ID do serviço
   * @returns {Promise<boolean>} Sucesso ou falha
   */
  async startOAuth2Flow(serviceId) {
    try {
      // Carregar config
      const config = await this.loadConfig(serviceId);
      
      // Gerar state para CSRF
      const state = this.generateState();
      
      // Guardar state e serviceId
      localStorage.setItem('oauth2_state', state);
      localStorage.setItem('oauth2_service_id', serviceId);
      
// Montar URL de autorização
      const authUrl = new URL(config.auth.authUrl);
      authUrl.searchParams.append('client_id', config.auth.clientId);
      authUrl.searchParams.append('redirect_uri', config.auth.redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', config.auth.scopes.join(' '));
      authUrl.searchParams.append('state', state);
      
      // Adicionar parâmetros extras se existirem
      if (config.auth.additionalParams) {
        for (const [key, value] of Object.entries(config.auth.additionalParams)) {
          authUrl.searchParams.append(key, value);
        }
      }
      
      console.log('[OAuthLoader] URL de autorização:', authUrl.toString());
      
      // Abrir janela de autenticação
      const authWindow = window.open(authUrl.toString(), 'oauth-window', 'width=600,height=700');
      
      if (!authWindow) {
        throw new Error('Popup bloqueado pelo navegador. Por favor, permita popups para este site.');
      }
      
      // Esperar pela conclusão do fluxo
      return new Promise((resolve) => {
        // Verificador de status
        const checkInterval = setInterval(() => {
          // Verificar se janela foi fechada
          if (authWindow.closed) {
            clearInterval(checkInterval);
            
            // Obter código e state
            const code = localStorage.getItem('oauth2_code');
            const returnedState = localStorage.getItem('oauth2_returned_state');
            
            if (code && returnedState === state) {
              // Trocar o código por token
              this.exchangeCodeForToken(serviceId, code, config)
                .then(() => {
                  document.dispatchEvent(new CustomEvent('oauth-success', { 
                    detail: { serviceId } 
                  }));
                  resolve(true);
                })
                .catch(error => {
                  console.error('[OAuthLoader] Erro ao trocar código por token:', error);
                  document.dispatchEvent(new CustomEvent('oauth-error', { 
                    detail: { serviceId, error: error.message } 
                  }));
                  resolve(false);
                });
            } else {
              // Fluxo cancelado pelo usuário
              console.warn('[OAuthLoader] Fluxo OAuth cancelado ou inválido');
              document.dispatchEvent(new CustomEvent('oauth-canceled', { 
                detail: { serviceId } 
              }));
              resolve(false);
            }
          }
        }, 500);
      });
    } catch (error) {
      console.error(`[OAuthLoader] Erro ao iniciar fluxo OAuth para ${serviceId}:`, error);
      document.dispatchEvent(new CustomEvent('oauth-error', { 
        detail: { serviceId, error: error.message } 
      }));
      return false;
    }
  }

  /**
   * Troca código de autorização por tokens
   * @param {string} serviceId ID do serviço
   * @param {string} code Código de autorização
   * @param {Object} config Configuração do serviço
   * @returns {Promise<Object>} Tokens obtidos
   */
  async exchangeCodeForToken(serviceId, code, config) {
    try {
      console.log(`[OAuthLoader] Trocando código por token para ${serviceId}`);
      
      // Montar payload
      const payload = {
        code,
        client_id: config.auth.clientId,
        redirect_uri: config.auth.redirectUri,
        grant_type: 'authorization_code'
      };
      
      // Se tiver client_secret, incluir
      if (config.auth.clientSecret) {
        payload.client_secret = config.auth.clientSecret;
      }
      
      // Fazer requisição ao endpoint de token
      const response = await fetch(config.auth.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || errorData.error || `Erro HTTP ${response.status}`);
      }
      
      // Processar resposta
      const tokenData = await response.json();
      
      if (!tokenData.access_token) {
        throw new Error('Token de acesso não encontrado na resposta');
      }
      
      // Salvar tokens
      this.saveTokens(serviceId, tokenData);
      
      console.log(`[OAuthLoader] Tokens obtidos com sucesso para ${serviceId}`);
      return tokenData;
    } catch (error) {
      console.error(`[OAuthLoader] Falha ao trocar código por token para ${serviceId}:`, error);
      throw error;
    } finally {
      // Limpar dados temporários
      localStorage.removeItem('oauth2_code');
      localStorage.removeItem('oauth2_state');
      localStorage.removeItem('oauth2_returned_state');
      localStorage.removeItem('oauth2_service_id');
    }
  }

  /**
   * Salva tokens no localStorage
   * @param {string} serviceId ID do serviço
   * @param {Object} tokenData Dados dos tokens
   */
  saveTokens(serviceId, tokenData) {
    try {
      // Adicionar timestamp para controle de expiração
      const tokenInfo = {
        ...tokenData,
        timestamp: Date.now()
      };
      
      // Salvar no localStorage
      localStorage.setItem(`${this.tokenPrefix}${serviceId}`, JSON.stringify(tokenInfo));
      
      // Atualizar lista de serviços autenticados
      const authServices = JSON.parse(localStorage.getItem('miniai_authenticated_services') || '[]');
      if (!authServices.includes(serviceId)) {
        authServices.push(serviceId);
        localStorage.setItem('miniai_authenticated_services', JSON.stringify(authServices));
      }
      
      console.log(`[OAuthLoader] Tokens salvos para ${serviceId}`);
    } catch (error) {
      console.error(`[OAuthLoader] Erro ao salvar tokens para ${serviceId}:`, error);
      throw error;
    }
  }

  /**
   * Verifica se um serviço está autenticado
   * @param {string} serviceId ID do serviço
   * @returns {boolean} Se está autenticado
   */
  isAuthenticated(serviceId) {
    try {
      const tokenData = localStorage.getItem(`${this.tokenPrefix}${serviceId}`);
      if (!tokenData) return false;
      
      // Verificar se token expirou
      const parsedToken = JSON.parse(tokenData);
      
      // Se não tiver data de expiração, considerar válido
      if (!parsedToken.expires_in) return true;
      
      // Verificar expiração (com margem de segurança de 5 minutos)
      const expiresInMs = parsedToken.expires_in * 1000;
      const expirationTime = parsedToken.timestamp + expiresInMs;
      const safetyMargin = 5 * 60 * 1000; // 5 minutos
      
      return Date.now() < (expirationTime - safetyMargin);
    } catch (error) {
      console.warn(`[OAuthLoader] Erro ao verificar autenticação para ${serviceId}:`, error);
      return false;
    }
  }

  /**
   * Revoga autenticação de um serviço
   * @param {string} serviceId ID do serviço
   * @returns {boolean} Sucesso ou falha
   */
  revokeAuthentication(serviceId) {
    try {
      // Remover token
      localStorage.removeItem(`${this.tokenPrefix}${serviceId}`);
      
      // Atualizar lista de serviços autenticados
      const authServices = JSON.parse(localStorage.getItem('miniai_authenticated_services') || '[]');
      const updatedServices = authServices.filter(id => id !== serviceId);
      localStorage.setItem('miniai_authenticated_services', JSON.stringify(updatedServices));
      
      console.log(`[OAuthLoader] Autenticação revogada para ${serviceId}`);
      
      // Disparar evento
      document.dispatchEvent(new CustomEvent('oauth-revoked', { 
        detail: { serviceId } 
      }));
      
      return true;
    } catch (error) {
      console.error(`[OAuthLoader] Erro ao revogar autenticação para ${serviceId}:`, error);
      return false;
    }
  }

  /**
   * Gera string aleatória para state (proteção CSRF)
   * @returns {string} State aleatório
   */
  generateState() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }
}

// Criar instância global
const oauthConnection = new OAuthLoader();

// Comunicação com janela de popup
window.addEventListener('message', event => {
  // Verificar origem da mensagem
  if (event.origin !== window.location.origin) return;
  
  // Processar mensagem
  if (event.data && event.data.type === 'oauth2-callback') {
    console.log('[OAuthLoader] Recebido callback OAuth2');
    
    // Salvar dados no localStorage
    localStorage.setItem('oauth2_code', event.data.code);
    localStorage.setItem('oauth2_returned_state', event.data.state);
  }
});

// Sinalizar que módulo foi carregado
document.dispatchEvent(new CustomEvent('oauth-loader-ready'));

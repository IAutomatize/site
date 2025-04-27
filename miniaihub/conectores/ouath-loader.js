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
      authUrl.searchParams.append('response_type', '

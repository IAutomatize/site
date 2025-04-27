/**
 * MiniIA Hub - OAuth Loader Simplificado
 * Versão: 1.0.0
 */
class OAuthManager {
  constructor() {
    // Configuração inicial
    this.initialized = false;
    this.baseUrl = '';
    this.configFile = 'products.json'; // Ou index.json
    this.DEBUG = true;
    
    // Inicializar imediatamente
    this.init();
  }

  /**
   * Inicializa o gerenciador e detecta caminho base
   */
  async init() {
    this.log('Inicializando OAuthManager...');
    
    // Tentar cada caminho possível em ordem
    const possiblePaths = [
      '/miniaihub/conectores/',
      '/conectores/',
      '/../conectores/',
      '/site/miniaihub/conectores/',
      './'
    ];
    
    // Para cada caminho, verificar se consegue carregar o arquivo index/products
    for (const path of possiblePaths) {
      try {
        const url = window.location.origin + path + this.configFile;
        this.log(`Tentando carregar de: ${url}`);
        
        const response = await fetch(url, { 
          method: 'GET',
          cache: 'no-store'
        });
        
        if (response.ok) {
          this.baseUrl = window.location.origin + path;
          this.initialized = true;
          this.log(`Caminho base encontrado: ${this.baseUrl}`);
          
          // Disparar evento de sucesso
          this.triggerEvent('loaded');
          return true;
        }
      } catch (error) {
        this.log(`Falha ao carregar de ${path}: ${error.message}`, 'error');
      }
    }
    
    // Se chegou aqui, nenhum caminho funcionou
    this.log('Falha ao encontrar caminho base válido', 'error');
    this.triggerEvent('error', { message: 'Falha ao carregar arquivos de configuração' });
    return false;
  }

  /**
   * Carrega os serviços disponíveis
   */
  async getServices() {
    if (!this.initialized) {
      await this.init();
      if (!this.initialized) {
        throw new Error('OAuthManager não inicializado');
      }
    }
    
    try {
      const url = this.baseUrl + this.configFile;
      this.log(`Carregando serviços de: ${url}`);
      
      const response = await fetch(url, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const services = await response.json();
      this.log(`${services.length} serviços carregados`);
      return services;
    } catch (error) {
      this.log(`Erro ao carregar serviços: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Verifica se um serviço está autenticado
   */
  isAuthenticated(serviceId) {
    const token = localStorage.getItem(`miniai_token_${serviceId}`);
    return !!token;
  }

  /**
   * Inicia autenticação OAuth para um serviço
   */
  startAuth(serviceId) {
    this.log(`Iniciando autenticação para: ${serviceId}`);
    
    // Implementação simplificada para teste
    // Na versão completa, isso abriria uma janela OAuth
    setTimeout(() => {
      // Simulação de sucesso
      localStorage.setItem(`miniai_token_${serviceId}`, 'token_simulado');
      this.triggerEvent('auth-success', { serviceId });
    }, 2000);
    
    return true;
  }

  /**
   * Registra mensagens no console se debug estiver ativado
   */
  log(message, type = 'info') {
    if (!this.DEBUG) return;
    
    const styles = {
      info: 'color: #2D9CDB',
      error: 'color: #EB5757; font-weight: bold;',
      success: 'color: #27AE60',
      warning: 'color: #F2994A'
    };
    
    console.log(`%c[OAuthManager] ${message}`, styles[type] || styles.info);
  }

  /**
   * Dispara um evento personalizado
   */
  triggerEvent(name, detail = {}) {
    const event = new CustomEvent(`oauth-${name}`, { detail });
    document.dispatchEvent(event);
  }
}

// Criar e exportar instância
window.oauthManager = new OAuthManager();

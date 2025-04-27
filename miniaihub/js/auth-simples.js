/**
 * auth-simples.js - Versão simplificada do gerenciador OAuth
 * Substitui o oauth-loader.js com uma solução mais simples baseada em arquivos estáticos
 * 
 * Este script carrega configurações de autenticação a partir de arquivos JSON
 * e gerencia o fluxo OAuth2 para diferentes serviços.
 */
class AuthSimples {
  constructor() {
    // Prefixo usado para salvar tokens no localStorage
    this.tokenPrefix = 'miniai_token_';
    
    // Lista de serviços autenticados
    this.servicosAuthKey = 'miniai_servicos_auth';
    
    // Caminhos base no site
    this.basePath = '/miniaihub/auth-config/';
    
    // Inicializar o sistema
    this.init();
    
    console.log('AuthSimples: Sistema simplificado de autenticação inicializado');
  }

  /**
   * Inicializa o sistema de autenticação
   */
  init() {
    // Configurar ouvinte para mensagens do popup OAuth
    window.addEventListener('message', this.receberMensagemOAuth.bind(this));
    
    // Disparar evento quando estiver pronto
    document.dispatchEvent(new CustomEvent('auth-simples-pronto'));
  }

  /**
   * Carrega um arquivo de configuração OAuth para um serviço
   * @param {string} servicoId - ID do serviço (ex: "google.sheets", "google.gmail")
   * @returns {Promise<Object>} Configuração do serviço
   */
  async carregarConfig(servicoId) {
    try {
      // Garantir que não tenha caracteres especiais no ID
      const idSeguro = servicoId.replace(/[^a-zA-Z0-9.]/g, '');
      
      // Buscar o arquivo JSON
      const resposta = await fetch(`${window.location.origin}${this.basePath}${idSeguro}.json`, {
        headers: { 'Cache-Control': 'no-cache' },
        cache: 'no-store'
      });
      
      if (!resposta.ok) {
        throw new Error(`Erro ${resposta.status} ao carregar config de ${servicoId}`);
      }
      
      const config = await resposta.json();
      return config;
    } catch (erro) {
      console.error(`Falha ao carregar configuração de ${servicoId}:`, erro);
      this.dispararEvento('erro-auth', { 
        servicoId, 
        mensagem: erro.message 
      });
      throw erro;
    }
  }

  /**
   * Inicia o fluxo OAuth2 para um serviço
   * @param {string} servicoId - ID do serviço
   * @returns {Promise<boolean>} Resultado da autenticação
   */
  async iniciarOAuth(servicoId) {
    try {
      // Carregar configuração do serviço
      const config = await this.carregarConfig(servicoId);
      
      // Gerar state para proteção CSRF
      const state = this.gerarState();
      
      // Incorporar email do usuário no state (se disponível)
      const userEmail = localStorage.getItem('miniai_user_email') || '';
      const stateCompleto = userEmail ? `${state}:${encodeURIComponent(userEmail)}` : state;
      
      // Salvar state e serviço para verificação posterior
      localStorage.setItem('oauth_state', state);
      localStorage.setItem('oauth_servico_id', servicoId);
      
      // Montar URL de autorização
      const authUrl = new URL(config.urlAuth);
      authUrl.searchParams.append('client_id', config.clientId);
      authUrl.searchParams.append('redirect_uri', config.redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', config.escopos.join(' '));
      authUrl.searchParams.append('state', stateCompleto);
      
      // Adicionar parâmetros extras se houverem
      if (config.parametrosAdicionais) {
        Object.entries(config.parametrosAdicionais).forEach(([chave, valor]) => {
          authUrl.searchParams.append(chave, valor);
        });
      }
      
      console.log('URL de autorização:', authUrl.toString());
      
      // Abrir popup de autorização
      const popupAuth = window.open(
        authUrl.toString(), 
        'oauth-popup', 
        'width=600,height=700,status=yes,toolbar=no'
      );
      
      if (!popupAuth) {
        throw new Error('Popup bloqueado! Por favor, permita popups para este site.');
      }

      // Aguardar resultado da autenticação
      return new Promise((resolve) => {
        // Verificar se o popup foi fechado
        const verificarPopup = setInterval(() => {
          if (popupAuth.closed) {
            clearInterval(verificarPopup);
            
            // Verificar se temos um código de autorização
            const code = localStorage.getItem('oauth_code');
            const stateRetornado = localStorage.getItem('oauth_state_retornado');
            
            if (code && stateRetornado === state) {
              // Trocar o código por tokens
              this.trocarCodePorToken(code, config, servicoId)
                .then(() => {
                  this.dispararEvento('sucesso-auth', { servicoId });
                  resolve(true);
                })
                .catch(erro => {
                  this.dispararEvento('erro-auth', { 
                    servicoId, 
                    mensagem: erro.message 
                  });
                  resolve(false);
                });
            } else {
              // Autenticação cancelada ou falhou
              this.dispararEvento('cancelado-auth', { servicoId });
              resolve(false);
            }
          }
        }, 500);
      });
    } catch (erro) {
      console.error(`Erro no processo OAuth para ${servicoId}:`, erro);
      this.dispararEvento('erro-auth', { 
        servicoId, 
        mensagem: erro.message 
      });
      return false;
    }
  }

  /**
   * Troca o código de autorização por tokens de acesso/refresh
   * @param {string} code - Código de autorização
   * @param {Object} config - Configuração do serviço
   * @param {string} servicoId - ID do serviço
   * @returns {Promise<Object>} - Tokens obtidos
   */
  async trocarCodePorToken(code, config, servicoId) {
    try {
      // Em um ambiente real, esta troca deve ser feita no backend
      // por questões de segurança (para não expor client_secret)
      // Aqui simulamos usando o endpoint fornecido na configuração
      
      const resposta = await fetch(config.urlToken, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          redirect_uri: config.redirectUri,
          client_id: config.clientId,
          // Normalmente haveria também um client_secret
          grant_type: 'authorization_code'
        })
      });
      
      if (!resposta.ok) {
        const erro = await resposta.json();
        throw new Error(erro.error || `Erro ${resposta.status}`);
      }
      
      const tokens = await resposta.json();
      
      // Verificar se recebemos um access_token
      if (!tokens.access_token) {
        throw new Error('Token inválido na resposta');
      }
      
      // Salvar os tokens
      this.salvarTokens(servicoId, tokens);
      
      return tokens;
    } catch (erro) {
      console.error('Erro ao trocar code por token:', erro);
      throw erro;
    } finally {
      // Limpar dados temporários
      localStorage.removeItem('oauth_code');
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_state_retornado');
      localStorage.removeItem('oauth_servico_id');
    }
  }

  /**
   * Salva tokens no localStorage
   * @param {string} servicoId - ID do serviço
   * @param {Object} tokens - Tokens obtidos (access_token, refresh_token, etc)
   */
  salvarTokens(servicoId, tokens) {
    try {
      // Salvar tokens com prefixo
      localStorage.setItem(
        `${this.tokenPrefix}${servicoId}`, 
        JSON.stringify(tokens)
      );
      
      // Atualizar lista de serviços autenticados
      const listaServicos = this.getServicosAutenticados();
      if (!listaServicos.includes(servicoId)) {
        listaServicos.push(servicoId);
        localStorage.setItem(
          this.servicosAuthKey, 
          JSON.stringify(listaServicos)
        );
      }
      
      console.log(`Tokens salvos com sucesso para ${servicoId}`);
    } catch (erro) {
      console.error('Erro ao salvar tokens:', erro);
      throw erro;
    }
  }

  /**
   * Recebe a mensagem de callback do popup OAuth
   * @param {MessageEvent} evento - Evento de mensagem
   */
  receberMensagemOAuth(evento) {
    // Verificar se a mensagem é do nosso popup OAuth
    if (evento.data && evento.data.tipo === 'oauth-callback') {
      console.log('Recebido callback OAuth:', evento.data);
      
      // Salvar código e state para processamento
      localStorage.setItem('oauth_code', evento.data.code);
      localStorage.setItem('oauth_state_retornado', evento.data.state);
    }
  }

  /**
   * Gera um state aleatório para proteção CSRF
   * @returns {string} - String aleatória para state
   */
  gerarState() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Verifica se um serviço está autenticado
   * @param {string} servicoId - ID do serviço
   * @returns {boolean} - Status da autenticação
   */
  estaAutenticado(servicoId) {
    return !!localStorage.getItem(`${this.tokenPrefix}${servicoId}`);
  }

  /**
   * Retorna a lista de serviços autenticados
   * @returns {Array<string>} - Lista de IDs de serviços
   */
  getServicosAutenticados() {
    try {
      return JSON.parse(localStorage.getItem(this.servicosAuthKey) || '[]');
    } catch (erro) {
      console.error('Erro ao carregar lista de serviços autenticados:', erro);
      return [];
    }
  }

  /**
   * Revoga a autenticação de um serviço
   * @param {string} servicoId - ID do serviço
   * @returns {boolean} - Sucesso da operação
   */
  revogarAutenticacao(servicoId) {
    try {
      // Remover tokens
      localStorage.removeItem(`${this.tokenPrefix}${servicoId}`);
      
      // Atualizar lista de serviços
      const listaServicos = this.getServicosAutenticados()
        .filter(id => id !== servicoId);
      
      localStorage.setItem(this.servicosAuthKey, JSON.stringify(listaServicos));
      
      this.dispararEvento('revogado-auth', { servicoId });
      return true;
    } catch (erro) {
      console.error('Erro ao revogar autenticação:', erro);
      return false;
    }
  }

  /**
   * Dispara um evento personalizado
   * @param {string} tipoEvento - Tipo de evento
   * @param {Object} dados - Dados do evento
   */
  dispararEvento(tipoEvento, dados) {
    document.dispatchEvent(
      new CustomEvent(tipoEvento, { detail: dados })
    );
  }

  /**
   * Define o email do usuário para uso no fluxo OAuth
   * @param {string} email - Email do usuário
   */
  definirEmailUsuario(email) {
    if (email) {
      localStorage.setItem('miniai_user_email', email);
      console.log('Email do usuário definido:', email);
    }
  }
}

// Criar instância global para uso em todo o site
const authSimples = new AuthSimples();

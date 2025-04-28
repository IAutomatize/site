class AuthSimples {
  constructor() {
    // Prefixo usado para salvar tokens no localStorage
    this.tokenPrefix = 'miniai_token_';
    
    // Lista de serviços autenticados
    this.servicosAuthKey = 'miniai_servicos_auth';
    
    // Caminhos base no site
    this.basePath = '/miniaihub/auth-config/';
    
    // Cache de configurações OAuth
    this.configCache = {};
    
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
      // Verificar cache primeiro
      if (this.configCache[servicoId]) {
        return this.configCache[servicoId];
      }
      
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
      
      // Inserir as credenciais e URLs corretas
      config.clientId = "497950269459-b2262eolm2oh1fioa9vn7f523qr7k807.apps.googleusercontent.com";
      config.redirectUri = "https://requisicao.iautomatize.com/webhook/rest/oauth2-credential/callback";
      config.urlToken = "https://requisicao.iautomatize.com/webhook/rest/oauth2-credential/callback";
      
      // Adicionar ao cache
      this.configCache[servicoId] = config;
      
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
   * Inicia o fluxo OAuth2 para um serviço específico
   * @param {string} servicoId - ID do serviço
   * @param {string} miniIaId - ID da Mini-IA que requer este serviço
   * @returns {Promise<boolean>} Resultado da autenticação
   */
  async iniciarOAuth(servicoId, miniIaId = null) {
    try {
      // Carregar configuração do serviço
      const config = await this.carregarConfig(servicoId);
      
      // Gerar state para proteção CSRF
      const state = this.gerarState();
      
      // Incorporar email do usuário no state (se disponível)
      const userEmail = localStorage.getItem('miniai_user_email') || '';
      const stateCompleto = userEmail 
        ? `${state}:${encodeURIComponent(userEmail)}:${encodeURIComponent(miniIaId || '')}`
        : `${state}::${encodeURIComponent(miniIaId || '')}`;
      
      // Salvar state e serviço para verificação posterior
      localStorage.setItem('oauth_state', state);
      localStorage.setItem('oauth_servico_id', servicoId);
      if (miniIaId) {
        localStorage.setItem('oauth_miniai_id', miniIaId);
      }
      
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
                  this.dispararEvento('sucesso-auth', { 
                    servicoId,
                    miniIaId: localStorage.getItem('oauth_miniai_id') || null
                  });
                  resolve(true);
                })
                .catch(erro => {
                  this.dispararEvento('erro-auth', { 
                    servicoId, 
                    mensagem: erro.message,
                    miniIaId: localStorage.getItem('oauth_miniai_id') || null
                  });
                  resolve(false);
                });
            } else {
              // Autenticação cancelada ou falhou
              this.dispararEvento('cancelado-auth', { 
                servicoId,
                miniIaId: localStorage.getItem('oauth_miniai_id') || null
              });
              resolve(false);
            }
          }
        }, 500);
      });
    } catch (erro) {
      console.error(`Erro no processo OAuth para ${servicoId}:`, erro);
      this.dispararEvento('erro-auth', { 
        servicoId, 
        mensagem: erro.message,
        miniIaId: miniIaId || null
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
      
      const resposta = await fetch(config.urlToken, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          redirect_uri: config.redirectUri,
          client_id: config.clientId,
          grant_type: 'authorization_code'
        })
      });
      
      if (!resposta.ok) {
        const erro = await resposta.json();
        throw new Error(erro.error || `Erro ${resposta.status}`);
      }
      
// SUBSTITUA ESTA PARTE
      const tokens = await resposta.json();
      
      // Normalizar resposta (se for array, pegar primeiro item)
      const tokenData = Array.isArray(tokens) ? tokens[0] : tokens;
      
      // Verificar se recebemos um access_token
      if (!tokenData.access_token) {
        throw new Error('Token inválido na resposta');
      }
      
      // Salvar os tokens
      this.salvarTokens(servicoId, tokenData);
      // FIM DA SUBSTITUIÇÃO
      
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
      localStorage.removeItem('oauth_miniai_id');
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
   * Verifica quais serviços necessários para uma Mini-IA já estão autenticados
   * @param {Array<string>} servicos - Lista de serviços necessários
   * @returns {Object} - Status de autenticação para cada serviço
   */
  verificarServicosParaMiniIA(servicos) {
    const resultado = {};
    
    servicos.forEach(servicoId => {
      resultado[servicoId] = this.estaAutenticado(servicoId);
    });
    
    return resultado;
  }

  /**
   * Inicia o processo de autenticação para todos os serviços necessários de uma Mini-IA
   * @param {Array<string>} servicos - Lista de serviços necessários
   * @param {string} miniIaId - ID da Mini-IA
   * @returns {Promise<boolean>} - Resultado geral da autenticação
   */
  async autenticarParaMiniIA(servicos, miniIaId) {
    // Verificar quais serviços já estão autenticados
    const statusServicos = this.verificarServicosParaMiniIA(servicos);
    
    // Filtrar apenas os serviços não autenticados
    const servicosPendentes = servicos.filter(id => !statusServicos[id]);
    
    if (servicosPendentes.length === 0) {
      // Todos os serviços já estão autenticados
      return true;
    }
    
    // Autenticar cada serviço pendente em sequência
    for (const servicoId of servicosPendentes) {
      const sucesso = await this.iniciarOAuth(servicoId, miniIaId);
      if (!sucesso) {
        return false; // Parar se algum falhar
      }
    }
    
    return true;
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
window.authSimples = new AuthSimples();

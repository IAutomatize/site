/**
 * produto-loader.js - Carregador de produtos e ferramentas do MiniIA Hub
 * 
 * Este script carrega dinamicamente produtos e ferramentas a partir de arquivos
 * estáticos JSON e CSS, substituindo o sistema complexo anterior.
 */
class ProdutoLoader {
  constructor() {
    // Caminhos base no site
    this.caminhosProdutos = '/miniaihub/json-produtos/';
    this.caminhosCSSProdutos = '/miniaihub/css-produtos/';
    this.caminhosFerramentas = '/miniaihub/css-ferramentas/';
    
    // Cache para evitar requisições repetidas
    this.cacheProdutos = {};
    this.cacheFerramentas = {};
    
    // Mapeamento de produtos para ferramentas necessárias
    this.mapaFerramentas = {};
    
    console.log('ProdutoLoader: Sistema de carregamento inicializado');
  }

  /**
   * Carrega a lista de todos os produtos disponíveis
   * @returns {Promise<Array>} Lista de produtos
   */
  async carregarProdutos() {
    try {
      // Listar produtos disponíveis
      // Em uma implementação real, isso seria feito via API ou arquivo index.json
      // Aqui simulamos com uma lista fixa para demonstração
      
      const produtosIds = await this.listarArquivosProdutos();
      console.log('Produtos encontrados:', produtosIds);
      
      // Carregar detalhes de cada produto
      const produtos = await Promise.all(
        produtosIds.map(id => this.carregarProduto(id))
      );
      
      // Filtrar produtos com carregamento falho
      return produtos.filter(p => p !== null);
    } catch (erro) {
      console.error('Erro ao carregar produtos:', erro);
      this.dispararEvento('erro-carregamento', {
        tipo: 'produtos',
        mensagem: erro.message
      });
      return [];
    }
  }

  /**
   * Lista os arquivos de produtos disponíveis
   * Em produção, isso seria feito via API ou index.json
   * @returns {Promise<Array<string>>} IDs dos produtos
   */
  async listarArquivosProdutos() {
    // Simulando a listagem de produtos
    // Em uma implementação real, isso seria feito via requisição AJAX
    // para um endpoint que liste os arquivos disponíveis
    
    // Para demonstração, retornamos uma lista fixa
    return [
      'ia-analisa-planilha',
      'ia-analisa-gmail',
      'ia-gera-relatorio',
      'ia-resumo-documentos',
      'ia-automatiza-publicacoes'
    ];
  }

  /**
   * Carrega os detalhes de um produto específico
   * @param {string} produtoId - ID do produto
   * @returns {Promise<Object|null>} Detalhes do produto
   */
  async carregarProduto(produtoId) {
    // Verificar se já está em cache
    if (this.cacheProdutos[produtoId]) {
      return this.cacheProdutos[produtoId];
    }
    
    try {
      // Buscar o arquivo JSON do produto
      const resposta = await fetch(
        `${window.location.origin}${this.caminhosProdutos}${produtoId}.json`,
        {
          headers: { 'Cache-Control': 'no-cache' },
          cache: 'no-store'
        }
      );
      
      if (!resposta.ok) {
        throw new Error(`Erro ${resposta.status} ao carregar produto ${produtoId}`);
      }
      
      const dadosProduto = await resposta.json();
      
      // Adicionar o ID ao objeto
      dadosProduto.id = produtoId;
      
      // Se houver ferramentas necessárias, salvar no mapa
      if (dadosProduto.ferramentasNecessarias && 
          Array.isArray(dadosProduto.ferramentasNecessarias)) {
        this.mapaFerramentas[produtoId] = dadosProduto.ferramentasNecessarias;
      }
      
      // Adicionar ao cache
      this.cacheProdutos[produtoId] = dadosProduto;
      
      return dadosProduto;
    } catch (erro) {
      console.error(`Erro ao carregar produto ${produtoId}:`, erro);
      this.dispararEvento('erro-carregamento', {
        tipo: 'produto',
        id: produtoId,
        mensagem: erro.message
      });
      return null;
    }
  }

  /**
   * Carrega o CSS específico de um produto
   * @param {string} produtoId - ID do produto
   * @returns {Promise<boolean>} Sucesso do carregamento
   */
  async carregarCSS(produtoId) {
    try {
      // Verificar se o CSS já está carregado
      if (document.querySelector(`link[data-produto="${produtoId}"]`)) {
        return true;
      }
      
      // Criar elemento link para o CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${window.location.origin}${this.caminhosCSSProdutos}${produtoId}.css`;
      link.dataset.produto = produtoId;
      
      // Adicionar ao head
      document.head.appendChild(link);
      
      // Esperar pelo carregamento ou erro
      return new Promise((resolve) => {
        link.onload = () => resolve(true);
        link.onerror = () => {
          console.warn(`CSS do produto ${produtoId} não encontrado`);
          resolve(false);
        };
      });
    } catch (erro) {
      console.error(`Erro ao carregar CSS do produto ${produtoId}:`, erro);
      return false;
    }
  }

  /**
   * Carrega as ferramentas necessárias para um produto
   * @param {string} produtoId - ID do produto
   * @returns {Promise<Array>} Lista de ferramentas carregadas
   */
  async carregarFerramentasParaProduto(produtoId) {
    try {
      // Verificar se temos informações sobre ferramentas necessárias
      if (!this.mapaFerramentas[produtoId]) {
        // Primeiro carregar o produto para obter a lista de ferramentas
        const produto = await this.carregarProduto(produtoId);
        if (!produto || !produto.ferramentasNecessarias) {
          return [];
        }
      }
      
      // Obter lista de ferramentas necessárias
      const ferramentasIds = this.mapaFerramentas[produtoId];
      
      // Carregar as ferramentas
      const ferramentas = await Promise.all(
        ferramentasIds.map(id => this.carregarFerramenta(id))
      );
      
      return ferramentas.filter(f => f !== null);
    } catch (erro) {
      console.error(`Erro ao carregar ferramentas para ${produtoId}:`, erro);
      return [];
    }
  }

  /**
   * Carrega uma ferramenta específica
   * @param {string} ferramentaId - ID da ferramenta
   * @returns {Promise<Object|null>} Detalhes da ferramenta
   */
  async carregarFerramenta(ferramentaId) {
    // Verificar se já está em cache
    if (this.cacheFerramentas[ferramentaId]) {
      return this.cacheFerramentas[ferramentaId];
    }
    
    try {
      // Implementação real carregaria o JSON da ferramenta
      // Aqui simulamos com objetos predefinidos para fins de demonstração
      
      // Mapeamento de ferramentas (simulando dados de arquivos JSON)
      const ferramentasDisponiveis = {
        'google-sheets': {
          id: 'google-sheets',
          nome: 'Google Sheets',
          descricao: 'Planilhas online do Google',
          icone: 'https://www.gstatic.com/images/branding/product/1x/sheets_48dp.png',
          servicoOAuth: 'google.sheets',
          categoria: 'produtividade'
        },
        'gmail': {
          id: 'gmail',
          nome: 'Gmail',
          descricao: 'Serviço de e-mail do Google',
          icone: 'https://www.gstatic.com/images/branding/product/1x/gmail_48dp.png',
          servicoOAuth: 'google.gmail',
          categoria: 'comunicacao'
        },
        'google-drive': {
          id: 'google-drive',
          nome: 'Google Drive',
          descricao: 'Armazenamento de arquivos do Google',
          icone: 'https://www.gstatic.com/images/branding/product/1x/drive_48dp.png',
          servicoOAuth: 'google.drive',
          categoria: 'armazenamento'
        },
        'microsoft-excel': {
          id: 'microsoft-excel',
          nome: 'Microsoft Excel',
          descricao: 'Planilhas da Microsoft',
          icone: 'https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/png/excel_48x1.png',
          servicoOAuth: 'microsoft.excel',
          categoria: 'produtividade'
        },
        'microsoft-outlook': {
          id: 'microsoft-outlook',
          nome: 'Microsoft Outlook',
          descricao: 'E-mail da Microsoft',
          icone: 'https://static2.sharepointonline.com/files/fabric/assets/brand-icons/product/png/outlook_48x1.png',
          servicoOAuth: 'microsoft.outlook',
          categoria: 'comunicacao'
        }
      };
      
      const dadosFerramenta = ferramentasDisponiveis[ferramentaId] || null;
      
      if (!dadosFerramenta) {
        throw new Error(`Ferramenta ${ferramentaId} não encontrada`);
      }
      
      // Adicionar ao cache
      this.cacheFerramentas[ferramentaId] = dadosFerramenta;
      
      return dadosFerramenta;
    } catch (erro) {
      console.error(`Erro ao carregar ferramenta ${ferramentaId}:`, erro);
      this.dispararEvento('erro-carregamento', {
        tipo: 'ferramenta',
        id: ferramentaId,
        mensagem: erro.message
      });
      return null;
    }
  }

  /**
   * Carrega o CSS específico de uma ferramenta
   * @param {string} ferramentaId - ID da ferramenta
   * @returns {Promise<boolean>} Sucesso do carregamento
   */
  async carregarCSSFerramenta(ferramentaId) {
    try {
      // Verificar se o CSS já está carregado
      if (document.querySelector(`link[data-ferramenta="${ferramentaId}"]`)) {
        return true;
      }
      
      // Criar elemento link para o CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${window.location.origin}${this.caminhosFerramentas}${ferramentaId}.css`;
      link.dataset.ferramenta = ferramentaId;
      
      // Adicionar ao head
      document.head.appendChild(link);
      
      // Esperar pelo carregamento ou erro
      return new Promise((resolve) => {
        link.onload = () => resolve(true);
        link.onerror = () => {
          console.warn(`CSS da ferramenta ${ferramentaId} não encontrado`);
          resolve(false);
        };
      });
    } catch (erro) {
      console.error(`Erro ao carregar CSS da ferramenta ${ferramentaId}:`, erro);
      return false;
    }
  }

  /**
   * Verifica o status de autenticação de uma ferramenta
   * @param {string} ferramentaId - ID da ferramenta
   * @returns {boolean} Status de autenticação
   */
  verificarAutenticacao(ferramentaId) {
    try {
      // Obter a ferramenta
      const ferramenta = this.cacheFerramentas[ferramentaId];
      if (!ferramenta || !ferramenta.servicoOAuth) {
        return false;
      }
      
      // Verificar com o AuthSimples se está autenticado
      return window.authSimples ? 
        window.authSimples.estaAutenticado(ferramenta.servicoOAuth) : 
        false;
    } catch (erro) {
      console.error(`Erro ao verificar autenticação de ${ferramentaId}:`, erro);
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
}

// Criar instância global
const produtoLoader = new ProdutoLoader();

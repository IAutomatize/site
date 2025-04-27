/**
 * conector-generator.js - Gerador de páginas de conectores MiniIA
 * 
 * Este script gera páginas HTML individuais para cada Mini-IA no catálogo.
 * Pode ser executado como uma ferramenta de CLI durante o build do site.
 * 
 * Uso:
 * node conector-generator.js --output-dir ./dist/miniaihub/conector
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

// Converter callbacks em promises
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

// Configurações
const CONFIG = {
  catalogApiUrl: './data/miniais.json', // Arquivo de catálogo local
  templatePath: './templates/conector-template.html', // Modelo HTML do conector
  outputDir: './dist/miniaihub/conector', // Diretório de saída
  siteBaseUrl: 'https://iautomatize.com/miniaihub' // URL base do site
};

/**
 * Função principal
 */
async function main() {
  try {
    // Processar argumentos da linha de comando
    processArgs();
    
    // Criar diretório de saída se não existir
    await createOutputDir();
    
    // Carregar modelo de conector
    const template = await loadTemplate();
    
    // Carregar dados do catálogo
    const miniais = await loadMiniIAs();
    
    // Gerar arquivo HTML para cada Mini-IA
    await generatePages(miniais, template);
    
    console.log(`✅ Geração concluída! ${miniais.length} páginas geradas em ${CONFIG.outputDir}`);
  } catch (error) {
    console.error('❌ Erro ao gerar páginas:', error);
    process.exit(1);
  }
}

/**
 * Processa argumentos da linha de comando
 */
function processArgs() {
  const args = process.argv.slice(2);
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output-dir' && i + 1 < args.length) {
      CONFIG.outputDir = args[i + 1];
      i++; // Pular o próximo argumento
    } else if (args[i] === '--catalog' && i + 1 < args.length) {
      CONFIG.catalogApiUrl = args[i + 1];
      i++;
    } else if (args[i] === '--template' && i + 1 < args.length) {
      CONFIG.templatePath = args[i + 1];
      i++;
    } else if (args[i] === '--base-url' && i + 1 < args.length) {
      CONFIG.siteBaseUrl = args[i + 1];
      i++;
    } else if (args[i] === '--help') {
      printHelp();
      process.exit(0);
    }
  }
}

/**
 * Exibe ajuda de uso
 */
function printHelp() {
  console.log(`
Gerador de Páginas de Conectores do MiniIA Hub

Uso: node conector-generator.js [opções]

Opções:
  --output-dir <dir>   Diretório de saída para as páginas geradas (padrão: ./dist/miniaihub/conector)
  --catalog <path>     Caminho para o arquivo JSON do catálogo (padrão: ./data/miniais.json)
  --template <path>    Caminho para o modelo HTML (padrão: ./templates/conector-template.html)
  --base-url <url>     URL base do site (padrão: https://iautomatize.com/miniaihub)
  --help               Exibe esta ajuda
  `);
}

/**
 * Cria o diretório de saída se não existir
 */
async function createOutputDir() {
  try {
    // Criar diretório recursivamente 
    await mkdir(CONFIG.outputDir, { recursive: true });
    console.log(`📁 Diretório de saída criado/verificado: ${CONFIG.outputDir}`);
  } catch (error) {
    throw new Error(`Erro ao criar diretório de saída: ${error.message}`);
  }
}

/**
 * Carrega o modelo HTML de conector
 */
async function loadTemplate() {
  try {
    const template = await readFile(CONFIG.templatePath, 'utf-8');
    console.log(`📄 Modelo de conector carregado: ${CONFIG.templatePath}`);
    return template;
  } catch (error) {
    throw new Error(`Erro ao carregar modelo HTML: ${error.message}`);
  }
}

/**
 * Carrega os dados do catálogo de Mini-IAs
 */
async function loadMiniIAs() {
  try {
    // Carregar arquivo JSON
    const data = await readFile(CONFIG.catalogApiUrl, 'utf-8');
    const miniais = JSON.parse(data);
    
    console.log(`📊 Dados do catálogo carregados: ${miniais.length} Mini-IAs encontradas`);
    return miniais;
  } catch (error) {
    throw new Error(`Erro ao carregar dados do catálogo: ${error.message}`);
  }
}

/**
 * Gera páginas HTML para cada Mini-IA
 * @param {Array} miniais - Lista de Mini-IAs
 * @param {string} template - Modelo HTML
 */
async function generatePages(miniais, template) {
  console.log('🔄 Gerando páginas de conectores...');
  
  // Array de promessas para processamento paralelo
  const promises = miniais.map(async (miniai) => {
    try {
      // Gerar conteúdo substituindo variáveis no modelo
      const content = renderTemplate(template, miniai);
      
      // Definir nome de arquivo
      const fileName = `${miniai.id}.html`;
      const filePath = path.join(CONFIG.outputDir, fileName);
      
      // Escrever arquivo
      await writeFile(filePath, content, 'utf-8');
      
      console.log(`✅ Página gerada: ${fileName}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao gerar página para ${miniai.id}:`, error);
      return false;
    }
  });
  
  // Aguardar todas as operações
  const results = await Promise.all(promises);
  
  // Contar sucessos
  const successCount = results.filter(Boolean).length;
  console.log(`🔄 ${successCount} de ${miniais.length} páginas geradas com sucesso`);
}

/**
 * Renderiza o modelo HTML substituindo variáveis pelos dados da Mini-IA
 * @param {string} template - Modelo HTML
 * @param {Object} miniai - Dados da Mini-IA
 * @returns {string} - HTML renderizado
 */
function renderTemplate(template, miniai) {
  let content = template;
  
  // Substituir variáveis básicas
  content = content.replace(/\{\{miniai_id\}\}/g, miniai.id || '');
  content = content.replace(/\{\{miniai_name\}\}/g, miniai.name || '');
  content = content.replace(/\{\{miniai_description\}\}/g, miniai.description || '');
  content = content.replace(/\{\{miniai_image\}\}/g, miniai.image || '/miniaihub/assets/img/placeholder.png');
  
  // Renderizar estrelas
  const starsCount = Math.round(miniai.stars || 0);
  const starsHtml = Array(5).fill().map((_, i) => 
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="${i < starsCount ? '#FFC107' : 'none'}" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#FFC107" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  ).join('');
  
  content = content.replace(/\{\{miniai_stars\}\}/g, starsHtml);
  content = content.replace(/\{\{miniai_reviews\}\}/g, miniai.reviews || 0);
  content = content.replace(/\{\{miniai_average_rating\}\}/g, (miniai.stars || 0).toFixed(1));
  content = content.replace(/\{\{miniai_average_stars\}\}/g, starsHtml);
  
  // Renderizar tags
  const tagsHtml = (miniai.tags || []).map(tag => {
    // Determinar classe CSS baseado na tag
    let tagClass = 'tag';
    if (tag.toLowerCase().includes('crm')) tagClass += ' crm';
    else if (tag.toLowerCase().includes('email')) tagClass += ' email';
    else if (tag.toLowerCase().includes('pagamento')) tagClass += ' payments';
    
    return `<span class="${tagClass}">${tag}</span>`;
  }).join('');
  
  content = content.replace(/\{\{miniai_tags\}\}/g, tagsHtml);
  
  // Renderizar texto sobre a Mini-IA
  content = content.replace(/\{\{miniai_about\}\}/g, renderAboutSection(miniai));
  content = content.replace(/\{\{miniai_how_it_works\}\}/g, renderHowItWorksSection(miniai));
  content = content.replace(/\{\{miniai_use_cases\}\}/g, renderUseCasesSection(miniai));
  
  // Renderizar recursos e integrações
  content = content.replace(/\{\{miniai_features\}\}/g, renderFeaturesSection(miniai));
  content = content.replace(/\{\{miniai_integrations\}\}/g, renderIntegrationsSection(miniai));
  
  // Renderizar requisitos e permissões
  content = content.replace(/\{\{miniai_requirements\}\}/g, renderRequirementsSection(miniai));
  content = content.replace(/\{\{miniai_permissions\}\}/g, renderPermissionsSection(miniai));
  
  // Renderizar avaliações
  content = content.replace(/\{\{miniai_ratings_breakdown\}\}/g, renderRatingsBreakdown(miniai));
  content = content.replace(/\{\{miniai_reviews_list\}\}/g, renderReviewsList(miniai));
  
  // Renderizar informações de preço
  content = content.replace(/\{\{miniai_price\}\}/g, renderPrice(miniai));
  content = content.replace(/\{\{miniai_price_period\}\}/g, renderPricePeriod(miniai));
  
  // Renderizar serviços necessários
  content = content.replace(/\{\{miniai_required_services\}\}/g, renderRequiredServices(miniai));
  content = content.replace(/\{\{miniai_required_services_json\}\}/g, JSON.stringify(miniai.requiredServices || []));
  
  // Renderizar configurações
  content = content.replace(/\{\{miniai_settings_json\}\}/g, JSON.stringify(miniai.settings || {}));
  
  // Renderizar informações do desenvolvedor
  content = content.replace(/\{\{developer_id\}\}/g, miniai.developer?.id || 'miniaihub');
  content = content.replace(/\{\{developer_name\}\}/g, miniai.developer?.name || 'MiniIA Hub');
  content = content.replace(/\{\{developer_image\}\}/g, miniai.developer?.image || '/miniaihub/assets/img/developer-placeholder.png');
  content = content.replace(/\{\{developer_description\}\}/g, miniai.developer?.description || 'Equipe oficial do MiniIA Hub');
  content = content.replace(/\{\{developer_miniais_count\}\}/g, miniai.developer?.miniaisCount || 10);
  content = content.replace(/\{\{developer_installations\}\}/g, formatNumber(miniai.developer?.installations || 1000));
  content = content.replace(/\{\{developer_avg_rating\}\}/g, miniai.developer?.avgRating || 4.8);
  
  // Renderizar informações de suporte
  content = content.replace(/\{\{support_email\}\}/g, miniai.supportEmail || 'suporte@iautomatize.com');
  
  // Renderizar Mini-IAs relacionadas
  content = content.replace(/\{\{related_miniais\}\}/g, renderRelatedMiniIAs(miniai));
  
  return content;
}

/**
 * Renderiza a seção "Sobre" da Mini-IA
 */
function renderAboutSection(miniai) {
  if (miniai.about) {
    return `<p>${miniai.about}</p>`;
  }
  
  // Conteúdo padrão se não houver descrição personalizada
  return `
    <p>${miniai.name} é uma Mini-IA projetada para automatizar e simplificar tarefas relacionadas a ${miniai.tags?.join(', ') || 'fluxos de trabalho'} sem necessidade de programação.</p>
    <p>Este conector integra-se perfeitamente com suas ferramentas favoritas, permitindo que você configure fluxos de trabalho automatizados em minutos, sem escrever uma linha de código.</p>
  `;
}

/**
 * Renderiza a seção "Como funciona" da Mini-IA
 */
function renderHowItWorksSection(miniai) {
  if (miniai.howItWorks) {
    return miniai.howItWorks;
  }
  
  // Conteúdo padrão
  return `
    <p>${miniai.name} funciona em três etapas simples:</p>
    <ol>
      <li><strong>Conecte suas contas</strong> - Autorize o acesso às suas ferramentas através de OAuth seguro</li>
      <li><strong>Configure</strong> - Personalize os parâmetros para atender às suas necessidades específicas</li>
      <li><strong>Automatize</strong> - Deixe a Mini-IA trabalhar em segundo plano, realizando tarefas automaticamente</li>
    </ol>
    <p>Uma vez instalada, a Mini-IA será executada automaticamente com base nos gatilhos configurados, sem necessidade de intervenção manual.</p>
  `;
}

/**
 * Renderiza a seção "Casos de uso" da Mini-IA
 */
function renderUseCasesSection(miniai) {
  if (miniai.useCases && miniai.useCases.length > 0) {
    return miniai.useCases.map(useCase => `
      <div class="use-case-card">
        <div class="use-case-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>${useCase.title}</h3>
        <p>${useCase.description}</p>
      </div>
    `).join('');
  }
  
  // Casos de uso padrão baseados nas tags
  const useCases = [];
  
  if (miniai.tags?.includes('CRM') || miniai.tags?.includes('Vendas')) {
    useCases.push({
      title: 'Gestão de leads',
      description: 'Capture e organize leads automaticamente, distribuindo-os para sua equipe de vendas no momento certo.'
    });
  }
  
  if (miniai.tags?.includes('E-mail')) {
    useCases.push({
      title: 'Organização de e-mails',
      description: 'Organize sua caixa de entrada automaticamente, categorizando e priorizando mensagens importantes.'
    });
  }
  
  if (miniai.tags?.includes('Pagamentos') || miniai.tags?.includes('Financeiro')) {
    useCases.push({
      title: 'Faturamento automático',
      description: 'Gere e envie faturas automaticamente, com lembretes de pagamento para reduzir atrasos.'
    });
  }
  
  // Caso de uso genérico
  useCases.push({
    title: 'Automação de fluxos',
    description: 'Integre diferentes ferramentas para criar fluxos de trabalho contínuos sem intervenção manual.'
  });
  
  return useCases.map(useCase => `
    <div class="use-case-card">
      <div class="use-case-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3>${useCase.title}</h3>
      <p>${useCase.description}</p>
    </div>
  `).join('');
}

/**
 * Renderiza a seção "Recursos" da Mini-IA
 */
function renderFeaturesSection(miniai) {
  if (miniai.features && miniai.features.length > 0) {
    return miniai.features.map(feature => `
      <div class="feature-item">
        <div class="feature-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="feature-text">
          <h4>${feature.title}</h4>
          <p>${feature.description}</p>
        </div>
      </div>
    `).join('');
  }
  
  // Recursos padrão baseados no tipo de Mini-IA
  const features = [
    {
      title: 'Instalação com 1-click',
      description: 'Configure e comece a usar em minutos, sem conhecimentos técnicos necessários'
    },
    {
      title: 'Sincronização automática',
      description: 'Mantém seus dados sincronizados entre diferentes plataformas em tempo real'
    },
    {
      title: 'Alertas personalizáveis',
      description: 'Receba notificações importantes sobre eventos e ações específicas'
    },
    {
      title: 'Dashboard de monitoramento',
      description: 'Acompanhe o desempenho e atividades em um painel intuitivo'
    }
  ];
  
  return features.map(feature => `
    <div class="feature-item">
      <div class="feature-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="feature-text">
        <h4>${feature.title}</h4>
        <p>${feature.description}</p>
      </div>
    </div>
  `).join('');
}

/**
 * Renderiza a seção "Integrações" da Mini-IA
 */
function renderIntegrationsSection(miniai) {
  // Lista de integrações disponíveis (além das obrigatórias)
  const integrations = miniai.integrations || miniai.requiredServices || [];
  
  if (integrations.length === 0) {
    return '<p>Nenhuma integração adicional disponível no momento.</p>';
  }
  
  // Mapeamento de serviços populares para ícones
  const serviceIcons = {
    'gmail': 'https://www.gstatic.com/images/branding/product/1x/gmail_48dp.png',
    'google-sheets': 'https://www.gstatic.com/images/branding/product/1x/sheets_48dp.png',
    'google-drive': 'https://www.gstatic.com/images/branding/product/1x/drive_48dp.png',
    'google-calendar': 'https://www.gstatic.com/images/branding/product/1x/calendar_48dp.png',
    'google-docs': 'https://www.gstatic.com/images/branding/product/1x/docs_48dp.png',
    'trello': '/miniaihub/assets/img/integrations/trello.png',
    'slack': '/miniaihub/assets/img/integrations/slack.png',
    'asana': '/miniaihub/assets/img/integrations/asana.png',
    'github': '/miniaihub/assets/img/integrations/github.png',
    'notion': '/miniaihub/assets/img/integrations/notion.png',
    'dropbox': '/miniaihub/assets/img/integrations/dropbox.png',
    'stripe': '/miniaihub/assets/img/integrations/stripe.png',
    'hubspot': '/miniaihub/assets/img/integrations/hubspot.png',
    'mailchimp': '/miniaihub/assets/img/integrations/mailchimp.png',
    'zendesk': '/miniaihub/assets/img/integrations/zendesk.png'
  };
  
  return integrations.map(integration => {
    // Verificar se é um objeto ou string
    const serviceId = typeof integration === 'object' ? integration.id : integration;
    const serviceName = typeof integration === 'object' ? integration.name : formatServiceName(serviceId);
    const icon = typeof integration === 'object' ? integration.icon : 
                (serviceIcons[serviceId] || '/miniaihub/assets/img/integrations/default.png');
    
    return `
      <div class="integration-item">
        <div class="integration-icon">
          <img src="${icon}" alt="${serviceName}">
        </div>
        <div class="integration-name">${serviceName}</div>
      </div>
    `;
  }).join('');
}

/**
 * Renderiza a seção "Requisitos" da Mini-IA
 */
function renderRequirementsSection(miniai) {
  const requirements = miniai.requirements || [];
  
  if (requirements.length === 0) {
    // Requisitos padrão
    return `
      <li>Conta no MiniIA Hub</li>
      <li>Conexão com os serviços necessários</li>
      <li>Navegador moderno (Chrome, Firefox, Safari ou Edge)</li>
    `;
  }
  
  return requirements.map(req => `<li>${req}</li>`).join('');
}

/**
 * Renderiza a seção "Permissões" da Mini-IA
 */
function renderPermissionsSection(miniai) {
  const permissions = miniai.permissions || [];
  
  if (permissions.length === 0) {
    // Permissões padrão baseadas nos serviços necessários
    const defaultPermissions = [
      {
        name: 'Leitura de dados',
        description: 'Acesso para ler informações dos serviços conectados',
        icon: 'read'
      },
      {
        name: 'Criação de registros',
        description: 'Permite criar novos registros nos serviços conectados',
        icon: 'write'
      },
      {
        name: 'Envio de notificações',
        description: 'Envia alertas e lembretes através dos canais configurados',
        icon: 'notification'
      }
    ];
    
    return defaultPermissions.map(perm => `
      <div class="permission-item">
        <div class="permission-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="permission-content">
          <h4>${perm.name}</h4>
          <p>${perm.description}</p>
        </div>
      </div>
    `).join('');
  }
  
  return permissions.map(perm => `
    <div class="permission-item">
      <div class="permission-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="permission-content">
        <h4>${perm.name}</h4>
        <p>${perm.description}</p>
      </div>
    </div>
  `).join('');
}

/**
 * Renderiza o breakdown de avaliações
 */
function renderRatingsBreakdown(miniai) {
  // Gerar dados de exemplo para o breakdown de avaliações
  const ratings = miniai.ratingsBreakdown || generateRatingsBreakdown(miniai.stars || 4.5, miniai.reviews || 0);
  
  return Object.entries(ratings)
    .sort((a, b) => b[0] - a[0]) // Ordenar de 5 a 1 estrela
    .map(([stars, percent]) => `
      <div class="rating-bar">
        <div class="rating-label">${stars}★</div>
        <div class="rating-progress">
          <div class="rating-progress-fill" style="width: ${percent}%"></div>
        </div>
        <div class="rating-percent">${percent}%</div>
      </div>
    `).join('');
}

/**
 * Gera dados de exemplo para o breakdown de avaliações
 */
function generateRatingsBreakdown(averageRating, totalReviews) {
  if (totalReviews === 0) {
    return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  }
  
  // Gerar distribuição baseada na média
  let distribution = {};
  
  if (averageRating >= 4.5) {
    distribution = { 5: 65, 4: 25, 3: 7, 2: 2, 1: 1 };
  } else if (averageRating >= 4.0) {
    distribution = { 5: 45, 4: 40, 3: 10, 2: 3, 1: 2 };
  } else if (averageRating >= 3.5) {
    distribution = { 5: 30, 4: 35, 3: 25, 2: 7, 1: 3 };
  } else if (averageRating >= 3.0) {
    distribution = { 5: 20, 4: 30, 3: 35, 2: 10, 1: 5 };
  } else {
    distribution = { 5: 10, 4: 20, 3: 30, 2: 25, 1: 15 };
  }
  
  return distribution;
}

/**
 * Renderiza a lista de avaliações
 */
function renderReviewsList(miniai) {
  const reviews = miniai.reviews_list || [];
  
  if (reviews.length === 0) {
    return `
      <p class="empty-reviews">Ainda não há avaliações para esta Mini-IA. 
         Seja o primeiro a avaliar após a instalação!</p>
    `;
  }
  
  return reviews.map(review => {
    // Renderizar estrelas
    const stars = Array(5).fill().map((_, i) => 
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="${i < review.rating ? '#FFC107' : 'none'}" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#FFC107" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    ).join('');
    
    return `
      <div class="review-item">
        <div class="review-header">
          <div class="review-author">
            <div class="review-avatar">
              <img src="${review.authorAvatar || '/miniaihub/assets/img/user-placeholder.png'}" alt="${review.author}">
            </div>
            <div class="review-author-info">
              <h4>${review.author}</h4>
              <div class="review-date">${review.date}</div>
            </div>
          </div>
          <div class="review-rating">
            ${stars}
          </div>
        </div>
        <div class="review-content">
          <div class="review-text">${review.text}</div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Renderiza o preço da Mini-IA
 */
function renderPrice(miniai) {
  if (miniai.isFree || miniai.price === 0 || miniai.price === '0') {
    return 'Grátis';
  }
  
  if (typeof miniai.price === 'number') {
    return `R$ ${miniai.price.toFixed(2)}`;
  }
  
  return miniai.price || 'Grátis';
}

/**
 * Renderiza o período de cobrança
 */
function renderPricePeriod(miniai) {
  if (miniai.isFree || miniai.price === 0 || miniai.price === '0') {
    return '';
  }
  
  return miniai.pricePeriod || '/mês';
}

/**
 * Renderiza os serviços necessários
 */
function renderRequiredServices(miniai) {
  const requiredServices = miniai.requiredServices || [];
  
  if (requiredServices.length === 0) {
    return '<p>Esta Mini-IA não requer conexão com serviços externos.</p>';
  }
  
  // Mapeamento de serviços populares para ícones
  const serviceIcons = {
    'gmail': 'https://www.gstatic.com/images/branding/product/1x/gmail_48dp.png',
    'google-sheets': 'https://www.gstatic.com/images/branding/product/1x/sheets_48dp.png',
    'google-drive': 'https://www.gstatic.com/images/branding/product/1x/drive_48dp.png',
    'google-calendar': 'https://www.gstatic.com/images/branding/product/1x/calendar_48dp.png',
    'google-docs': 'https://www.gstatic.com/images/branding/product/1x/docs_48dp.png'
  };
  
  return requiredServices.map(service => {
    // Verificar se é um objeto ou string
    const serviceId = typeof service === 'object' ? service.id : service;
    const serviceName = typeof service === 'object' ? service.name : formatServiceName(serviceId);
    const icon = typeof service === 'object' ? service.icon : 
                (serviceIcons[serviceId] || '/miniaihub/assets/img/integrations/default.png');
    
    return `
      <div class="required-service" data-service-id="${serviceId}">
        <div class="required-service-icon">
          <img src="${icon}" alt="${serviceName}">
        </div>
        <div class="required-service-info">
          <div class="required-service-name">${serviceName}</div>
          <div class="required-service-status">Não conectado</div>
        </div>
        <div class="required-service-action">
          <button class="btn btn-sm btn-primary connect-service-btn">Conectar</button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Renderiza Mini-IAs relacionadas
 */
function renderRelatedMiniIAs(miniai) {
  const related = miniai.related || [];
  
  if (related.length === 0) {
    // Placeholder para quando não houver relacionados definidos
    return `
      <div class="miniai-card">
        <div class="miniai-image">
          <img src="/miniaihub/assets/img/placeholder.png" alt="E-mail Sorter">
        </div>
        <div class="miniai-content">
          <div class="miniai-tags">
            <span class="miniai-tag email">E-mail</span>
          </div>
          <h3>E-mail Sorter</h3>
          <p>Organiza seus e-mails automaticamente em categorias usando IA</p>
          <div class="miniai-footer">
            <div class="miniai-price">R$ 9/mês</div>
            <a href="/miniaihub/conector/email-sorter.html" class="btn btn-primary miniai-btn">Instalar</a>
          </div>
        </div>
      </div>
      
      <div class="miniai-card">
        <div class="miniai-image">
          <img src="/miniaihub/assets/img/placeholder.png" alt="Task Automator">
        </div>
        <div class="miniai-content">
          <div class="miniai-tags">
            <span class="miniai-tag crm">Tarefas</span>
          </div>
          <h3>Task Automator</h3>
          <p>Cria e atribui tarefas automaticamente com base em gatilhos</p>
          <div class="miniai-footer">
            <div class="miniai-price free">Grátis</div>
            <a href="/miniaihub/conector/task-automator.html" class="btn btn-primary miniai-btn">Instalar</a>
          </div>
        </div>
      </div>
    `;
  }
  
  return related.map(relatedMiniIA => {
    // Renderizar tags
    const tagsHtml = (relatedMiniIA.tags || []).map(tag => {
      // Determinar classe CSS baseado na tag
      let tagClass = 'miniai-tag';
      if (tag.toLowerCase().includes('crm')) tagClass += ' crm';
      else if (tag.toLowerCase().includes('email')) tagClass += ' email';
      else if (tag.toLowerCase().includes('pagamento')) tagClass += ' payments';
      
      return `<span class="${tagClass}">${tag}</span>`;
    }).join('');
    
    // Renderizar preço
    let priceHtml = '';
    if (relatedMiniIA.isFree || relatedMiniIA.price === 0 || relatedMiniIA.price === '0') {
      priceHtml = '<div class="miniai-price free">Grátis</div>';
    } else {
      priceHtml = `<div class="miniai-price">${relatedMiniIA.price}</div>`;
    }
    
    return `
      <div class="miniai-card">
        <div class="miniai-image">
          <img src="${relatedMiniIA.image || '/miniaihub/assets/img/placeholder.png'}" alt="${relatedMiniIA.name}">
        </div>
        <div class="miniai-content">
          <div class="miniai-tags">
            ${tagsHtml}
          </div>
          <h3>${relatedMiniIA.name}</h3>
          <p>${relatedMiniIA.description}</p>
          <div class="miniai-footer">
            ${priceHtml}
            <a href="/miniaihub/conector/${relatedMiniIA.id}.html" class="btn btn-primary miniai-btn">Instalar</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Formata o nome do serviço a partir do ID
 */
function formatServiceName(serviceId) {
  const nameMap = {
    'gmail': 'Gmail',
    'google-sheets': 'Google Sheets',
    'google-drive': 'Google Drive',
    'google-calendar': 'Google Calendar',
    'google-docs': 'Google Docs',
    'trello': 'Trello',
    'slack': 'Slack',
    'asana': 'Asana',
    'github': 'GitHub',
    'notion': 'Notion',
    'dropbox': 'Dropbox',
    'stripe': 'Stripe',
    'hubspot': 'HubSpot',
    'mailchimp': 'Mailchimp',
    'zendesk': 'Zendesk'
  };
  
  if (nameMap[serviceId]) {
    return nameMap[serviceId];
  }
  
  // Formatar de kebab-case para Title Case
  return serviceId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formata números grandes para exibição
 */
function formatNumber(num) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

// Iniciar execução
main();
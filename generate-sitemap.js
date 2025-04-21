const { Octokit } = require('@octokit/rest');
const fs = require('fs-extra');
const xmlFormatter = require('xml-formatter');

// Configuração
const owner = 'lAutomatize';  // Seu username
const repo = 'site';          // Nome do repositório
const baseDomain = 'https://iautomatize.com';
const mainBranch = 'main';
const blogPath = 'blog';      // Caminho da pasta blog

async function generateSitemap() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  try {
    // Buscar os arquivos HTML na pasta blog
    const { data: contents } = await octokit.repos.getContent({
      owner,
      repo,
      path: blogPath,
      ref: mainBranch
    });

    // Iniciar o XML do sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Filtrar apenas arquivos HTML
    const htmlFiles = contents.filter(item => 
      item.type === 'file' && item.name.endsWith('.html')
    );

    // Data de hoje para lastmod
    const today = new Date().toISOString().split('T')[0];
    
    // Adicionar cada arquivo HTML ao sitemap
    for (const file of htmlFiles) {
      const url = `${baseDomain}/${blogPath}/${file.name}`;
      
      sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    sitemap += `
</urlset>`;

    // Formatar o XML para melhor legibilidade
    const formattedXml = xmlFormatter(sitemap, { indentation: '  ' });
    
    // Salvar o arquivo sitemap.xml
    await fs.writeFile('sitemap.xml', formattedXml);
    console.log('Sitemap gerado com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    process.exit(1);
  }
}

generateSitemap().catch(error => {
  console.error(error);
  process.exit(1);
});

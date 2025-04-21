const { Octokit } = require('@octokit/rest');
const fs = require('fs-extra');
const xmlFormatter = require('xml-formatter');

// Configuração
const owner = 'lAutomatize';  // Seu nome de usuário
const repo = 'site';          // Nome do repositório
const baseDomain = 'https://iautomatize.com';
const mainBranch = 'main';
const blogPath = 'blog';      // Caminho da pasta blog

async function generateSitemap() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  // Buscar apenas os arquivos da pasta blog
  const { data: contents } = await octokit.repos.getContent({
    owner,
    repo,
    path: blogPath,
    ref: mainBranch
  });

  // Iniciar o XML do sitemap
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Processar arquivos da pasta blog
  const processedFiles = await processContents(octokit, contents, blogPath);
  
  // Adicionar cada URL ao sitemap
  for (const file of processedFiles) {
    if (file.endsWith('.html')) {
      const path = file.replace(`${blogPath}/`, '').replace('index.html', '');
      const url = `${baseDomain}/${blogPath}/${path}`;
      
      sitemap += `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;
    }
  }

  sitemap += `
</urlset>`;

  // Formatar o XML para melhor legibilidade
  const formattedXml = xmlFormatter(sitemap, { indentation: '  ' });
  
  // Salvar o arquivo sitemap.xml
  await fs.writeFile('sitemap.xml', formattedXml);
  console.log('Sitemap gerado com sucesso apenas com URLs da pasta blog!');
}

async function processContents(octokit, contents, currentPath) {
  let files = [];
  
  for (const item of contents) {
    const path = `${currentPath}/${item.name}`;
    
    if (item.type === 'file' && item.name.endsWith('.html')) {
      files.push(path);
    } else if (item.type === 'dir') {
      // Buscar conteúdo do subdiretório dentro do blog
      const { data: subContents } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: mainBranch
      });
      
      // Processo recursivo para subdiretórios
      const subFiles = await processContents(octokit, subContents, path);
      files = [...files, ...subFiles];
    }
  }
  
  return files;
}

generateSitemap().catch(console.error);

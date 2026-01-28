import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const allowedExtensions = ['.html', '.css', '.js', '.json', '.xml', '.txt', '.md'];
const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico'];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== '.git' && file !== 'node_modules') {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

console.log("Starting scan...");
const files = getAllFiles(rootDir);
let changedFiles = 0;
let totalReplacements = 0;

files.forEach(filePath => {
  const ext = path.extname(filePath).toLowerCase();
  
  // Skip this script itself
  if (filePath === __filename) return;

  if (!allowedExtensions.includes(ext)) {
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    const regex = /iautomatize\.com([^\s"'<>\)]*)/gi;

    content = content.replace(regex, (match, p1) => {
        const hasImageExt = imageExtensions.some(imgExt => {
            return p1.toLowerCase().includes(imgExt);
        });

        if (hasImageExt) {
            totalReplacements++;
            return 'iautomatize.pro' + p1;
        }
        return match;
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
      changedFiles++;
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
});

console.log(`Finished! Changed ${changedFiles} files with ${totalReplacements} replacements.`);

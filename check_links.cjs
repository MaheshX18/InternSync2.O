const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let routes = [];
let appTsx = fs.readFileSync('src/App.tsx', 'utf-8');
const routeRegex = /<Route[^>]*path=["']([^"']+)["']/g;
let match;
while ((match = routeRegex.exec(appTsx)) !== null) {
  routes.push(match[1]);
}

let badLinks = [];
walkDir('src/pages', (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const linkRegex = /<Link[^>]*to=["']([^"']+)["']/g;
    let m;
    while ((m = linkRegex.exec(content)) !== null) {
      let route = m[1];
      if (!routes.includes(route) && !route.includes(':') && !route.includes('?') && !route.includes('#') && route !== '/' && !route.startsWith('mailto')) {
        if (!route.includes('${')) {
            badLinks.push({ file: filePath, route: route });
        }
      }
    }
  }
});
console.log('Bad links:', badLinks);

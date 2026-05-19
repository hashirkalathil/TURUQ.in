const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('useCallback') && !content.includes('import') && !content.includes('require')) {
        // This is a bit naive, but let's see
        console.log(`Potential issue in ${file}: contains useCallback but no import/require`);
    } else if (content.includes('useCallback')) {
        const lines = content.split('\n');
        const reactImport = lines.find(line => line.includes('import') && line.includes('react'));
        if (reactImport && !reactImport.includes('useCallback') && !content.includes('React.useCallback')) {
            console.log(`ISSUE: ${file} uses useCallback but it's missing from React import: ${reactImport}`);
        }
    }
});

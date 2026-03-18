const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'dashboard', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);

for (const file of files) {
    // Only process files that import createClient from server
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('@/utils/supabase/server') && content.includes('createClient()')) {
        let newContent = content.replace(/createClient\(\)/g, 'await createClient()');
        
        // Ensure the containing function is async if it contains await
        // If it's a page or layout component exported as default
        newContent = newContent.replace(/export default function ([A-Za-z0-9_]+)\(/g, 'export default async function $1(');
        
        // Write the changes
        if (content !== newContent) {
            fs.writeFileSync(file, newContent);
            console.log(`Updated ${file}`);
        }
    }
}

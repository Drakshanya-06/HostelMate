const fs = require('fs');
const path = require('path');

const directoryPaths = [
    path.join(__dirname, 'src', 'components'),
    path.join(__dirname, 'src', 'pages'),
    path.join(__dirname, 'src')
];

const classMap = {
    // Decrease font weight mapping
    'font-extrabold': 'font-bold',
    'font-bold': 'font-semibold',
    'font-semibold': 'font-medium',
    'font-medium': 'font-normal',
};

const processFile = (filePath) => {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modifications = 0;

    for (const [oldClass, newClass] of Object.entries(classMap)) {
        // use word boundaries
        let patternStr = oldClass;
        
        // negative lookahead/lookbehind
        const regex = new RegExp(`(?<![a-zA-Z\\-])` + patternStr + `(?![a-zA-Z\\-])`, 'g');
        
        const before = content;
        content = content.replace(regex, newClass);
        if (before !== content) modifications++;
    }

    if (modifications > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
};

const processDirectory = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && file !== 'node_modules') {
            // not recursing deeper for this project structure
        } else if (stat.isFile()) {
            processFile(fullPath);
        }
    }
};

directoryPaths.forEach(dir => {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
});
console.log('Font weight replacement completely done.');

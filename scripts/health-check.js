const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'server.js',
  path.join('public', 'index.html'),
  path.join('public', 'app.js'),
  path.join('public', 'styles.css'),
];

const requiredMarkers = [
  'id="add-picture-form"',
  'id="add-friend-form"',
  'id="gallery-grid"',
  'id="friend-list"',
];

for (const file of requiredFiles) {
  const target = path.join(__dirname, '..', file);
  if (!fs.existsSync(target)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const index = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
for (const marker of requiredMarkers) {
  if (!index.includes(marker)) {
    throw new Error(`Missing required element in index.html: ${marker}`);
  }
}

console.log('Health check passed: core files and form markers are present.');

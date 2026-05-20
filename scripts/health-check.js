const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const requiredFiles = [
  'server.js',
  path.join('public', 'index.html'),
  path.join('public', 'directory.html'),
  path.join('public', 'programs.html'),
  path.join('public', 'app.js'),
  path.join('public', 'styles.css'),
  path.join('public', 'manifest.webmanifest'),
  path.join('public', 'service-worker.js'),
  path.join('public', 'icon.svg'),
];

const pageMarkers = {
  [path.join('public', 'index.html')]: [
    'data-page="home"',
    'id="profile-form"',
    'id="quick-connection-form"',
    'id="home-checkin-form"',
    'href="directory.html"',
    'href="programs.html"',
  ],
  [path.join('public', 'directory.html')]: [
    'data-page="directory"',
    'id="directory-filters"',
    'id="person-form"',
    'id="custom-resource-form"',
    'id="resource-grid"',
    'id="people-list"',
  ],
  [path.join('public', 'programs.html')]: [
    'data-page="programs"',
    'id="plan-form"',
    'id="message-form"',
    'id="loop-form"',
    'id="plan-output"',
    'id="checkin-feed"',
  ],
  [path.join('public', 'app.js')]: [
    'resource-211',
    'generatePlan',
    'composeMessage',
    'registerServiceWorker',
  ],
  [path.join('server.js')]: [
    '/healthz',
    '/directory',
    '/programs',
  ],
};

for (const file of requiredFiles) {
  const target = path.join(root, file);
  if (!fs.existsSync(target)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

for (const [file, markers] of Object.entries(pageMarkers)) {
  const target = path.join(root, file);
  const content = fs.readFileSync(target, 'utf8');
  for (const marker of markers) {
    if (!content.includes(marker)) {
      throw new Error(`Missing required marker in ${file}: ${marker}`);
    }
  }
}

JSON.parse(fs.readFileSync(path.join(root, 'public', 'manifest.webmanifest'), 'utf8'));

console.log('Health check passed: Reconnect Directory pages, routes, PWA assets, and AI program hooks are present.');

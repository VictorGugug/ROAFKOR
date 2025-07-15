const fs = require('fs');
const path = require('path');

const versionsPath = path.join(process.cwd(), 'versions.json');

const release = process.env.GITHUB_REF_NAME || process.env.GITHUB_REF?.split('/').pop();
const releaseNotes = process.env.GITHUB_EVENT_RELEASE_BODY || '';
const releaseUrl = process.env.GITHUB_EVENT_RELEASE_ASSETS_URL || '';
const releaseDate = new Date().toISOString().slice(0, 10);

// Cargar versions.json existente
let versions = [];
if (fs.existsSync(versionsPath)) {
  try {
    versions = JSON.parse(fs.readFileSync(versionsPath, 'utf8'));
  } catch (e) {
    versions = [];
  }
}

// Obtener datos de la release desde el contexto de GitHub Actions
const githubEventPath = process.env.GITHUB_EVENT_PATH;
let assetUrl = '';
let notes = '';
if (githubEventPath && fs.existsSync(githubEventPath)) {
  const event = JSON.parse(fs.readFileSync(githubEventPath, 'utf8'));
  if (event.release) {
    notes = event.release.body || '';
    const asset = event.release.assets && event.release.assets[0];
    if (asset) {
      assetUrl = asset.browser_download_url;
    }
  }
}

if (!release) {
  console.error('No se detectó el nombre de la release.');
  process.exit(1);
}

const newVersion = {
  version: release.replace(/^v/, ''),
  date: releaseDate,
  notes: notes || 'Sin notas.',
  url: assetUrl || '',
};

// Evitar duplicados
const exists = versions.some(v => v.version === newVersion.version);
if (!exists) {
  versions.unshift(newVersion);
  fs.writeFileSync(versionsPath, JSON.stringify(versions, null, 2), 'utf8');
  console.log('versions.json actualizado con la nueva versión.');
} else {
  console.log('La versión ya existe en versions.json.');
}

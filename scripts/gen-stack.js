// Generates assets/stack.svg from stack.json.
// Usage: npm i --no-save simple-icons@13 && node scripts/gen-stack.js
const fs = require('fs');
const path = require('path');
const icons = require('simple-icons');

const root = path.join(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'stack.json'), 'utf8'));

const W = 1200, PAD = 48, GAP = 16, TOP = 84, COLS = cfg.columns || 3;
const CARD_W = (W - PAD * 2 - GAP * (COLS - 1)) / COLS;
const HEAD = 52, ROW = 36, BOTTOM = 14;
const SANS = "'Segoe UI', Ubuntu, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'JetBrains Mono', Consolas, monospace";

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const key = slug => 'si' + slug.charAt(0).toUpperCase() + slug.slice(1);

// Colors too dark to read on #161b22 get a light fallback.
function luminance(hex) {
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const rows = [];
for (let i = 0; i < cfg.categories.length; i += COLS) rows.push(cfg.categories.slice(i, i + COLS));

let y = TOP, body = '';
for (const row of rows) {
  const h = HEAD + Math.max(...row.map(c => c.items.length)) * ROW + BOTTOM;
  row.forEach((cat, i) => {
    const x = PAD + i * (CARD_W + GAP);
    body += `  <g transform="translate(${x.toFixed(1)} ${y})">\n`;
    body += `    <rect x="0.5" y="0.5" width="${(CARD_W - 1).toFixed(1)}" height="${h - 1}" rx="10" fill="#161b22" stroke="#21262d"/>\n`;
    body += `    <text x="20" y="32" fill="#8b949e" font-size="14" font-family="${MONO}">${esc(cat.name)}</text>\n`;
    cat.items.forEach((it, j) => {
      const ic = icons[key(it.icon)];
      if (!ic) throw new Error(`Unknown simple-icons slug: ${it.icon}`);
      const hex = it.color || (luminance(ic.hex) < 0.25 ? 'e6edf3' : ic.hex);
      const iy = HEAD + j * ROW;
      body += `    <g transform="translate(20 ${iy + 1}) scale(0.75)"><path d="${ic.path}" fill="#${hex}"/></g>\n`;
      body += `    <text x="50" y="${iy + 15}" fill="#e6edf3" font-size="16" font-family="${SANS}">${esc(it.name)}</text>\n`;
    });
    body += `  </g>\n`;
  });
  y += h + GAP;
}

const H = y - GAP + 40;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tech stack">
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="16" fill="#0d1117" stroke="#30363d"/>
  <line x1="1" y1="52.5" x2="${W - 1}" y2="52.5" stroke="#21262d"/>
  <circle cx="32" cy="26" r="5" fill="#30363d"/><circle cx="50" cy="26" r="5" fill="#30363d"/><circle cx="68" cy="26" r="5" fill="#30363d"/>
  <text x="${W / 2}" y="31" text-anchor="middle" fill="#6e7681" font-size="14" font-family="${MONO}">${esc(cfg.title)}</text>
${body}</svg>
`;

fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
fs.writeFileSync(path.join(root, 'assets', 'stack.svg'), svg);
console.log(`assets/stack.svg: ${cfg.categories.length} categories, ${W}x${H}`);

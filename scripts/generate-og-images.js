const sharp = require('sharp');
const path = require('path');

// Pixel art icons: each '1' = one 26×26 pixel block
const ICONS = {
  autos: {
    label: 'AUTOS',
    grid: [
      '000111110000',
      '011111111110',
      '111111111111',
      '111111111111',
      '011011001101',
      '001011001010',
    ],
  },
  tecnologia: {
    label: 'TECHNOLOGY',
    grid: [
      '111111111111',
      '100000000001',
      '101111111101',
      '101111111101',
      '101111111101',
      '100000000001',
      '111111111111',
      '000111111000',
      '001111111100',
    ],
  },
  peliculas: {
    label: 'MOVIES',
    grid: [
      '111111111111',
      '101101101101',
      '111111111111',
      '110000000011',
      '110000000011',
      '110000000011',
      '111111111111',
      '101101101101',
      '111111111111',
    ],
  },
  musica: {
    label: 'MUSIC',
    grid: [
      '000011111111',
      '000011000000',
      '000011000000',
      '000011000000',
      '111011000000',
      '111011000000',
      '011100000000',
    ],
  },
  comida: {
    label: 'FOOD',
    grid: [
      '000000100000000',
      '000001110000000',
      '000011111000000',
      '000111010100000',
      '001110101010000',
      '011111111111000',
      '111111111111100',
    ],
  },
};

const PIXEL = 26;
const ORANGE = '#ff5500';

function renderPixelIcon(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const rects = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        rects.push(
          `<rect x="${c * PIXEL}" y="${r * PIXEL}" width="${PIXEL - 1}" height="${PIXEL - 1}" fill="${ORANGE}"/>`
        );
      }
    }
  }
  return { svg: rects.join(''), width: cols * PIXEL, height: rows * PIXEL };
}

function buildSvg({ label, grid }) {
  const icon = renderPixelIcon(grid);
  const iconX = 80;
  const iconY = Math.round((630 - 60 - icon.height) / 2);

  // dot grid texture
  const dots = [];
  for (let row = 0; row < 21; row++) {
    for (let col = 0; col < 41; col++) {
      dots.push(`<rect x="${col * 30 + 6}" y="${row * 30 + 6}" width="2" height="2" fill="#ffffff" opacity="0.04"/>`);
    }
  }

  return `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="630" fill="#0d0d0d"/>

  <!-- Dot grid texture -->
  ${dots.join('')}

  <!-- Left accent bar -->
  <rect x="0" y="0" width="12" height="630" fill="${ORANGE}"/>

  <!-- Bottom bar -->
  <rect x="0" y="570" width="1200" height="60" fill="${ORANGE}"/>
  <text x="40" y="612" font-family="'Arial Black',Arial,sans-serif" font-size="26" font-weight="900" fill="#ffffff" letter-spacing="2">top3news</text>
  <text x="272" y="612" font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="rgba(255,255,255,0.75)" letter-spacing="1">· What matters today</text>

  <!-- Vertical badge top-right -->
  <rect x="${1200 - label.length * 19 - 60}" y="36" width="${label.length * 19 + 40}" height="48" fill="${ORANGE}"/>
  <text x="${1200 - label.length * 19 - 40}" y="70" font-family="'Arial Black',Arial,sans-serif" font-size="20" font-weight="900" fill="#ffffff" letter-spacing="3">${label}</text>

  <!-- Pixel art icon -->
  <g transform="translate(${iconX}, ${iconY})">
    ${icon.svg}
  </g>

  <!-- Decorative pixel squares -->
  <rect x="700" y="80"  width="14" height="14" fill="${ORANGE}" opacity="0.7"/>
  <rect x="722" y="80"  width="14" height="14" fill="${ORANGE}" opacity="0.3"/>
  <rect x="700" y="102" width="14" height="14" fill="${ORANGE}" opacity="0.3"/>
  <rect x="1100" y="460" width="18" height="18" fill="${ORANGE}" opacity="0.5"/>
  <rect x="1126" y="460" width="18" height="18" fill="${ORANGE}" opacity="0.2"/>
  <rect x="1100" y="486" width="18" height="18" fill="${ORANGE}" opacity="0.2"/>

  <!-- Wordmark -->
  <text x="660" y="330" font-family="'Arial Black',Arial,sans-serif" font-size="80" font-weight="900" fill="#ffffff">top</text>
  <text x="808" y="330" font-family="'Arial Black',Arial,sans-serif" font-size="80" font-weight="900" fill="${ORANGE}">3</text>
  <text x="855" y="330" font-family="'Arial Black',Arial,sans-serif" font-size="80" font-weight="900" fill="#ffffff">news</text>
  <text x="660" y="390" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="rgba(255,255,255,0.45)" letter-spacing="6">${label}</text>
</svg>`;
}

async function generate() {
  for (const [id, v] of Object.entries(ICONS)) {
    const svg = Buffer.from(buildSvg(v));
    const outPath = path.join(__dirname, '..', 'public', 'og', `${id}.png`);
    await sharp(svg).png().toFile(outPath);
    console.log(`✓ ${id}.png`);
  }
  console.log('Done.');
}

generate().catch(console.error);

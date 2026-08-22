import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const logoPath = path.join(rootDir, 'src', 'images', 'logo.png');
const iconsDir = path.join(rootDir, 'public', 'icons');

const BRAND_BG = { r: 11, g: 23, b: 57, alpha: 1 };

const ensureDir = () => {
  fs.mkdirSync(iconsDir, { recursive: true });
};

const squareLogo = async (size, paddingRatio = 0.12) => {
  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND_BG,
    },
  });
  const inner = Math.round(size * (1 - paddingRatio * 2));
  const logo = await sharp(logoPath).resize(inner, inner, { fit: 'contain', background: BRAND_BG }).png().toBuffer();
  return canvas
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toBuffer();
};

const maskableLogo = async (size) => squareLogo(size, 0.2);

const run = async () => {
  if (!fs.existsSync(logoPath)) {
    console.error('Logo not found:', logoPath);
    process.exit(1);
  }
  ensureDir();

  const sizes = [
    ['icon-192.png', 192, squareLogo],
    ['icon-512.png', 512, squareLogo],
    ['icon-512-maskable.png', 512, maskableLogo],
    ['apple-touch-icon.png', 180, squareLogo],
  ];

  for (const [name, size, fn] of sizes) {
    const buffer = await fn(size);
    fs.writeFileSync(path.join(iconsDir, name), buffer);
    console.log('created', name);
  }

  const favicon32 = await squareLogo(32, 0.1);
  fs.writeFileSync(path.join(rootDir, 'public', 'favicon-32.png'), favicon32);
  fs.writeFileSync(path.join(rootDir, 'public', 'favicon-192.png'), await squareLogo(192, 0.12));
  console.log('created favicon assets');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

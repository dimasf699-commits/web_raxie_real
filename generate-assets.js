const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, 'public');

async function generateAssets() {
  const iconSrc = path.join(__dirname, 'src', 'app', 'icon.png');
  
  // Generate PWA icons from existing icon.png
  if (fs.existsSync(iconSrc)) {
    console.log('Generating PWA icons from src/app/icon.png...');
    
    await sharp(iconSrc)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✓ icon-192.png');
    
    await sharp(iconSrc)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✓ icon-512.png');
  } else {
    console.error('✗ src/app/icon.png not found!');
  }

  // Generate OG image (1200x630) - branded dark background with gold text
  console.log('Generating og-image.png...');
  const width = 1200;
  const height = 630;
  
  const svgContent = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#1a0f0a"/>
    <text x="50%" y="42%" 
      font-family="Georgia, 'Times New Roman', serif" 
      font-size="120" 
      font-weight="bold"
      fill="#C19A6B"
      text-anchor="middle" 
      dominant-baseline="middle"
      letter-spacing="20">RAXIE</text>
    <text x="50%" y="62%" 
      font-family="'Segoe UI', Arial, sans-serif" 
      font-size="28" 
      fill="#8a7560"
      text-anchor="middle" 
      dominant-baseline="middle"
      letter-spacing="8">PREMIUM LEATHER WALLETS &amp; ACCESSORIES</text>
    <line x1="400" y1="520" x2="800" y2="520" stroke="#C19A6B" stroke-width="1" opacity="0.4"/>
    <text x="50%" y="570" 
      font-family="'Segoe UI', Arial, sans-serif" 
      font-size="18" 
      fill="#6b5c4d"
      text-anchor="middle" 
      dominant-baseline="middle"
      letter-spacing="4">raxie.id</text>
  </svg>`;

  await sharp(Buffer.from(svgContent))
    .resize(width, height)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('✓ og-image.png');

  console.log('\nAll assets generated successfully!');
}

generateAssets().catch(console.error);

/**
 * Icon Generator for Raxie
 * Run: node generate-icons.js
 * Requires: sharp (already installed)
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#1a0f0a"/>
  <text x="50%" y="54%" 
    font-family="Georgia, 'Times New Roman', serif" 
    font-size="320" 
    font-weight="bold"
    fill="#C19A6B"
    text-anchor="middle" 
    dominant-baseline="middle"
    letter-spacing="-10">R</text>
</svg>`;

const svgBuffer = Buffer.from(svgContent);
const publicDir = __dirname;

async function generateIcons() {
  console.log('🎨 Generating Raxie icons...');

  // icon-192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✅ icon-192.png');

  // icon-512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✅ icon-512.png');

  // apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ apple-touch-icon.png');

  // favicon-16x16.png
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('✅ favicon-16x16.png');

  // favicon-32x32.png
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✅ favicon-32x32.png');

  // favicon.ico (using 32x32 as .ico)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✅ favicon.ico');

  // OG Image (1200x630)
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <pattern id="leather" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="#1a0f0a"/>
        <rect x="0" y="0" width="20" height="20" fill="#1e1208" opacity="0.5"/>
        <rect x="20" y="20" width="20" height="20" fill="#1e1208" opacity="0.5"/>
      </pattern>
    </defs>
    <rect width="1200" height="630" fill="url(#leather)"/>
    <rect width="1200" height="630" fill="#1a0f0a" opacity="0.7"/>
    <!-- Decorative line -->
    <line x1="0" y1="100" x2="1200" y2="100" stroke="#C19A6B" stroke-width="1" opacity="0.3"/>
    <line x1="0" y1="530" x2="1200" y2="530" stroke="#C19A6B" stroke-width="1" opacity="0.3"/>
    <!-- R Logo -->
    <text x="200" y="390" 
      font-family="Georgia, serif" 
      font-size="280" 
      font-weight="bold"
      fill="#C19A6B"
      text-anchor="middle"
      opacity="0.9">R</text>
    <!-- Divider -->
    <line x1="360" y1="180" x2="360" y2="450" stroke="#C19A6B" stroke-width="1" opacity="0.4"/>
    <!-- Brand Name -->
    <text x="760" y="290" 
      font-family="Georgia, serif" 
      font-size="120" 
      font-weight="bold"
      fill="#FAF8F5"
      text-anchor="middle"
      letter-spacing="20">RAXIE</text>
    <!-- Tagline -->
    <text x="760" y="380" 
      font-family="Georgia, serif" 
      font-size="32" 
      fill="#C19A6B"
      text-anchor="middle"
      letter-spacing="5">PREMIUM LEATHER GOODS</text>
    <!-- Sub tagline -->
    <text x="760" y="430" 
      font-family="Georgia, serif" 
      font-size="24" 
      fill="#8a7060"
      text-anchor="middle"
      letter-spacing="3">Handcrafted · Timeless · Modern</text>
  </svg>`;

  await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'og-image.jpg'));
  console.log('✅ og-image.jpg');

  console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);

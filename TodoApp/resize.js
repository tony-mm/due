const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, 'assets', 'icon.png');
const assetsDir = path.join(__dirname, 'assets');

async function resize() {
  const originalImage = sharp(inputPath);
  const metadata = await originalImage.metadata();
  console.log('Original size:', metadata.width, 'x', metadata.height);

  await Promise.all([
    sharp(inputPath)
      .resize(48, 48)
      .png()
      .toFile(path.join(assetsDir, 'favicon.png')),
    
    sharp(inputPath)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png')),
  ]);

  // Splash icon: iPhone size (1284x2778) with centered logo
  await sharp({
    create: {
      width: 1284,
      height: 2778,
      channels: 4,
      background: { r: 250, g: 250, b: 250, alpha: 1 }
    }
  })
    .composite([{
      input: inputPath,
      gravity: 'center'
    }])
    .png()
    .toFile(path.join(assetsDir, 'splash-icon.png'));

  console.log('Done! Icons created.');
}

resize().catch(console.error);
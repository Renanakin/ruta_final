import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, parse } from 'path';

const IMAGES_DIR = './public/images';

const configs = {
  'HERO': { width: 1920, quality: 80 },
  'MEMBRESIA': { width: 1920, quality: 80 },
  'HUEVOS EXTRA': { width: 800, quality: 82 },
  'HUEVOS GALLINA FELIZ': { width: 800, quality: 82 },
  'HUEVO OMEGA3': { width: 800, quality: 82 },
  'HUEVO_MEMBRESIA': { width: 800, quality: 82 },
};

async function optimizeImages() {
  const files = await readdir(IMAGES_DIR);
  const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));

  console.log(`Found ${pngFiles.length} PNG files to convert\n`);

  for (const file of pngFiles) {
    const inputPath = join(IMAGES_DIR, file);
    const { name } = parse(file);
    const safeName = name.replace(/\s+/g, '_');
    const outputPath = join(IMAGES_DIR, `${safeName}.webp`);

    const config = configs[name] || { width: 800, quality: 80 };
    const originalSize = (await stat(inputPath)).size;

    await sharp(inputPath)
      .resize(config.width, null, { withoutEnlargement: true })
      .webp({ quality: config.quality })
      .toFile(outputPath);

    const newSize = (await stat(outputPath)).size;
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

    console.log(`✓ ${file}`);
    console.log(`  → ${safeName}.webp`);
    console.log(`  ${(originalSize / 1024).toFixed(0)} KB → ${(newSize / 1024).toFixed(0)} KB (${savings}% smaller)\n`);
  }

  // Generate OG image (1200x630) from HERO
  const ogPath = join(IMAGES_DIR, 'og-image.png');
  await sharp(join(IMAGES_DIR, 'HERO.png'))
    .resize(1200, 630, { fit: 'cover' })
    .png({ quality: 85 })
    .toFile(ogPath);
  
  const ogSize = (await stat(ogPath)).size;
  console.log(`✓ OG Image created: og-image.png (${(ogSize / 1024).toFixed(0)} KB)`);
}

optimizeImages().catch(console.error);

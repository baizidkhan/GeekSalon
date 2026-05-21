/**
 * Build-time image converter: PNG/JPG → AVIF + WebP
 * Runs as prebuild step. Skips files that are already up-to-date.
 * AVIF is served to modern browsers; WebP is used as CSS image-set fallback.
 */
import sharp from 'sharp'
import { existsSync, statSync } from 'fs'
import { join, dirname, basename, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const images = [
  { input: 'BannerImage.png',       avifQuality: 65, webpQuality: 72 },
  { input: 'our-mission.png',       avifQuality: 65, webpQuality: 72 },
  { input: 'BeginYourJourney.png',  avifQuality: 68, webpQuality: 75 },
  { input: 'hero-bg.jpg',           avifQuality: 68, webpQuality: 75 },
  { input: 'package-details.avif',  avifQuality: 65, webpQuality: 72, skipAvif: true },
]

function isStale(inputPath, outputPath) {
  if (!existsSync(outputPath)) return true
  return statSync(inputPath).mtimeMs > statSync(outputPath).mtimeMs
}

let converted = 0
let skipped = 0

for (const { input, avifQuality, webpQuality, skipAvif } of images) {
  const inputPath = join(publicDir, input)
  if (!existsSync(inputPath)) {
    console.warn(`⚠  Skipping ${input} — file not found`)
    continue
  }

  const stem = basename(input, extname(input))
  const avifOut = join(publicDir, `${stem}.avif`)
  const webpOut = join(publicDir, `${stem}.webp`)

  const needsAvif = !skipAvif && (isStale(inputPath, avifOut) || extname(input) === '.avif')
  const needsWebp = isStale(inputPath, webpOut)

  if (!needsAvif && !needsWebp) {
    console.log(`  ↩  ${input} already up-to-date`)
    skipped++
    continue
  }

  try {
    const src = sharp(inputPath)

    if (needsAvif) {
      await src.clone().avif({ quality: avifQuality, effort: 6 }).toFile(avifOut)
    }
    if (needsWebp) {
      await src.clone().webp({ quality: webpQuality, effort: 6 }).toFile(webpOut)
    }

    console.log(`  ✓  ${input} → ${stem}.avif + ${stem}.webp`)
    converted++
  } catch (err) {
    console.error(`  ✗  Failed to convert ${input}:`, err.message)
  }
}

console.log(`\nImage conversion done: ${converted} converted, ${skipped} skipped.\n`)

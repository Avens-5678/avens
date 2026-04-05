import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "public", "icon-source.svg");

const ANDROID_SIZES = [
  { name: "mipmap-mdpi", size: 48 },
  { name: "mipmap-hdpi", size: 72 },
  { name: "mipmap-xhdpi", size: 96 },
  { name: "mipmap-xxhdpi", size: 144 },
  { name: "mipmap-xxxhdpi", size: 192 },
];

const IOS_SIZES = [
  { size: 20, scales: [1, 2, 3] },
  { size: 29, scales: [1, 2, 3] },
  { size: 40, scales: [1, 2, 3] },
  { size: 60, scales: [2, 3] },
  { size: 76, scales: [1, 2] },
  { size: 83.5, scales: [2] },
  { size: 1024, scales: [1] },
];

async function generateAndroid() {
  for (const { name, size } of ANDROID_SIZES) {
    const dir = join(ROOT, "android", "app", "src", "main", "res", name);
    mkdirSync(dir, { recursive: true });
    await sharp(SRC).resize(size, size).png().toFile(join(dir, "ic_launcher.png"));
    await sharp(SRC).resize(size, size).png().toFile(join(dir, "ic_launcher_round.png"));
    // Foreground (slightly smaller for adaptive icon)
    const fg = Math.round(size * 0.6);
    const fgBuf = await sharp(SRC).resize(fg, fg).png().toBuffer();
    const fgComposite = await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    }).composite([{ input: fgBuf }]).png().toFile(join(dir, "ic_launcher_foreground.png"));
    console.log(`  Android ${name}: ${size}x${size}`);
  }
}

async function generateIOS() {
  const assetDir = join(ROOT, "ios", "App", "App", "Assets.xcassets", "AppIcon.appiconset");
  mkdirSync(assetDir, { recursive: true });

  const images = [];
  for (const { size, scales } of IOS_SIZES) {
    for (const scale of scales) {
      const px = Math.round(size * scale);
      const filename = `AppIcon-${px}.png`;
      await sharp(SRC).resize(px, px).png().toFile(join(assetDir, filename));
      images.push({
        size: `${size}x${size}`,
        idiom: size === 1024 ? "ios-marketing" : "universal",
        filename,
        scale: `${scale}x`,
      });
      console.log(`  iOS ${filename}: ${px}x${px}`);
    }
  }

  const contents = {
    images,
    info: { version: 1, author: "xcode" },
  };
  writeFileSync(join(assetDir, "Contents.json"), JSON.stringify(contents, null, 2));
}

async function generateSplash() {
  // Android splash screens
  const splashSizes = [
    { dir: "drawable-port-mdpi", w: 320, h: 480 },
    { dir: "drawable-port-hdpi", w: 480, h: 800 },
    { dir: "drawable-port-xhdpi", w: 720, h: 1280 },
    { dir: "drawable-port-xxhdpi", w: 1080, h: 1920 },
    { dir: "drawable-port-xxxhdpi", w: 1440, h: 2560 },
    { dir: "drawable-land-mdpi", w: 480, h: 320 },
    { dir: "drawable-land-hdpi", w: 800, h: 480 },
    { dir: "drawable-land-xhdpi", w: 1280, h: 720 },
    { dir: "drawable-land-xxhdpi", w: 1920, h: 1080 },
    { dir: "drawable-land-xxxhdpi", w: 2560, h: 1440 },
    { dir: "drawable", w: 480, h: 800 },
  ];

  const splashSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <rect width="800" height="800" fill="#ffffff"/>
    <text x="400" y="420" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="72" fill="#4F46E5" letter-spacing="-2">Evnting</text>
  </svg>`);

  for (const { dir, w, h } of splashSizes) {
    const outDir = join(ROOT, "android", "app", "src", "main", "res", dir);
    mkdirSync(outDir, { recursive: true });
    await sharp(splashSvg).resize(w, h, { fit: "contain", background: "#ffffff" }).png().toFile(join(outDir, "splash.png"));
    console.log(`  Splash ${dir}: ${w}x${h}`);
  }

  // iOS splash
  const iosDir = join(ROOT, "ios", "App", "App", "Assets.xcassets", "Splash.imageset");
  mkdirSync(iosDir, { recursive: true });
  for (const scale of [1, 2, 3]) {
    const px = 2732;
    const name = scale === 1 ? "splash-2732x2732.png" : `splash-2732x2732-${scale}.png`;
    await sharp(splashSvg).resize(px, px, { fit: "contain", background: "#ffffff" }).png().toFile(join(iosDir, name));
    console.log(`  iOS splash @${scale}x: ${px}x${px}`);
  }
}

console.log("Generating Android icons...");
await generateAndroid();
console.log("\nGenerating iOS icons...");
await generateIOS();
console.log("\nGenerating splash screens...");
await generateSplash();
console.log("\nDone!");

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.resolve(process.cwd(), "public");
const svgPath = path.join(publicDir, "icon.svg");

async function main() {
  const svg = await readFile(svgPath);

  const targets = [
    { name: "icon-light-32x32.png", size: 32 },
    { name: "icon-dark-32x32.png", size: 32 },
    { name: "apple-icon.png", size: 180 },
  ];

  for (const { name, size } of targets) {
    const out = await sharp(svg, { density: 512 })
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(path.join(publicDir, name), out);
    console.log(`Wrote ${name} (${size}x${size}, ${out.length} bytes)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

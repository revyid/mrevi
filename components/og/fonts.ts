import { readFile } from "node:fs/promises";
import { join } from "node:path";

const fontsDir = join(process.cwd(), "assets/og/fonts");

async function loadFont(name: string): Promise<ArrayBuffer> {
  const data = await readFile(join(fontsDir, name));
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

export async function poppinsFonts() {
  const [black, medium] = await Promise.all([
    loadFont("Poppins-Black.ttf"),
    loadFont("Poppins-Medium.ttf"),
  ]);

  return [
    { name: "Poppins", data: black, weight: 900 as const, style: "normal" as const },
    { name: "Poppins", data: medium, weight: 500 as const, style: "normal" as const },
  ];
}

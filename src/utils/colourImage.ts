import { createCanvas } from "canvas";

export function generateColourImage(hex: string, width = 500, height = 500): Buffer {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = `#${hex}`;
  ctx.fillRect(0, 0, width, height);
  return canvas.toBuffer("image/png");
}
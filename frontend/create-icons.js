import fs from "fs";
import { createCanvas } from "canvas";

// Create directory if it doesn't exist
if (!fs.existsSync("./public")) {
  fs.mkdirSync("./public");
}

// Create a placeholder icon
function createIcon(size, color = "#3490dc") {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = "white";
  ctx.font = `bold ${size / 4}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SLP", size / 2, size / 2);

  // Save to file
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(`./public/icon-${size}x${size}.png`, buffer);
  console.log(`Created icon-${size}x${size}.png`);
}

// Create icons
createIcon(192);
createIcon(512);

console.log("Icons created successfully!");
